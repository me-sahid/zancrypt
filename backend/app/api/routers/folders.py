from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_current_user
from app.schemas.folder import FolderCreate, FolderUpdate, FolderResponse
from app.services.folder_service import FolderService

router = APIRouter()

@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: FolderCreate,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    folder = await service.create_folder(current_user.id, folder_in)
    await session.commit()
    return folder

@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[int] = None,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    return await service.list_folders(current_user.id, parent_id)

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_in: FolderUpdate,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    folder = await service.update_folder(folder_id, current_user.id, folder_in)
    await session.commit()
    return folder

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FolderService(session)
    await service.delete_folder(folder_id, current_user.id)
    await session.commit()
