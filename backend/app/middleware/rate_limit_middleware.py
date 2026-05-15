from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

limiter = Limiter(key_func=get_remote_address)

async def rate_limit(request, call_next):
    return await limiter(request, call_next)

async def initialize() -> None:
    pass
