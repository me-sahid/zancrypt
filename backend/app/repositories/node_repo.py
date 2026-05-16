from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.node_registry import NodeRegistry

class NodeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_nodes(self) -> list[NodeRegistry]:
        result = await self.session.execute(select(NodeRegistry).order_by(NodeRegistry.node_name))
        return result.scalars().all()

    async def update_node(self, node_id: int, updates: dict) -> NodeRegistry:
        result = await self.session.execute(select(NodeRegistry).where(NodeRegistry.id == node_id))
        node = result.scalar_one_or_none()
        if node:
            for key, value in updates.items():
                setattr(node, key, value)
            await self.session.commit()
        return node
