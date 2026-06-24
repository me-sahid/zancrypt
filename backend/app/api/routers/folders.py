from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Security, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_async_session, get_current_user, get_current_user_or_api_key
from app.models.folder import Folder
from app.schemas.folder import FolderCreate, FolderUpdate, FolderResponse
from app.services.folder_service import FolderService
from app.api.routers.share import limiter

router = APIRouter()

@router.get("/by-uuid/{folder_uuid}", response_model=FolderResponse)
@limiter.limit("60/minute")
async def get_folder_by_uuid(
    request: Request,
    folder_uuid: UUID,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Resolve a folder UUID to its metadata. Used by the frontend for UUID-based URL routing.
    Security: Returns 404 for BOTH non-existent AND unauthorized folders — never 403.
    This prevents attackers from probing whether a UUID exists without ownership.
    """
    result = await session.execute(
        select(Folder).where(
            Folder.folder_uuid == folder_uuid,
            Folder.owner_id == current_user.id,
        )
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: FolderCreate,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    folder = await service.create_folder(current_user.id, folder_in)
    await session.commit()
    return folder

@router.get("", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[int] = None,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    return await service.list_folders(current_user.id, parent_id)

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_in: FolderUpdate,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    folder = await service.update_folder(folder_id, current_user.id, folder_in)
    await session.commit()
    return folder

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    await service.delete_folder(folder_id, current_user.id)
    await session.commit()

@router.get("/{folder_id}/stats")
async def get_folder_stats(
    folder_id: int,
    current_user=Security(get_current_user_or_api_key, scopes=["storage"]),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    stats = await service.get_folder_stats(folder_id, current_user.id)
    return stats
