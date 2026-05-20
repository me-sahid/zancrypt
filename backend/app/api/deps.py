from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserRole

from app.core.config import settings
from app.models.session import Session
from app.models.user import User
from app.repositories.session_repo import SessionRepository
from app.repositories.user_repo import UserRepository
from app.security.jwt import decode_access_token
from app.security.tokens import TokenData
from app.services.auth_service import AuthService
from app.services.session_service import SessionService
from app.storage.routing import StorageRouter
from app.db import get_async_session

async def get_current_user(token: str = Depends(AuthService.oauth2_scheme), session: AsyncSession = Depends(get_async_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = await UserRepository(session).get_by_id(int(token_data.user_id))
    if not user:
        raise credentials_exception
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Requires the current user to have admin role. Raises 403 otherwise."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


async def get_storage_router() -> StorageRouter:
    return StorageRouter()
