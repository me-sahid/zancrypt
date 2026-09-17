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
    allow_origins=settings.CORS_ORIGINS + [
        "https://zancrypt.in",
        "https://www.zancrypt.in",
        "https://zancrypt-front.pages.dev",
        "https://drive.zancrypt.in",
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
from app.api.routers import files, admin, share, notifications, dashboard, folders, api_keys, billing

app.include_router(enterprise_auth_router, prefix="/auth", tags=["auth"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(folders.router, prefix="/api/folders", tags=["folders"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(share.router, prefix="/api/share", tags=["share"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(api_keys.router, prefix="/api/keys", tags=["api_keys"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
app.include_router(prometheus_router)

register_exception_handlers(app)

@app.get("/health")
@app.get("/health/")
def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "Secure Distributed File Vault"}

from fastapi.responses import JSONResponse

@app.get("/.well-known/webauthn")
async def webauthn_well_known():
    return JSONResponse(
        content={
            "origins": settings.CORS_ORIGINS + [
                "https://zancrypt.in",
                "https://www.zancrypt.in",
                "https://drive.zancrypt.in"
            ]
        },
        media_type="application/json"
    )

@app.on_event("startup")
async def on_startup() -> None:
    from app.models.base import Base
    from app.db import engine
    from app.core.nodes import initialize_nodes
    from sqlalchemy import text

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Run each migration separately so one failure doesn't block others
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS api_credits BIGINT DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_api_calls BIGINT DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 2147483648;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(100);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(100);",
        "ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '[\"*\"]'::jsonb;",
        "ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS app_restrictions JSONB DEFAULT '{}'::jsonb;",
        "ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '{}'::jsonb;",
        "ALTER TABLE node_registry ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;",
        "ALTER TABLE shard_registry ADD COLUMN IF NOT EXISTS shard_size INT DEFAULT 0;",
        "ALTER TABLE shard_registry ADD COLUMN IF NOT EXISTS provider VARCHAR(64) DEFAULT 'local';",
        "ALTER TABLE files ALTER COLUMN file_size TYPE BIGINT;",
        "ALTER TABLE files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE files ADD COLUMN IF NOT EXISTS thumbnail TEXT;",
        "ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id);",
        "ALTER TABLE shares ADD COLUMN IF NOT EXISTS allow_downloads BOOLEAN DEFAULT TRUE;",
        "ALTER TABLE shares DROP COLUMN IF EXISTS share_password;",
        """DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='identity_verifier') THEN
                ALTER TABLE users RENAME COLUMN identity_verifier TO recovery_key_hash;
            ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_key') THEN
                ALTER TABLE users RENAME COLUMN access_key TO recovery_key_hash;
            ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_key_hash') THEN
                ALTER TABLE users RENAME COLUMN access_key_hash TO recovery_key_hash;
            ELSE
                ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_hash VARCHAR(255);
            END IF;
        END $$;""",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_used_at TIMESTAMPTZ;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_attempts INTEGER DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_locked_until TIMESTAMPTZ;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_count INTEGER DEFAULT 0;",
        "ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS device_name VARCHAR(100);",
        "ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;",
        "ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS added_via VARCHAR(50) DEFAULT 'registration';",
        "ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
        """CREATE TABLE IF NOT EXISTS recovery_sessions (
            id UUID PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            session_token_hash VARCHAR(64) UNIQUE NOT NULL,
            webauthn_challenge_hash VARCHAR(64) NOT NULL,
            webauthn_challenge TEXT NOT NULL,
            ip_address VARCHAR(45),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
            consumed_at TIMESTAMPTZ
        );""",
        """CREATE OR REPLACE FUNCTION update_user_passkey_count()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                IF NEW.is_active = TRUE THEN
                    UPDATE users SET passkey_count = COALESCE(passkey_count, 0) + 1 WHERE id = NEW.user_id;
                END IF;
                RETURN NEW;
            ELSIF TG_OP = 'UPDATE' THEN
                IF (OLD.is_active IS NULL OR OLD.is_active = TRUE) AND NEW.is_active = FALSE THEN
                    UPDATE users SET passkey_count = GREATEST(COALESCE(passkey_count, 0) - 1, 0) WHERE id = NEW.user_id;
                ELSIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
                    UPDATE users SET passkey_count = COALESCE(passkey_count, 0) + 1 WHERE id = NEW.user_id;
                END IF;
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                IF OLD.is_active IS NULL OR OLD.is_active = TRUE THEN
                    UPDATE users SET passkey_count = GREATEST(COALESCE(passkey_count, 0) - 1, 0) WHERE id = OLD.user_id;
                END IF;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;""",
        """DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_webauthn_credentials_passkey_count') THEN
                CREATE TRIGGER trg_webauthn_credentials_passkey_count
                AFTER INSERT OR UPDATE OR DELETE ON webauthn_credentials
                FOR EACH ROW EXECUTE FUNCTION update_user_passkey_count();
            END IF;
        END $$;""",
        "UPDATE users u SET passkey_count = (SELECT COUNT(*) FROM webauthn_credentials c WHERE c.user_id = u.id AND (c.is_active IS NULL OR c.is_active = TRUE));",
        "CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_active ON webauthn_credentials(user_id) WHERE is_active = true;",
        "CREATE INDEX IF NOT EXISTS idx_recovery_sessions_token ON recovery_sessions(session_token_hash) WHERE consumed_at IS NULL;",
        "CREATE INDEX IF NOT EXISTS idx_recovery_sessions_user_created ON recovery_sessions(user_id, created_at DESC);",
    ]

    for migration in migrations:
        try:
            async with engine.begin() as conn:
                await conn.execute(text(migration))
        except Exception as e:
            print(f"[MIGRATION] Skipped: {migration[:60]}... → {e}")

    await initialize_nodes()
    from app.monitoring.otel import instrument_app
    instrument_app(app)