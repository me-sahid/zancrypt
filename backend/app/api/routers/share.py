import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID
from urllib.parse import quote
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_async_session, get_current_user
from app.models.file import File
from app.models.manifest import Manifest
from app.models.share import Share

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

# --- Request / Response Pydantic Schemas ---
class ShareCreateRequest(BaseModel):
    file_id: int
    ttl_hours: Optional[float] = None  # None or 0 = Never
    max_downloads: Optional[int] = None  # None or 0 = Unlimited
    label: Optional[str] = None
    allow_downloads: Optional[bool] = True


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
    allow_downloads: bool

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
    allow_downloads: bool

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
        allow_downloads=payload.allow_downloads if payload.allow_downloads is not None else True,
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
            label=share.label,
            allow_downloads=share.allow_downloads if getattr(share, "allow_downloads", None) is not None else True
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
    if db_share.max_downloads and db_share.download_count >= db_share.max_downloads:
        db_share.is_active = False

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



    return SharedFileResponse(
        file_id=file.id,
        encrypted_filename=file.encrypted_filename,
        encrypted_metadata=file.encrypted_metadata,
        file_size=file.file_size,
        integrity_hash=file.integrity_hash,
        manifest=manifest_data,
        shards=shards_list,
        allow_downloads=db_share.allow_downloads if getattr(db_share, "allow_downloads", None) is not None else True
    )




from fastapi import Request, Response
from app.services.wrapper_generator_service import generate_self_destruct_wrapper
from app.models.wrapper_destruction import WrapperDestruction
from app.models.audit import AuditLog

class WrapperGenerateRequest(BaseModel):
    file_id: int
    timer_seconds: int
    share_token: str
    file_name: Optional[str] = None
    mime_type: Optional[str] = None

class WrapperDestroyedRequest(BaseModel):
    file_id: str
    destroyed_at: int

