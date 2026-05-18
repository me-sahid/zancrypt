"""
Ephemeral Share Auto-Deletion Service
======================================
Core logic for the Zancrypt zero-knowledge ephemeral share engine.

Provides delete_share_and_shards() — called by:
  - The Celery TTL expiry worker (every 5 minutes)
  - The download-limit trigger in the share router (BackgroundTask)
  - Manual revocation (optional future extension)

Zero-knowledge guarantee: no decryption key is ever read, logged, or
transmitted here. We only manipulate shard IDs and node URLs.
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Literal

import httpx
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.audit import AuditLog
from app.models.file import File
from app.models.manifest import Manifest
from app.models.notification import Notification
from app.models.pending_deletion import PendingDeletion
from app.models.share import Share
from app.models.shard_registry import ShardRegistry
from app.models.node_registry import NodeRegistry
from app.models.user import User

logger = logging.getLogger(__name__)

DeletionTrigger = Literal["ttl_expiry", "download_limit", "manual", "cascade"]

# ---------------------------------------------------------------------------
# Coordinator secret header sent to storage nodes for authenticated deletes
# ---------------------------------------------------------------------------
_COORDINATOR_HEADERS = {
    "x-coordinator-secret": getattr(settings, "COORDINATOR_SECRET", ""),
}


async def _delete_shard_from_node(
    shard_id: str,
    node_url: str,
    file_id: int,
    session: AsyncSession,
) -> bool:
    """
    Attempt DELETE /shards/{shard_id} on a single storage node.

    Returns True on success, False on failure.
    Failed attempts are logged to pending_deletions for the retry worker.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.delete(
                f"{node_url.rstrip('/')}/shards/{shard_id}",
                headers=_COORDINATOR_HEADERS,
            )
        if resp.status_code in (200, 204, 404):
            # 404 is acceptable — shard already gone
            return True
        raise httpx.HTTPStatusError(
            f"Node returned {resp.status_code}", request=None, response=resp
        )
    except Exception as exc:
        error_msg = str(exc)[:512]
        logger.warning(
            "Failed to delete shard %s from node %s: %s",
            shard_id, node_url, error_msg
        )
        # Queue for retry — do NOT let this failure block sibling shard deletions
        pending = PendingDeletion(
            shard_id=shard_id,
            node_url=node_url,
            file_id=file_id,
            last_error=error_msg,
        )
        session.add(pending)
        return False


