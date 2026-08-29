from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.schemas.auth import UserCreate
from app.security.password import get_password_hash

class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def create_user(self, payload: UserCreate) -> User:
        existing = await self.repo.get_by_username_or_email(payload.username)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already registered")
        user = User(
            email=payload.email,
            username=payload.username,
            full_name=payload.full_name,
            region=payload.region,
            password_hash=get_password_hash(payload.password),
            role=UserRole.user,
        )
        await self.repo.create(user)
        return user
