from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
from app.repositories.audit_repo import AuditRepository
from app.db import AsyncSessionLocal

class AuthAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We only audit auth-related endpoints
        if not request.url.path.startswith("/auth"):
            return await call_next(request)

        response = await call_next(request)
        
        # After response, we log the audit event asynchronously
        # Note: In a high-traffic system, this should be pushed to a queue (Celery/Redis)
        try:
            status = "success" if response.status_code < 400 else "failure"
            action = request.url.path.split("/")[-1]
            
            # Simplified metadata
            audit_metadata = {
                "method": request.method,
                "status_code": response.status_code,
                "path": request.url.path
            }
            
            # Log to DB
            async with AsyncSessionLocal() as session:
                repo = AuditRepository(session)
                await repo.create_log(
                    user_id=None, # Extract from session if available
                    action=action,
                    resource="auth_system",
                    status=status,
                    ip_address=request.client.host,
                    user_agent=request.headers.get("user-agent"),
                    metadata=audit_metadata
                )
        except Exception as e:
            print(f"Audit logging failed: {e}")
            
        return response
