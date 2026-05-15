from datetime import datetime, timedelta
import hashlib
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.session import Session

class SessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    async def create_session(self, user_id: int) -> str:
        refresh_token = secrets.token_urlsafe(64)
        session = Session(
            user_id=user_id,
            refresh_token_hash=self._hash_token(refresh_token),
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.session.add(session)
        await self.session.commit()
        return refresh_token

    async def get_by_refresh_token(self, token: str) -> Session | None:
        hashed = self._hash_token(token)
        result = await self.session.execute(select(Session).where(Session.refresh_token_hash == hashed))
        return result.scalar_one_or_none()

    async def rotate_refresh_token(self, session: Session) -> str:
        new_token = secrets.token_urlsafe(64)
        session.refresh_token_hash = self._hash_token(new_token)
        session.expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.session.commit()
        return new_token

    async def revoke_sessions_for_user(self, user_id: int) -> None:
        result = await self.session.execute(select(Session).where(Session.user_id == user_id, Session.revoked == False))
        for session in result.scalars().all():
            session.revoked = True
        await self.session.commit()
