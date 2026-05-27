from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.api_key import ApiKey
from datetime import datetime

class ApiKeyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: int, name: str, prefix: str, encrypted_key: str, scopes: List[str], app_restrictions: dict = None) -> ApiKey:
        api_key = ApiKey(
            user_id=user_id,
            name=name,
            prefix=prefix,
            encrypted_key=encrypted_key,
            scopes=scopes,
            app_restrictions=app_restrictions or {}
        )
        self.session.add(api_key)
        await self.session.commit()
        await self.session.refresh(api_key)
        return api_key

    async def get_by_prefix(self, prefix: str) -> Optional[ApiKey]:
        stmt = select(ApiKey).where(ApiKey.prefix == prefix)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id_and_user(self, key_id: int, user_id: int) -> Optional[ApiKey]:
        stmt = select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: int) -> List[ApiKey]:
        stmt = select(ApiKey).where(ApiKey.user_id == user_id).order_by(ApiKey.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete(self, key_id: int) -> bool:
        stmt = select(ApiKey).where(ApiKey.id == key_id)
        result = await self.session.execute(stmt)
        api_key = result.scalar_one_or_none()
        if not api_key:
            return False
        await self.session.delete(api_key)
        await self.session.commit()
        return True

    async def record_usage(self, key_id: int):
        stmt = (
            update(ApiKey)
            .where(ApiKey.id == key_id)
            .values(calls_made=ApiKey.calls_made + 1, last_used_at=datetime.utcnow())
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def update_rules(self, key_id: int, rules: dict) -> bool:
        stmt = (
            update(ApiKey)
            .where(ApiKey.id == key_id)
            .values(rules=rules)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0