async def delete_share_and_shards(
    share_id,
    session: AsyncSession,
    *,
    delete_source_file: bool,
    trigger: DeletionTrigger,
) -> None:
    """
    Atomically revoke a share and, when requested, destroy all file shards
    across every storage node.

    Steps (in order to satisfy the zero-knowledge atomicity contract):
      1. Set is_active=False immediately — no new downloads possible.
      2. If delete_source_file:
         a. Fetch all shard/node pairs for the file.
         b. Call DELETE on every node in parallel (allSettled — failures queued).
         c. In a single DB transaction: delete shard_registry rows, manifest,
            file row, and decrement user storage quota.
      3. Insert SHARE_AUTO_DELETED audit log entry.
      4. Insert in-app Notification if notify_on_expire is set.
    """
    # ── Step 1: Revoke the share immediately ─────────────────────────────────
    stmt = select(Share).where(Share.share_id == share_id)
    result = await session.execute(stmt)
    db_share: Share | None = result.scalar_one_or_none()

    if not db_share:
        logger.warning("delete_share_and_shards: share %s not found", share_id)
        return

    db_share.is_active = False
    await session.commit()   # commit early — access is revoked before any node call

    file_id: int = db_share.file_id
    owner_user_id: int = db_share.owner_user_id
    notify: bool = db_share.notify_on_expire

    # ── Step 2: Destroy source file shards ──────────────────────────────────
    file_name: str | None = None
    file_size: int = 0

    if delete_source_file:
        try:
            # a. Load the file record for its size and owner
            file_stmt = select(File).where(File.id == file_id)
            file_result = await session.execute(file_stmt)
            db_file: File | None = file_result.scalar_one_or_none()

            if not db_file:
                logger.warning(
                    "delete_share_and_shards: file %s not found; skipping shard deletion",
                    file_id,
                )
            else:
                file_name = db_file.encrypted_filename
                file_size = db_file.file_size or 0

                # b. Fetch all (shard_id, node_url) pairs for this file
                shard_stmt = (
                    select(ShardRegistry, NodeRegistry)
                    .join(NodeRegistry, ShardRegistry.node_id == NodeRegistry.id)
                    .where(ShardRegistry.file_id == file_id)
                )
                shard_result = await session.execute(shard_stmt)
                shard_rows = shard_result.all()

                # c. Fire DELETE to every node in parallel — one failure must NOT
                #    prevent deletion of other shards (Promise.allSettled equivalent)
                tasks = [
                    _delete_shard_from_node(
                        shard.shard_id,
                        node.node_metadata.get("url", "") if node.node_metadata else "",
                        file_id,
                        session,
                    )
                    for shard, node in shard_rows
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                success_count = sum(1 for r in results if r is True)
                logger.info(
                    "Shard deletion for file %s: %d/%d succeeded",
                    file_id, success_count, len(tasks),
                )

                # d. DB transaction: remove shard registry, manifest, file record,
                #    and decrement user storage quota atomically
                async with session.begin_nested():
                    await session.execute(
                        delete(ShardRegistry).where(ShardRegistry.file_id == file_id)
                    )
                    await session.execute(
                        delete(Manifest).where(Manifest.file_id == file_id)
                    )
                    await session.execute(
                        delete(File).where(File.id == file_id)
                    )
                    await session.execute(
                        update(User)
                        .where(User.id == owner_user_id)
                        .values(storage_used=User.storage_used - file_size)
                    )

                await session.commit()

        except Exception as exc:
            logger.error(
                "delete_share_and_shards: error during file deletion for file %s: %s",
                file_id, exc, exc_info=True,
            )
            await session.rollback()
            # Do not re-raise — audit log and notification still proceed

    # ── Step 3: Audit log ────────────────────────────────────────────────────
    try:
        audit = AuditLog(
            user_id=owner_user_id,
            action="SHARE_AUTO_DELETED",
            resource=str(share_id),
            status="success",
            metadata_json={
                "trigger": trigger,
                "file_id": file_id,
                "delete_source_file": delete_source_file,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        session.add(audit)
        await session.commit()
    except Exception as exc:
        logger.error("Failed to write audit log for share %s: %s", share_id, exc)

    # ── Step 4: In-app notification ──────────────────────────────────────────
    if notify:
        await send_expiry_notification(
            user_id=owner_user_id,
            file_id=file_id,
            trigger=trigger,
            file_name=file_name,
            session=session,
        )


async def send_expiry_notification(
    user_id: int,
    file_id: int | None,
    trigger: DeletionTrigger,
    file_name: str | None,
    session: AsyncSession,
) -> None:
    """
    Insert an in-app notification record so the NotificationBell component
    can display it to the user.

    TODO: Add email delivery via aiosmtplib / SendGrid SDK when an SMTP
          integration is configured. Example stub:
          
          if settings.SMTP_HOST:
              await send_email(
                  to=user_email,
                  subject="Zancrypt: Your file was auto-deleted",
                  body=f"File '{file_name}' was deleted (trigger: {trigger})."
              )
    """
    try:
        notification = Notification(
            user_id=user_id,
            type="FILE_AUTO_DELETED",
            file_id=file_id,
            file_name=file_name or "Unknown file",
            trigger=trigger,
            is_read=False,
        )
        session.add(notification)
        await session.commit()
        logger.info(
            "Expiry notification created for user %s (trigger=%s)", user_id, trigger
        )
    except Exception as exc:
        logger.error(
            "Failed to create expiry notification for user %s: %s", user_id, exc
        )
