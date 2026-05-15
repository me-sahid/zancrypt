from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.security.jwt import decode_access_token
from jose import JWTError

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Whitelist public endpoints
        public_paths = ["/auth/login", "/auth/register", "/auth/refresh", "/health", "/docs", "/openapi.json"]
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid authorization header"})

        token = auth_header.split(" ")[1]
        try:
            payload = decode_access_token(token)
            request.state.user_id = int(payload.get("sub"))
        except (JWTError, ValueError, TypeError):
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)
