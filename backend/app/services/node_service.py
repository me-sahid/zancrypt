from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.node_repo import NodeRepository

class NodeService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = NodeRepository(session)

    async def list_nodes(self) -> list[dict]:
        nodes = await self.repo.list_nodes()
        return [
            {
                "node_name": node.node_name,
                "healthy": node.healthy,
                "region": node.region,
                "provider": node.provider,
                "last_check_in": node.last_check_in,
            }
            for node in nodes
        ]
