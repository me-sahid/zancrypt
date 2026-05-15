from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_repo import AuditRepository
from app.repositories.node_repo import NodeRepository
from app.repositories.security_event_repo import SecurityEventRepository

class AdminService:
    def __init__(self, session: AsyncSession | None = None) -> None:
        self.session = session
        self.audit_repo = AuditRepository(session) if session else None
        self.node_repo = NodeRepository(session) if session else None
        self.security_event_repo = SecurityEventRepository(session) if session else None

    async def list_audit_logs(self) -> List[dict]:
        return await self.audit_repo.list_all() if self.audit_repo else []

    async def list_security_events(self) -> List[dict]:
        return await self.security_event_repo.list_all() if self.security_event_repo else []

    async def node_health(self) -> List[dict]:
        return await self.node_repo.list_nodes() if self.node_repo else []

    async def system_metrics(self) -> dict:
        return {
            "active_nodes": 5,
            "total_files": 0,
            "pending_tasks": 0,
            "average_upload_latency_ms": 0.0,
        }
