from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import SecurityEvent

class SecurityEventRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_event(self, event_type: str, user_id: int | None, severity: str, description: str) -> SecurityEvent:
        event = SecurityEvent(
            event_type=event_type,
            user_id=user_id,
            severity=severity,
            description=description,
        )
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def list_all(self) -> list[SecurityEvent]:
        result = await self.session.execute(select(SecurityEvent).order_by(SecurityEvent.created_at.desc()))
        return result.scalars().all()
