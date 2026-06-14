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

    async def create_session(self, user_id: int, previous_token: str = None) -> str:
        raw_token = secrets.token_urlsafe(64)
        db_session = Session(
            user_id=user_id,
            refresh_token_hash=_hash_token(raw_token),
            previous_token_hash=_hash_token(previous_token) if previous_token else None,  # ← store hash of old token
            expires_at=datetime.utcnow() + timedelta(days=7),
            revoked=False,
        )
        self.session.add(db_session)
        await self.session.commit()
        await self.session.refresh(db_session)
        return raw_token

    async def get_by_token(self, raw_token: str) -> Session | None:
        token_hash = _hash_token(raw_token)

        # Check active token first
        result = await self.session.execute(
            select(Session).where(
                Session.refresh_token_hash == token_hash,
                Session.revoked == False,
                Session.expires_at > datetime.utcnow(),
            )
        )
        session = result.scalar_one_or_none()
        if session:
            return session

        import logging
        logger = logging.getLogger(__name__)

        # Check if this token was recently rotated (within 5 seconds)
        # Handles mobile rapid-refresh race condition where browser sends the old
        # cookie before the new one is set
        result = await self.session.execute(
            select(Session).where(
                Session.previous_token_hash == token_hash,
                Session.revoked == False
            )
        )
        rotated_session = result.scalar_one_or_none()
        
        if rotated_session:
            # Check if it falls within the tight 5-second grace period
            if rotated_session.created_at > datetime.utcnow() - timedelta(seconds=5):
                logger.warning(f"Grace-period refresh token reuse for user {rotated_session.user_id}. Allowing.")
                return rotated_session
            else:
                # TOKEN THEFT DETECTED
                # The old token was used outside the safe network race-condition window.
                logger.critical(
                    f"TOKEN THEFT DETECTED! Old refresh token reused. Revoking all sessions for user {rotated_session.user_id}."
                )
                await self.revoke_all_by_user(rotated_session.user_id)
                return None

        return None

    async def delete_session(self, raw_token: str) -> None:
        token_hash = _hash_token(raw_token)
        await self.session.execute(
            update(Session)
            .where(Session.refresh_token_hash == token_hash)
            .values(revoked=True)
        )
        await self.session.commit()

    async def revoke_all_by_user(self, user_id: int) -> None:
        await self.session.execute(
            update(Session)
            .where(Session.user_id == user_id, Session.revoked == False)
            .values(revoked=True)
        )
        await self.session.commit()
