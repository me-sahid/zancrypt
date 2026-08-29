import hashlib
import asyncio
import logging
from typing import AsyncIterator, List, Tuple, Optional
from app.storage.node_manager import NodeManager
from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageRouter:
    def __init__(self) -> None:
        self.node_manager = NodeManager()
        self.replication_factor = settings.STORAGE_REPLICATION_FACTOR or 2

    async def _get_node_priority(self, shard_id: str) -> List[str]:
        all_nodes = await self.node_manager.get_active_nodes()
        if not all_nodes:
            return []
        scores = []
        for node in all_nodes:
            score = int(hashlib.sha256(f"{shard_id}:{node}".encode()).hexdigest(), 16)
            scores.append((score, node))
        scores.sort(key=lambda x: x[0], reverse=True)
        actual_replication = min(self.replication_factor, len(all_nodes))
        return [node for _, node in scores[:actual_replication]]

    async def distribute_shards(self, file_id: int, shards: List[Tuple[str, bytes]]) -> List[dict]:
        assignments = []
        tasks = []
        task_info = []

        for shard_name, data in shards:
            shard_id = f"file_{file_id}_{shard_name}"
            target_nodes = await self._get_node_priority(shard_id)
            if not target_nodes:
                raise Exception("No healthy nodes available for shard distribution")

            shard_hash = hashlib.sha256(data).hexdigest()
            assignments.append({
                "shard_id": shard_id,
                "nodes": target_nodes,
                "hash": shard_hash
            })
            for node in target_nodes:
                task_info.append((node, shard_id, data))
                tasks.append(self.node_manager.write_shard(node, shard_id, data))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        shard_successes = {shard_id: [] for _, shard_id, _ in task_info}
        for idx, res in enumerate(results):
            if not isinstance(res, Exception) and res is True:
                node, shard_id, _ = task_info[idx]
                shard_successes[shard_id].append(node)

        any_failed = False
        for shard_id, successes in shard_successes.items():
            if not successes:
                any_failed = True
                break

        if any_failed:
            rollback_tasks = []
            for idx, res in enumerate(results):
                if not isinstance(res, Exception) and res is True:
                    node, shard_id, _ = task_info[idx]
                    rollback_tasks.append(self.node_manager.delete_shard(node, shard_id))
            if rollback_tasks:
                await asyncio.gather(*rollback_tasks, return_exceptions=True)
            raise Exception("Failed to upload all shard replicas; rolled back")

        for assignment in assignments:
            assignment["nodes"] = shard_successes[assignment["shard_id"]]

        return assignments

    async def fetch_shard(
        self, 
        shard_id: str, 
        nodes: List[str], 
        expected_hash: Optional[str] = None
    ) -> Optional[bytes]:
        for node in nodes:
            data = await self.node_manager.read_shard(node, shard_id)
            if data is None:
                logger.warning(f"Shard {shard_id} missing on node {node}")
                continue

            if expected_hash:
                actual_hash = hashlib.sha256(data).hexdigest()
                if actual_hash != expected_hash:
                    logger.warning(
                        f"Shard {shard_id} CORRUPTED on node {node}. "
                        f"Expected: {expected_hash[:16]}... "
                        f"Got: {actual_hash[:16]}..."
                    )
                    continue  # Try next node

            return data

        logger.error(f"Shard {shard_id} could not be retrieved from any node")
        return None

    async def verify_shard_integrity(
        self, 
        shard_id: str, 
        nodes: List[str], 
        expected_hash: str
    ) -> dict:
        results = {}
        for node in nodes:
            data = await self.node_manager.read_shard(node, shard_id)
            if data is None:
                results[node] = "missing"
                continue
            actual_hash = hashlib.sha256(data).hexdigest()
            results[node] = "ok" if actual_hash == expected_hash else "corrupted"
        return results

    async def repair_shard(
        self, 
        shard_id: str, 
        nodes: List[str], 
        expected_hash: str
    ) -> bool:
        good_data = None
        good_node = None

        for node in nodes:
            data = await self.node_manager.read_shard(node, shard_id)
            if data and hashlib.sha256(data).hexdigest() == expected_hash:
                good_data = data
                good_node = node
                break

        if good_data is None:
            logger.error(f"Shard {shard_id} has no healthy copy — unrecoverable")
            return False

        repair_tasks = []
        for node in nodes:
            if node != good_node:
                repair_tasks.append(
                    self.node_manager.write_shard(node, shard_id, good_data)
                )

        if repair_tasks:
            results = await asyncio.gather(*repair_tasks, return_exceptions=True)
            success_count = sum(1 for r in results if r is True)
            logger.info(f"Repaired shard {shard_id} on {success_count}/{len(repair_tasks)} nodes")

        return True