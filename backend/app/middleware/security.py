from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])

async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    import secrets
    csp_nonce = secrets.token_urlsafe(16)

    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        f"script-src 'self' 'nonce-{csp_nonce}'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob:; "
        "media-src 'self' blob:; "
        "connect-src 'self' https://zancrypt.in https://www.zancrypt.in https://drive.zancrypt.in https://zancrypt-front.pages.dev; "
        "object-src 'none'; "
        "frame-ancestors 'none';"
    )
    # Pass nonce to frontend via header so React can potentially use it
    response.headers["X-CSP-Nonce"] = csp_nonce
    return response

async def rate_limit_middleware(request: Request, call_next):
    return await call_next(request)