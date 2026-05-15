from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.session_repo import SessionRepository

class SessionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = SessionRepository(session)

    async def revoke_active_sessions(self, user_id: int) -> None:
        await self.repo.revoke_sessions_for_user(user_id)
