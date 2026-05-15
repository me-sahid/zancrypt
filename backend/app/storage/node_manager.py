import os
import shutil
import hashlib
from typing import List
from app.core.config import settings

class NodeManager:
    def __init__(self, node_count: int = 5) -> None:
        self.base_path = settings.TMP_STAGING_DIR
        self.node_count = node_count
        self.nodes = [f"node{i+1}" for i in range(node_count)]
        self._initialize_nodes()

    def _initialize_nodes(self) -> None:
        if not os.path.exists(self.base_path):
            os.makedirs(self.base_path, exist_ok=True)
        for node in self.nodes:
            node_path = os.path.join(self.base_path, node)
            os.makedirs(node_path, exist_ok=True)

    async def write_shard(self, node_name: str, shard_id: str, data: bytes) -> bool:
        try:
            node_path = os.path.join(self.base_path, node_name)
            shard_path = os.path.join(node_path, shard_id)
            with open(shard_path, "wb") as f:
                f.write(data)
            return True
        except Exception:
            return False

    async def read_shard(self, node_name: str, shard_id: str) -> bytes | None:
        try:
            shard_path = os.path.join(self.base_path, node_name, shard_id)
            if os.path.exists(shard_path):
                with open(shard_path, "rb") as f:
                    return f.read()
            return None
        except Exception:
            return None

    async def delete_shard(self, node_name: str, shard_id: str) -> bool:
        try:
            shard_path = os.path.join(self.base_path, node_name, shard_id)
            if os.path.exists(shard_path):
                os.remove(shard_path)
            return True
        except Exception:
            return False

    async def check_health(self) -> dict:
        health = {}
        for node in self.nodes:
            node_path = os.path.join(self.base_path, node)
            health[node] = "healthy" if os.path.exists(node_path) else "offline"
        return health
