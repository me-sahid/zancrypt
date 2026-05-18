"""
Expiry Worker — Celery tasks for the ephemeral share auto-deletion engine.

Two scheduled jobs:
  1. expire_shares      — every 5 min  — finds TTL-expired shares, triggers deletion
  2. retry_pending_deletions — every 30 min — retries failed shard DELETE calls

Both run synchronously in Celery worker processes, using asyncio.run() to
bridge into the async service layer.
"""
import asyncio
import logging
import time
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import async_session_factory
from app.models.pending_deletion import PendingDeletion
from app.models.share import Share
from app.services.ephemeral_service import delete_share_and_shards
from app.workers.celery_app import celery_app

import httpx

logger = logging.getLogger(__name__)

# Coordinator secret for authenticating shard-delete calls to storage nodes
from app.core.config import settings
_COORDINATOR_HEADERS = {
    "x-coordinator-secret": getattr(settings, "COORDINATOR_SECRET", ""),
}


# ──────────────────────────────────────────────────────────────────────────────
# Task 1: TTL Expiry Worker (scheduled every 5 minutes via Celery Beat)
# ──────────────────────────────────────────────────────────────────────────────

async def _run_expire_shares() -> int:
    """
    Async core of the TTL expiry worker.

    Finds up to 100 active shares whose expires_at has passed, then calls
    delete_share_and_shards() for each with a 50ms sleep between to avoid
    hammering the database.

    Returns the count of shares processed.
    """
    logger.info("[expire_shares] Worker started at %s", datetime.now(timezone.utc).isoformat())
    start = time.monotonic()
    processed = 0

    async with async_session_factory() as session:
        # Find expired active shares (uses idx_shares_expiry partial index)
        stmt = (
            select(Share)
            .where(
                Share.is_active == True,
                Share.expires_at.isnot(None),
                Share.expires_at < datetime.now(timezone.utc),
            )
            .limit(100)
        )
        result = await session.execute(stmt)
        expired_shares = result.scalars().all()

        logger.info("[expire_shares] Found %d expired shares to process", len(expired_shares))

        for share in expired_shares:
            try:
                await delete_share_and_shards(
                    share_id=share.share_id,
                    session=session,
                    delete_source_file=share.delete_original,
                    trigger="ttl_expiry",
                )
                processed += 1
            except Exception as exc:
                logger.error(
                    "[expire_shares] Failed to process share %s: %s",
                    share.share_id, exc, exc_info=True,
                )
            # 50ms delay between each to avoid DB contention
            await asyncio.sleep(0.05)

    elapsed = time.monotonic() - start
    logger.info(
        "[expire_shares] Completed: %d shares processed in %.2fs", processed, elapsed
    )
    return processed


@celery_app.task(name="app.workers.expiry_worker.expire_shares", bind=True)
def expire_shares(self) -> dict:
    """
    Celery task: process all TTL-expired shares.
    Scheduled via Beat every 5 minutes.
    """
    try:
        count = asyncio.run(_run_expire_shares())
        return {"status": "ok", "processed": count}
    except Exception as exc:
        logger.error("[expire_shares] Task failed: %s", exc, exc_info=True)
        raise self.retry(exc=exc, countdown=60, max_retries=3)


# ──────────────────────────────────────────────────────────────────────────────
# Task 2: Pending Deletion Retry Worker (scheduled every 30 minutes)
# ──────────────────────────────────────────────────────────────────────────────

async def _run_retry_pending_deletions() -> dict:
    """
    Async core of the pending-deletion retry worker.

    Picks up shard deletion failures older than 10 minutes and retries the
    DELETE /shards/:shard_id call on each node.
    - On success: removes the pending_deletions row.
    - On failure: increments retry_count and updates last_error.
    """
    logger.info("[retry_pending] Worker started at %s", datetime.now(timezone.utc).isoformat())
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
    success_count = 0
    fail_count = 0

    async with async_session_factory() as session:
        stmt = (
            select(PendingDeletion)
            .where(PendingDeletion.failed_at < cutoff)
            .order_by(PendingDeletion.failed_at)
            .limit(200)
        )
        result = await session.execute(stmt)
        pending_rows = result.scalars().all()

        logger.info("[retry_pending] Found %d pending shard deletions to retry", len(pending_rows))

        for row in pending_rows:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.delete(
                        f"{row.node_url.rstrip('/')}/shards/{row.shard_id}",
                        headers=_COORDINATOR_HEADERS,
                    )
                if resp.status_code in (200, 204, 404):
                    # Success or shard already gone — remove from queue
                    await session.execute(
                        sa_delete(PendingDeletion).where(
                            PendingDeletion.pending_deletion_id == row.pending_deletion_id
                        )
                    )
                    success_count += 1
                else:
                    raise Exception(f"Node returned HTTP {resp.status_code}")
            except Exception as exc:
                row.retry_count += 1
                row.last_error = str(exc)[:512]
                fail_count += 1
                logger.warning(
                    "[retry_pending] Shard %s on %s still failing (attempt %d): %s",
                    row.shard_id, row.node_url, row.retry_count, exc,
                )

        await session.commit()

    logger.info(
        "[retry_pending] Done: %d succeeded, %d still failing", success_count, fail_count
    )
    return {"success": success_count, "still_failing": fail_count}


@celery_app.task(name="app.workers.expiry_worker.retry_pending_deletions", bind=True)
def retry_pending_deletions(self) -> dict:
    """
    Celery task: retry failed shard deletion calls.
    Scheduled via Beat every 30 minutes.
    """
    try:
        return asyncio.run(_run_retry_pending_deletions())
    except Exception as exc:
        logger.error("[retry_pending] Task failed: %s", exc, exc_info=True)
        raise self.retry(exc=exc, countdown=120, max_retries=3)
