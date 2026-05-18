import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_async_session, get_current_user
from app.models.file import File
from app.models.manifest import Manifest
from app.models.share import Share

router = APIRouter()

# --- Request / Response Pydantic Schemas ---
class ShareCreateRequest(BaseModel):
    file_id: int
    ttl_hours: Optional[float] = None  # None or 0 = Never
    max_downloads: Optional[int] = None  # None or 0 = Unlimited
    label: Optional[str] = None
    delete_original: bool = False
    notify_on_expire: bool = True

class ShareCreateResponse(BaseModel):
    share_token: str

class ShareListItem(BaseModel):
    share_id: UUID
    file_id: int
    encrypted_filename: str
    share_token: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    max_downloads: Optional[int] = None
    download_count: int
    is_active: bool
    label: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

from app.storage.routing import StorageRouter

class SharedFileResponse(BaseModel):
    file_id: int
    encrypted_filename: str
    encrypted_metadata: str
    file_size: int
    integrity_hash: str
    manifest: dict
    shards: List[dict]  # Contains list of { shard_id, data (hex) }

# --- API Endpoints ---

@router.post("/create", response_model=ShareCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    payload: ShareCreateRequest,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Creates a new Zero-Knowledge secure share link record.
    The encryption key itself is handled purely in the browser fragment (#key)
    and never reaches the backend database.
    """
    # 1. Verify file ownership
    stmt = select(File).where(File.id == payload.file_id, File.owner_id == current_user.id)
    result = await session.execute(stmt)
    db_file = result.scalar_one_or_none()
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied or file not found"
        )

    # 2. Generate a secure, unique share token
    share_token = secrets.token_urlsafe(32)

    # 3. Calculate optional expiration timestamp
    expires_at = None
    if payload.ttl_hours and payload.ttl_hours > 0:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.ttl_hours)

    # 4. Save share entry to database
    db_share = Share(
        file_id=payload.file_id,
        owner_user_id=current_user.id,
        share_token=share_token,
        expires_at=expires_at,
        max_downloads=payload.max_downloads if payload.max_downloads and payload.max_downloads > 0 else None,
        download_count=0,
        is_active=True,
        label=payload.label,
        delete_original=payload.delete_original,
        notify_on_expire=payload.notify_on_expire,
    )
    
    session.add(db_share)
    await session.commit()
    return {"share_token": share_token}


@router.get("/list", response_model=List[ShareListItem])
async def list_shares(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Returns a list of all active/expired file share links created by the current authenticated user.
    """
    stmt = (
        select(Share)
        .options(selectinload(Share.file))
        .where(Share.owner_user_id == current_user.id)
        .order_by(Share.created_at.desc())
    )
    result = await session.execute(stmt)
    shares = result.scalars().all()

    response_items = []
    for share in shares:
        response_items.append(ShareListItem(
            share_id=share.share_id,
            file_id=share.file_id,
            encrypted_filename=share.file.encrypted_filename if share.file else "Unknown File",
            share_token=share.share_token,
            created_at=share.created_at,
            expires_at=share.expires_at,
            max_downloads=share.max_downloads,
            download_count=share.download_count,
            is_active=share.is_active,
            label=share.label
        ))
    return response_items


@router.delete("/{token}", status_code=status.HTTP_200_OK)
async def revoke_share(
    token: str,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Revokes an active share link (soft-delete by setting is_active=false).
    """
    stmt = select(Share).where(Share.share_token == token, Share.owner_user_id == current_user.id)
    result = await session.execute(stmt)
    db_share = result.scalar_one_or_none()
    
    if not db_share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found or unauthorized"
        )
    
    db_share.is_active = False
    await session.commit()
    return {"status": "revoked"}


from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

@router.get("/{token}", response_model=SharedFileResponse)
async def get_shared_file(
    token: str,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Public endpoint: retrieves file shards map and metadata for a valid share token.
    Enforces expiry times, download limits, and active status.
    If the max_downloads limit is hit during this request, it triggers an async
    auto-deletion workflow (if configured).
    """
    stmt = (
        select(Share)
        .options(selectinload(Share.file))
        .where(Share.share_token == token)
    )
    result = await session.execute(stmt)
    db_share = result.scalar_one_or_none()

    if not db_share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )

    # Check active status
    if not db_share.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has been revoked by the owner"
        )

    # Check Expiration (TTL)
    if db_share.expires_at:
        # Normalize comparison to ensure timezone-awareness
        expires_tz = db_share.expires_at
        if expires_tz.tzinfo is None:
            expires_tz = expires_tz.replace(tzinfo=timezone.utc)
            
        if datetime.now(timezone.utc) > expires_tz:
            db_share.is_active = False
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This share link has expired"
            )

    # Check Download Limit
    if db_share.max_downloads and db_share.download_count >= db_share.max_downloads:
        db_share.is_active = False
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has reached its maximum download limit"
        )

    # Increment download counter (commit later, after successfully reading shards to be safe)
    db_share.download_count += 1
    trigger_deletion = False
    
    if db_share.max_downloads and db_share.download_count >= db_share.max_downloads:
        db_share.is_active = False
        trigger_deletion = True

    # Load manifest and nodes assignment
    manifest_stmt = select(Manifest).where(Manifest.file_id == db_share.file_id)
    manifest_result = await session.execute(manifest_stmt)
    db_manifest = manifest_result.scalar_one_or_none()

    if not db_manifest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File manifest not found"
        )

    # Fetch shards from storage nodes (failover-enabled rendezvous mapping)
    storage_router = StorageRouter()
    shards_list = []
    
    for shard_info in db_manifest.replication_mapping:
        shard_id = shard_info["shard_id"]
        target_nodes = shard_info["nodes"]
        shard_bytes = await storage_router.fetch_shard(shard_id, target_nodes)
        
        if not shard_bytes:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Shard registry error: {shard_id} offline across all replication layers"
            )
        
        shards_list.append({
            "shard_id": shard_id,
            "data": shard_bytes.hex()
        })

    # Save download count changes
    await session.commit()

    file = db_share.file
    manifest_data = {
        "file_id": db_manifest.file_id,
        "manifest_payload": db_manifest.manifest_payload,
        "node_assignments": db_manifest.node_assignments,
        "replication_mapping": db_manifest.replication_mapping,
        "version_reference": db_manifest.version_reference,
    }

    # Trigger async auto-deletion if max downloads hit
    if trigger_deletion:
        background_tasks.add_task(_trigger_async_deletion, db_share.share_id, db_share.delete_original)

    return SharedFileResponse(
        file_id=file.id,
        encrypted_filename=file.encrypted_filename,
        encrypted_metadata=file.encrypted_metadata,
        file_size=file.file_size,
        integrity_hash=file.integrity_hash,
        manifest=manifest_data,
        shards=shards_list
    )

async def _trigger_async_deletion(share_id, delete_original: bool):
    """
    Wrapper for background task to call the ephemeral service.
    FastAPI BackgroundTasks require a new DB session since the request one is closed.
    """
    from app.db import async_session_factory
    from app.services.ephemeral_service import delete_share_and_shards
    try:
        async with async_session_factory() as local_session:
            await delete_share_and_shards(
                share_id=share_id,
                session=local_session,
                delete_source_file=delete_original,
                trigger="download_limit"
            )
    except Exception as exc:
        import logging
        logging.error("Failed to execute async deletion trigger: %s", exc)

