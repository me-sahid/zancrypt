import hashlib
import asyncio
from typing import AsyncIterator, List, Tuple
from app.storage.node_manager import NodeManager
from app.core.config import settings

class StorageRouter:
    def __init__(self) -> None:
        self.node_manager = NodeManager(settings.STORAGE_NODE_COUNT)
        self.nodes = self.node_manager.nodes
        self.replication_factor = settings.STORAGE_REPLICATION_FACTOR

    def _get_node_priority(self, shard_id: str) -> List[str]:
        """
        Rendezvous hashing (Highest Random Weight hashing) to find top N nodes for a shard.
        """
        scores = []
        for node in self.nodes:
            # Hash(shard_id + node_name)
            score = int(hashlib.sha256(f"{shard_id}:{node}".encode()).hexdigest(), 16)
            scores.append((score, node))
        
        # Sort by score descending
        scores.sort(key=lambda x: x[0], reverse=True)
        return [node for _, node in scores[:self.replication_factor]]

    async def distribute_shards(self, file_id: int, shards: List[Tuple[str, bytes]]) -> List[dict]:
        """
        Distributes shards across nodes with replication.
        shards is a list of (shard_name, data)
        """
        assignments = []
        tasks = []
        
        for shard_name, data in shards:
            shard_id = f"file_{file_id}_{shard_name}"
            target_nodes = self._get_node_priority(shard_id)
            
            assignments.append({
                "shard_id": shard_id,
                "nodes": target_nodes,
                "hash": hashlib.sha256(data).hexdigest()
            })
            
            for node in target_nodes:
                tasks.append(self.node_manager.write_shard(node, shard_id, data))
        
        await asyncio.gather(*tasks)
        return assignments

    async def fetch_shard(self, shard_id: str, nodes: List[str]) -> bytes | None:
        """
        Tries to fetch shard from the list of nodes (failover).
        """
        for node in nodes:
            data = await self.node_manager.read_shard(node, shard_id)
            if data:
                return data
        return None
