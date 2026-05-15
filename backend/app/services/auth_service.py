from datetime import datetime, timedelta

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.session_repo import SessionRepository
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse
from app.security.jwt import create_access_token
from app.security.password import verify_password

class AuthService:
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repo = UserRepository(session)
        self.session_repo = SessionRepository(session)

    async def authenticate_user(self, username: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_by_username_or_email(username)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        access_token = create_access_token(subject=str(user.id))
        refresh_token = await self.session_repo.create_session(user.id)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        session = await self.session_repo.get_by_refresh_token(refresh_token)
        if not session or session.revoked or session.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalid or expired")
        access_token = create_access_token(subject=str(session.user_id))
        refresh_token = await self.session_repo.rotate_refresh_token(session)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

class AuthException(Exception):
    pass
