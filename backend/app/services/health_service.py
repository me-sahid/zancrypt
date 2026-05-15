from sqlalchemy.ext.asyncio import AsyncSession

from app.models.node_registry import NodeRegistry
from app.repositories.node_repo import NodeRepository

class HealthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = NodeRepository(session)

    async def check_postgres(self, session: AsyncSession) -> bool:
        await session.execute("SELECT 1")
        return True

    async def get_node_health(self) -> list[dict]:
        nodes = await self.repo.list_nodes()
        return [
            {"node_name": node.node_name, "healthy": node.healthy, "provider": node.provider, "region": node.region}
            for node in nodes
        ]
