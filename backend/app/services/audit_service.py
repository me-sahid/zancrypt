from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_repo import AuditRepository

class AuditService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AuditRepository(session)

    async def capture_event(self, user_id: int | None, event_type: str, resource_type: str, resource_id: str | None, details: dict) -> None:
        await self.repo.create_log(user_id, event_type, resource_type, resource_id, details)
