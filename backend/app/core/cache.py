from redis.asyncio import Redis
from app.core.config import settings

cache: Redis | None = None


def get_cache() -> Redis:
    global cache
    if cache is None:
        cache = Redis.from_url(settings.REDIS_URL, db=settings.REDIS_CACHE_DB, decode_responses=True)
    return cache