@router.post("/generate-wrapper")
async def generate_wrapper(
    payload: WrapperGenerateRequest,
    request: Request,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Fetches shards, reassembles them, and wraps the AES ciphertext bytes
    into a secure self-destructing HTML wrapper.
    """
    # 1. Verify file ownership
    file_stmt = select(File).where(File.id == payload.file_id, File.owner_id == current_user.id)
    file_result = await session.execute(file_stmt)
    db_file = file_result.scalar_one_or_none()
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied or file not found"
        )

    # 2. Check file size limit (maximum 200MB for in-browser memory buffers)
    MAX_WRAPPER_SIZE = 200 * 1024 * 1024
    if db_file.file_size and db_file.file_size > MAX_WRAPPER_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large for wrapper generation. Maximum size is 200MB."
        )

    # 3. Verify share token matches file
    share_stmt = select(Share).where(Share.share_token == payload.share_token, Share.file_id == payload.file_id)
    share_result = await session.execute(share_stmt)
    db_share = share_result.scalar_one_or_none()
    if not db_share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valid share link not found for this file"
        )

    # 4. Fetch manifest
    manifest_stmt = select(Manifest).where(Manifest.file_id == payload.file_id)
    manifest_result = await session.execute(manifest_stmt)
    db_manifest = manifest_result.scalar_one_or_none()
    if not db_manifest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File manifest not found"
        )

    # 5. Reassemble storage shards
    storage_router = StorageRouter()
    file_bytes = b""
    for shard_info in db_manifest.replication_mapping:
        shard_id = shard_info["shard_id"]
        target_nodes = shard_info["nodes"]
        shard_bytes = await storage_router.fetch_shard(shard_id, target_nodes)
        
        if not shard_bytes:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Shard registry error: {shard_id} offline across all replication layers"
            )
        file_bytes += shard_bytes

    # 6. Generate wrapper HTML string
    wrapper_options = {
        "file_bytes": file_bytes,
        "file_name": payload.file_name or db_file.encrypted_filename,
        "mime_type": payload.mime_type or "application/octet-stream",
        "timer_seconds": payload.timer_seconds,
        "file_id": payload.file_id,
        "share_token": payload.share_token,
        "owner_name": current_user.username or "Anonymous User",
    }
    wrapper_html_bytes, key_hash = generate_self_destruct_wrapper(wrapper_options)

    # VULN-010 fix: Store the timer value on the Share record so the server can enforce it
    db_share.wrapper_timer_seconds = payload.timer_seconds

    # 7. Record to Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="WRAPPER_GENERATED",
        resource=str(payload.file_id),
        status="success",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", ""),
        metadata_json={
            "timer_seconds": payload.timer_seconds,
            "file_name": payload.file_name or db_file.encrypted_filename
        }
    )
    session.add(audit)
    await session.commit()


    # 8. Stream as dynamic attachment file download
    # The key_hash is returned in a header so the frontend can append it to the URL fragment.
    # It is intentionally NOT embedded in the HTML file (see VULN-003 fix).
    filename = payload.file_name or db_file.encrypted_filename
    encoded_filename = quote(filename)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}_zancrypt_protected.html",
        "X-Wrapper-Key": key_hash,
        "Access-Control-Expose-Headers": "X-Wrapper-Key",
    }
    return Response(
        content=wrapper_html_bytes,
        media_type="text/html",
        headers=headers
    )

@router.post("/destroyed")
@limiter.limit("20/minute")
async def wrapper_destroyed(
    payload: WrapperDestroyedRequest,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Best-effort callback receiver when wrapper client-side self-destructs.
    Inserts record into wrapper_destructions.
    Rate limited to 20/minute per IP to prevent telemetry flooding.
    """
    user_agent = request.headers.get("user-agent", "")[:500]
    
    file_int_id = None
    try:
        file_int_id = int(payload.file_id)
    except ValueError:
        pass

    destruction = WrapperDestruction(
        file_id=file_int_id,
        client_timestamp=payload.destroyed_at,
        user_agent=user_agent
    )
    session.add(destruction)
    await session.commit()
    return Response(status_code=204)


def get_python_mime_type(filename: str) -> str:
    if not filename:
        return "application/octet-stream"
    ext = filename.split(".")[-1].lower()
    mimes = {
        "mp4": "video/mp4",
        "mov": "video/quicktime",
        "webm": "video/webm",
        "mkv": "video/x-matroska",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "gif": "image/gif",
        "heic": "image/heic",
        "heif": "image/heif",
        "pdf": "application/pdf",
        "txt": "text/plain",
        "html": "text/html",
        "zip": "application/zip",
    }
    return mimes.get(ext, "application/octet-stream")


@router.get("/w/{token}")
async def download_public_wrapper(
    token: str,
    t: int = 3600,  # countdown timer in seconds, default 1 hour
    session: AsyncSession = Depends(get_async_session)
):
    """
    Public GET endpoint:
    Fetches the encrypted shards, compiles them into a self-destructing
    HTML wrapper directly, and streams it back to the client as an attachment.
    """
    # 1. Fetch and validate share
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

    if not db_share.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link is no longer active"
        )

    # Check Expiration (TTL)
    if db_share.expires_at:
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

    # VULN-010 fix: Server-side wrapper timer enforcement
    # Use the stored timer from the share record (not the client-supplied ?t= param)
    effective_timer = db_share.wrapper_timer_seconds or t
    if db_share.first_accessed_at is not None and db_share.wrapper_timer_seconds:
        first_tz = db_share.first_accessed_at
        if first_tz.tzinfo is None:
            first_tz = first_tz.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - first_tz).total_seconds()
        if elapsed > db_share.wrapper_timer_seconds:
            db_share.is_active = False
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This secure wrapper has expired (server-side timer elapsed)"
            )
    elif db_share.first_accessed_at is None:
        # Stamp first access time
        db_share.first_accessed_at = datetime.now(timezone.utc)

    # Increment download count
    db_share.download_count += 1
    if db_share.max_downloads and db_share.download_count >= db_share.max_downloads:
        db_share.is_active = False


    # Fetch file details
    db_file = db_share.file
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked file not found"
        )

    # Verify size limit (up to 200MB)
    MAX_WRAPPER_SIZE = 200 * 1024 * 1024
    if db_file.file_size and db_file.file_size > MAX_WRAPPER_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large for wrapper generation. Maximum size is 200MB."
        )

    # Load manifest and nodes assignment
    manifest_stmt = select(Manifest).where(Manifest.file_id == db_share.file_id)
    manifest_result = await session.execute(manifest_stmt)
    db_manifest = manifest_result.scalar_one_or_none()

    if not db_manifest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File manifest not found"
        )

    # Reassemble shards
    storage_router = StorageRouter()
    file_bytes = b""
    
    for shard_info in db_manifest.replication_mapping:
        shard_id = shard_info["shard_id"]
        target_nodes = shard_info["nodes"]
        shard_bytes = await storage_router.fetch_shard(shard_id, target_nodes)
        
        if not shard_bytes:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Shard registry error: {shard_id} offline across all replication layers"
            )
        
        file_bytes += shard_bytes

    # Fetch owner user to customize HTML
    from app.models.user import User
    owner_stmt = select(User).where(User.id == db_share.owner_user_id)
    owner_result = await session.execute(owner_stmt)
    owner_user = owner_result.scalar_one_or_none()
    owner_name = owner_user.username if owner_user else "Anonymous User"

    # Generate HTML wrapper
    wrapper_options = {
        "file_bytes": file_bytes,
        "file_name": db_file.encrypted_filename,
        "mime_type": get_python_mime_type(db_file.encrypted_filename),
        "timer_seconds": t,
        "file_id": db_share.file_id,
        "share_token": token,
        "owner_name": owner_name,
    }
    
    wrapper_html_bytes, key_hash = generate_self_destruct_wrapper(wrapper_options)

    # Save download count changes
    await session.commit()

    # Stream as dynamic attachment file download
    # Key is returned as a response header — NOT embedded in HTML (VULN-003 fix)
    filename = db_file.encrypted_filename
    encoded_filename = quote(filename)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}_zancrypt_protected.html",
        "X-Wrapper-Key": key_hash,
        "Access-Control-Expose-Headers": "X-Wrapper-Key",
    }
    return Response(
        content=wrapper_html_bytes,
        media_type="text/html",
        headers=headers
    )



