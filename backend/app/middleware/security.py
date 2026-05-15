from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])

async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

async def rate_limit_middleware(request: Request, call_next):
    # This is handled by SlowAPIMiddleware in main.py, 
    # but we can add custom logic here if needed.
    return await call_next(request)
