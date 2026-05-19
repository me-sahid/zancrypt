import hashlib
import asyncio
from typing import AsyncIterator, List, Tuple, Optional
from app.storage.node_manager import NodeManager
from app.core.config import settings

class StorageRouter:
    def __init__(self) -> None:
        self.node_manager = NodeManager()
        self.replication_factor = settings.STORAGE_REPLICATION_FACTOR or 2

    async def _get_node_priority(self, shard_id: str) -> List[str]:
        """
        Rendezvous hashing (Highest Random Weight hashing) to find top N nodes for a shard.
        """
        all_nodes = await self.node_manager.get_active_nodes()
        if not all_nodes:
            return []
            
        scores = []
        for node in all_nodes:
            # Hash(shard_id + node_name)
            score = int(hashlib.sha256(f"{shard_id}:{node}".encode()).hexdigest(), 16)
            scores.append((score, node))
        
        # Sort by score descending
        scores.sort(key=lambda x: x[0], reverse=True)
        # Ensure we don't request more replicas than available nodes
        actual_replication = min(self.replication_factor, len(all_nodes))
        return [node for _, node in scores[:actual_replication]]

    async def distribute_shards(self, file_id: int, shards: List[Tuple[str, bytes]]) -> List[dict]:
        """
        Distributes shards across nodes with replication.
        shards is a list of (shard_name, data)
        """
        assignments = []
        tasks = []
        task_info = []
        
        for shard_name, data in shards:
            shard_id = f"file_{file_id}_{shard_name}"
            target_nodes = await self._get_node_priority(shard_id)
            
            if not target_nodes:
                raise Exception("No healthy nodes available for shard distribution")
                
            assignments.append({
                "shard_id": shard_id,
                "nodes": target_nodes,
                "hash": hashlib.sha256(data).hexdigest()
            })
            
            for node in target_nodes:
                task_info.append((node, shard_id, data))
                tasks.append(self.node_manager.write_shard(node, shard_id, data))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Track successes per shard
        shard_successes = {shard_id: [] for _, shard_id, _ in task_info}
        for idx, res in enumerate(results):
            if not isinstance(res, Exception) and res is True:
                node, shard_id, _ = task_info[idx]
                shard_successes[shard_id].append(node)
                
        # Only rollback if a shard failed on ALL targeted nodes
        any_failed = False
        for shard_id, successes in shard_successes.items():
            if not successes:
                any_failed = True
                break
                
        if any_failed:
            # Rollback: delete all successfully written shards
            rollback_tasks = []
            for idx, res in enumerate(results):
                if not isinstance(res, Exception) and res is True:
                    node, shard_id, _ = task_info[idx]
                    rollback_tasks.append(self.node_manager.delete_shard(node, shard_id))
            if rollback_tasks:
                await asyncio.gather(*rollback_tasks, return_exceptions=True)
            raise Exception("Failed to upload all shard replicas successfully; rolled back uploaded shards")
            
        # Update assignments to only include nodes that succeeded
        for assignment in assignments:
            assignment["nodes"] = shard_successes[assignment["shard_id"]]
            
        return assignments

    async def fetch_shard(self, shard_id: str, nodes: List[str]) -> Optional[bytes]:
        """
        Tries to fetch shard from the list of nodes (failover).
        """
        for node in nodes:
            data = await self.node_manager.read_shard(node, shard_id)
            if data:
                return data
        return None
