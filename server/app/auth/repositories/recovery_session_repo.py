from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recovery_session import RecoverySession

class RecoverySessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, recovery_session: RecoverySession) -> RecoverySession:
        self.session.add(recovery_session)
        await self.session.commit()
        await self.session.refresh(recovery_session)
        return recovery_session

    async def get_unconsumed_by_hash_for_update(self, token_hash: str) -> RecoverySession | None:
        result = await self.session.execute(
            select(RecoverySession)
            .where(
                RecoverySession.session_token_hash == token_hash,
                RecoverySession.consumed_at.is_(None)
            )
            .with_for_update()
        )
        return result.scalar_one_or_none()

    async def mark_consumed(self, recovery_session: RecoverySession) -> None:
        recovery_session.consumed_at = datetime.now(timezone.utc)
        await self.session.flush()
