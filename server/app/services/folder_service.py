from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.folder import Folder
from app.schemas.folder import FolderCreate, FolderUpdate

class FolderService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_folder(self, user_id: int, folder_in: FolderCreate) -> Folder:
        if folder_in.parent_id:
            parent = await self.get_folder(folder_in.parent_id, user_id)
            if not parent:
                raise HTTPException(status_code=404, detail="Parent folder not found")

        folder = Folder(
            owner_id=user_id,
            encrypted_name=folder_in.encrypted_name,
            parent_id=folder_in.parent_id
        )
        self.session.add(folder)
        await self.session.flush()
        return folder

    async def list_folders(self, user_id: int, parent_id: Optional[int] = None) -> List[Folder]:
        query = select(Folder).where(Folder.owner_id == user_id)
        if parent_id is not None:
            query = query.where(Folder.parent_id == parent_id)
        else:
            query = query.where(Folder.parent_id.is_(None))
        
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_folder(self, folder_id: int, user_id: int) -> Folder:
        result = await self.session.execute(
            select(Folder).where(Folder.id == folder_id, Folder.owner_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_folder(self, folder_id: int, user_id: int, folder_in: FolderUpdate) -> Folder:
        folder = await self.get_folder(folder_id, user_id)
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if folder_in.encrypted_name is not None:
            folder.encrypted_name = folder_in.encrypted_name
        if folder_in.parent_id is not None:
            folder.parent_id = folder_in.parent_id
        
        await self.session.flush()
        return folder

    async def delete_folder(self, folder_id: int, user_id: int) -> None:
        folder = await self.get_folder(folder_id, user_id)
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Verify it's empty or cascade delete? Usually just don't allow delete if not empty.
        # Check subfolders
        sub_query = select(Folder).where(Folder.parent_id == folder_id)
        sub_res = await self.session.execute(sub_query)
        if sub_res.scalars().first():
            raise HTTPException(status_code=400, detail="Cannot delete folder with subfolders")
            
        # Check files
        from app.models.file import File
        file_query = select(File).where(File.folder_id == folder_id)
        file_res = await self.session.execute(file_query)
        if file_res.scalars().first():
            raise HTTPException(status_code=400, detail="Cannot delete non-empty folder")

        await self.session.delete(folder)
        await self.session.flush()

    async def get_folder_stats(self, folder_id: int, user_id: int) -> dict:
        folder = await self.get_folder(folder_id, user_id)
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        from app.models.file import File
        from sqlalchemy import func
        from sqlalchemy.orm import aliased

        base_folder = select(Folder.id).where(Folder.id == folder_id, Folder.owner_id == user_id).cte(name="folder_tree", recursive=True)
        alias_folder = aliased(Folder)
        base_folder = base_folder.union_all(
            select(alias_folder.id).where(alias_folder.parent_id == base_folder.c.id)
        )

        stats_query = select(
            func.sum(File.file_size).label("total_size"),
            func.count(File.id).label("total_count")
        ).where(
            File.folder_id.in_(select(base_folder.c.id)),
            File.is_deleted == False
        )

        res = await self.session.execute(stats_query)
        row = res.first()
        return {
            "size": row.total_size or 0,
            "count": row.total_count or 0
        }
