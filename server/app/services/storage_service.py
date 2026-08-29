from sqlalchemy.ext.asyncio import AsyncSession

from app.storage.routing import StorageRouter

class StorageService:
    def __init__(self, session: AsyncSession) -> None:
        self.router = StorageRouter()

    async def route_upload(self, file_id: int, shards: list) -> None:
        await self.router.distribute_shards(file_id, shards)

    async def fetch_shards(self, file_id: int):
        return self.router.fetch_shard_stream(file_id)
