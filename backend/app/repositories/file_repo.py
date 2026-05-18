from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File

class FileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_file_record(
        self, 
        owner_id: int, 
        encrypted_filename: str, 
        encrypted_metadata: str, 
        file_size: int,
        integrity_hash: str,
        thumbnail: str = None
    ) -> File:
        file = File(
            owner_id=owner_id,
            encrypted_filename=encrypted_filename,
            encrypted_metadata=encrypted_metadata,
            file_size=file_size,
            integrity_hash=integrity_hash,
            thumbnail=thumbnail,
        )
        self.session.add(file)
        await self.session.flush()
        return file

    async def get_owned_file(self, file_id: int, owner_id: int) -> File | None:
        result = await self.session.execute(select(File).where(File.id == file_id, File.owner_id == owner_id))
        return result.scalar_one_or_none()

    async def list_files_for_user(self, owner_id: int) -> List[File]:
        result = await self.session.execute(select(File).where(File.owner_id == owner_id, File.is_deleted == False))
        return list(result.scalars().all())

    async def list_deleted_files_for_user(self, owner_id: int) -> List[File]:
        result = await self.session.execute(select(File).where(File.owner_id == owner_id, File.is_deleted == True))
        return list(result.scalars().all())

    async def delete_file(self, file_id: int) -> None:
        result = await self.session.execute(select(File).where(File.id == file_id))
        file = result.scalar_one_or_none()
        if file:
            await self.session.delete(file)

    async def update_file_record(self, file_id: int, owner_id: int, **kwargs) -> File | None:
        file = await self.get_owned_file(file_id, owner_id)
        if not file:
            return None
        for key, value in kwargs.items():
            if hasattr(file, key):
                setattr(file, key, value)
        await self.session.flush()
        return file
