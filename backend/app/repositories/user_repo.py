from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username_or_email(self, identifier: str) -> User | None:
        # Optimized & 100% Safe: Avoids OR condition full-table scans.
        # Queries the email index first. If no match, queries the username index.
        # This prevents logic bugs where a custom username might contain an '@' symbol.
        result = await self.session.execute(select(User).where(User.email == identifier))
        user = result.scalars().first()
        
        if not user:
            result = await self.session.execute(select(User).where(User.username == identifier))
            user = result.scalars().first()
            
        return user

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
