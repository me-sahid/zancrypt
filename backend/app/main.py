
# pyrefly: ignore [missing-import]
from fastapi import FastAPI

# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from slowapi.middleware import SlowAPIMiddleware

from app.api.routers import auth, files, admin, health, share, notifications, dashboard, folders
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

# Apply security response headers to all responses
app.middleware("http")(security_headers_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",        # local dev
        "http://localhost:3000",        # local dev alt
        "https://acbb6f68.zancrypt-front.pages.dev/",   # cloudflare pages
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app.auth.api.endpoints import router as enterprise_auth_router
app.include_router(enterprise_auth_router, prefix="/auth", tags=["auth"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(folders.router, prefix="/api/folders", tags=["folders"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(share.router, prefix="/api/share", tags=["share"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(prometheus_router)

register_exception_handlers(app)

@app.on_event("startup")
async def on_startup() -> None:
    from app.models.base import Base
    from app.db import engine
    from app.core.nodes import initialize_nodes
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;"))
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

@app.get("/", summary="Service root")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": "Secure Distributed File Vault"}
