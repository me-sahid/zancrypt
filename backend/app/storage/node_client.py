from typing import AsyncIterator

class StorageNodeClient:
    def __init__(self, node_name: str, endpoint: str) -> None:
        self.node_name = node_name
        self.endpoint = endpoint

    async def upload_shard(self, shard_id: str, payload: bytes) -> None:
        # Simulated encrypted shard persistence
        return None

    async def fetch_shard(self, shard_id: str) -> bytes:
        return b"encrypted-shard-data"

    async def health_check(self) -> bool:
        return True

    async def delete_shard(self, shard_id: str) -> None:
        return None
