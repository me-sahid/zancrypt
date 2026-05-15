from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog

class AuditRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_log(
        self, 
        user_id: int | None, 
        action: str, 
        resource: str, 
        status: str, 
        ip_address: str | None = None,
        user_agent: str | None = None,
        metadata: dict | None = None
    ) -> AuditLog:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata_json=metadata,
        )
        self.session.add(audit)
        await self.session.commit()
        await self.session.refresh(audit)
        return audit

    async def list_all(self) -> list[AuditLog]:
        result = await self.session.execute(select(AuditLog).order_by(AuditLog.created_at.desc()))
        return result.scalars().all()
