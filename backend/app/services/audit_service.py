from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_repo import AuditRepository

class AuditService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AuditRepository(session)

    async def capture_event(self, user_id: int | None, event_type: str, resource_type: str, resource_id: str | None, details: dict) -> None:
        import json
        await self.repo.create_log(
            user_id=user_id,
            action=event_type,
            resource=resource_type,
            status=resource_id or "success",
            metadata=details
        )
