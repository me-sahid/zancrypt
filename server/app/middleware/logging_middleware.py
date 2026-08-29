import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.middleware.request_id import generate_request_id

logger = logging.getLogger("app.middleware")

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = generate_request_id(request)
        request.state.request_id = request_id
        logger.info("request.start", extra={"method": request.method, "path": request.url.path, "request_id": request_id})
        response = await call_next(request)
        logger.info("request.end", extra={"method": request.method, "path": request.url.path, "status": response.status_code, "request_id": request_id})
        response.headers["X-Request-ID"] = request_id
        return response
