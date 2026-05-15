import redis.asyncio as redis
from app.core.config import settings

class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance.client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                encoding="utf-8",
            )
        return cls._instance

    async def get(self, key: str):
        return await self.client.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        return await self.client.set(key, value, ex=expire)

    async def delete(self, key: str):
        return await self.client.delete(key)

    async def exists(self, key: str):
        return await self.client.exists(key)

redis_client = RedisClient()
