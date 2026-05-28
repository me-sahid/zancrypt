import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware


from app.core.config import settings
from app.core.logging import configure_structured_logging
from app.core.tracing import setup_tracing
from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.exception_handler import register_exception_handlers
from app.middleware.logging_middleware import StructuredLoggingMiddleware
from app.monitoring.prometheus import router as prometheus_router
from app.monitoring.otel import instrument_app
from app.middleware.security import security_headers_middleware
import app.models

setup_tracing()

app = FastAPI(
    title="Secure Distributed File Vault",
    version="1.0.0",
    description="Zero-knowledge distributed encrypted cloud storage platform.",
    redirect_slashes=False,
)

# CORS — must be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zancrypt.in",
        "https://www.zancrypt.in",
        "https://zancrypt-front.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

configure_structured_logging(app)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(AuthMiddleware)
from app.auth.middleware.audit import AuthAuditMiddleware
app.add_middleware(AuthAuditMiddleware)
app.add_middleware(StructuredLoggingMiddleware)
app.middleware("http")(security_headers_middleware)

# routers
from app.auth.api.endpoints import router as enterprise_auth_router
from app.api.routers import files, admin, share, notifications, dashboard, folders, api_keys

app.include_router(enterprise_auth_router, prefix="/auth", tags=["auth"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(folders.router, prefix="/api/folders", tags=["folders"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(share.router, prefix="/api/share", tags=["share"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(api_keys.router, prefix="/api/keys", tags=["api_keys"])
app.include_router(prometheus_router)

register_exception_handlers(app)

@app.get("/health")
@app.get("/health/")
def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "Secure Distributed File Vault"}

@app.on_event("startup")
async def on_startup() -> None:
    from app.models.base import Base
    from app.db import engine
    from app.core.nodes import initialize_nodes
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS api_credits BIGINT DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_api_calls BIGINT DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '[\"*\"]'::jsonb;"))
        await conn.execute(text("ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS app_restrictions JSONB DEFAULT '{}'::jsonb;"))
        await conn.execute(text("ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '{}'::jsonb;"))
        await conn.execute(text("ALTER TABLE node_registry ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE shard_registry ADD COLUMN IF NOT EXISTS shard_size INT DEFAULT 0;"))
        await conn.execute(text("ALTER TABLE shard_registry ADD COLUMN IF NOT EXISTS provider VARCHAR(64) DEFAULT 'local';"))
        await conn.execute(text("ALTER TABLE files ALTER COLUMN file_size TYPE BIGINT;"))
        await conn.execute(text("ALTER TABLE files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;"))
        await conn.execute(text("ALTER TABLE files ADD COLUMN IF NOT EXISTS thumbnail TEXT;"))
        await conn.execute(text("ALTER TABLE shares ADD COLUMN IF NOT EXISTS allow_downloads BOOLEAN DEFAULT TRUE;"))
        await conn.execute(text("ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id);"))
    await initialize_nodes()
    instrument_app(app)