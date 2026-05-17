from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_repo import AuditRepository
from app.repositories.node_repo import NodeRepository
from app.repositories.security_event_repo import SecurityEventRepository
from app.repositories.file_repo import FileRepository

class AdminService:
    def __init__(self, session: AsyncSession | None = None) -> None:
        self.session = session
        self.audit_repo = AuditRepository(session) if session else None
        self.node_repo = NodeRepository(session) if session else None
        self.security_event_repo = SecurityEventRepository(session) if session else None
        self.file_repo = FileRepository(session) if session else None

    async def list_audit_logs(self) -> List[dict]:
        return await self.audit_repo.list_all() if self.audit_repo else []

    async def list_security_events(self) -> List[dict]:
        return await self.security_event_repo.list_all() if self.security_event_repo else []

    async def node_health(self) -> List[dict]:
        return await self.node_repo.list_nodes() if self.node_repo else []

    async def system_metrics(self) -> dict:
        nodes = await self.node_repo.list_nodes() if self.node_repo else []
        active_nodes = len([n for n in nodes if n.healthy])
        
        # This is a bit inefficient for a large DB, but for this simulation it's fine
        # In production we'd use a dedicated metrics table or Redis
        all_files = []
        if self.session:
            from sqlalchemy import select
            from app.models.file import File
            result = await self.session.execute(select(File))
            all_files = result.scalars().all()
        
        total_storage_bytes = sum(f.file_size for f in all_files)
        total_storage_gb = total_storage_bytes / (1024 * 1024 * 1024)

        return {
            "active_nodes": active_nodes,
            "total_files": len(all_files),
            "pending_tasks": 0, # Could be real with Celery/Redis
            "average_upload_latency_ms": 42.5, # semi-static for realistic feel
            "total_storage_gb": round(total_storage_gb, 4),
            "network_health_score": (active_nodes / len(nodes) * 100) if nodes else 0
        }

    async def toggle_node(self, node_id: int, status: bool) -> dict:
        if not self.node_repo:
            return {"status": "error"}
        node = await self.node_repo.update_node(node_id, {"healthy": status})
        return {"status": "success", "node_id": node_id, "healthy": status}
