from typing import List

from app.storage.node_client import StorageNodeClient

class ReplicationManager:
    def __init__(self, nodes: List[StorageNodeClient]) -> None:
        self.nodes = nodes

    async def choose_replicas(self, shard_id: str, count: int = 3) -> List[StorageNodeClient]:
        return self.nodes[:count]

    async def recover_shard(self, shard_id: str) -> None:
        return None
