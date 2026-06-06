import hashlib
import secrets
from datetime import datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import Session


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class SessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_session(self, user_id: int) -> str:
        """Creates a new session, returns the raw refresh token."""
        raw_token = secrets.token_urlsafe(64)
        token_hash = _hash_token(raw_token)

        db_session = Session(
            user_id=user_id,
            refresh_token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(days=7),
            revoked=False,
        )
        self.session.add(db_session)
        await self.session.commit()
        await self.session.refresh(db_session)
        return raw_token  # raw token goes to cookie, hash stays in DB

    async def get_by_token(self, raw_token: str) -> Session | None:
        """Looks up a valid (non-revoked, non-expired) session by raw token."""
        token_hash = _hash_token(raw_token)
        result = await self.session.execute(
            select(Session).where(
                Session.refresh_token_hash == token_hash,
                Session.revoked == False,
                Session.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def delete_session(self, raw_token: str) -> None:
        """Revokes a session by raw token (rotation — old token can never be reused)."""
        token_hash = _hash_token(raw_token)
        await self.session.execute(
            update(Session)
            .where(Session.refresh_token_hash == token_hash)
            .values(revoked=True)
        )
        await self.session.commit()

    async def revoke_all_by_user(self, user_id: int) -> None:
        """Revokes ALL sessions for a user (used on logout)."""
        await self.session.execute(
            update(Session)
            .where(Session.user_id == user_id, Session.revoked == False)
            .values(revoked=True)
        )
        await self.session.commit()