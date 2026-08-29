from datetime import datetime

from app.storage.node_client import StorageNodeClient

class NodeHealthMonitor:
    def __init__(self, nodes: list[StorageNodeClient]) -> None:
        self.nodes = nodes

    async def check_nodes(self) -> list[dict]:
        status = []
        for node in self.nodes:
            healthy = await node.health_check()
            status.append({"node_name": node.node_name, "healthy": healthy, "last_check_in": datetime.utcnow().isoformat()})
        return status
