import os
import json
os.environ.setdefault("AWS_REQUEST_CHECKSUM_CALCULATION", "when_required")
os.environ.setdefault("AWS_RESPONSE_CHECKSUM_VALIDATION", "when_required")

from pathlib import Path
from typing import List

from pydantic import Field, PostgresDsn, SecretStr
from pydantic_settings import BaseSettings

ALLOWED_ORIGINS = [
    "https://zancrypt-front.pages.dev",
    "http://localhost:5173",
    "http://localhost:80",
]

class Settings(BaseSettings):
    ENVIRONMENT: str = Field("production", env="ENVIRONMENT")
    APP_NAME: str = Field("secure-distributed-file-vault", env="APP_NAME")
    DEBUG: bool = Field(False, env="DEBUG")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")

    DATABASE_URL: PostgresDsn
    DB_POOL_SIZE: int = Field(20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(10, env="DB_MAX_OVERFLOW")
    DB_POOL_TIMEOUT: int = Field(30, env="DB_POOL_TIMEOUT")

    REDIS_URL: str = Field("redis://redis:6379/0", env="REDIS_URL")
    REDIS_CACHE_DB: int = Field(1, env="REDIS_CACHE_DB")
    REDIS_BROKER_URL: str = Field("redis://redis:6379/1", env="REDIS_BROKER_URL")
    REDIS_BACKEND_URL: str = Field("redis://redis:6379/2", env="REDIS_BACKEND_URL")

    JWT_SECRET_KEY: SecretStr
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    DOMAIN: str = Field("zancrypt.in", env="DOMAIN")
    RP_ID: str = Field("zancrypt.in", env="RP_ID")
    RP_NAME: str = Field("Zancrypt", env="RP_NAME")

    RATE_LIMIT: str = Field("100/minute", env="RATE_LIMIT")
    CORS_ORIGINS_STR: str = Field("", env="CORS_ORIGINS")
    TRUSTED_PROXIES: str = Field("127.0.0.1", env="TRUSTED_PROXIES")
    BCRYPT_ROUNDS: int = Field(12, env="BCRYPT_ROUNDS")

    STORAGE_NODE_COUNT: int = Field(5, env="STORAGE_NODE_COUNT")
    STORAGE_REPLICATION_FACTOR: int = Field(3, env="STORAGE_REPLICATION_FACTOR")
    MAX_UPLOAD_SIZE: int = Field(104857600, env="MAX_UPLOAD_SIZE")
    TMP_STAGING_DIR: str = Field("/dev/shm/vault_staging", env="TMP_STAGING_DIR")

    B2_KEY_ID: str | None = Field(None, env="B2_KEY_ID")
    B2_APP_KEY: str | None = Field(None, env="B2_APP_KEY")
    B2_BUCKET: str | None = Field(None, env="B2_BUCKET")
    B2_ENDPOINT: str | None = Field(None, env="B2_ENDPOINT")
    B2_REGION: str | None = Field(None, env="B2_REGION")

    SUPABASE_ENDPOINT: str | None = Field(None, env="SUPABASE_ENDPOINT")
    SUPABASE_REGION: str | None = Field(None, env="SUPABASE_REGION")
    SUPABASE_ACCESS_KEY: str | None = Field(None, env="SUPABASE_ACCESS_KEY")
    SUPABASE_SECRET_KEY: str | None = Field(None, env="SUPABASE_SECRET_KEY")
    SUPABASE_BUCKET: str | None = Field(None, env="SUPABASE_BUCKET")

    STORJ_ENDPOINT: str | None = Field(None, env="STORJ_ENDPOINT")
    STORJ_REGION: str | None = Field(None, env="STORJ_REGION")
    STORJ_ACCESS_KEY: str | None = Field(None, env="STORJ_ACCESS_KEY")
    STORJ_SECRET_KEY: str | None = Field(None, env="STORJ_SECRET_KEY")
    STORJ_BUCKET: str | None = Field(None, env="STORJ_BUCKET")

    ENABLE_OTEL: bool = Field(True, env="ENABLE_OTEL")
    PROMETHEUS_METRICS_ENABLED: bool = Field(True, env="PROMETHEUS_METRICS_ENABLED")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    @property
    def CORS_ORIGINS(self) -> List[str]:
        if not self.CORS_ORIGINS_STR:
            return ALLOWED_ORIGINS
        v = self.CORS_ORIGINS_STR.strip()
        if v.startswith("["):
            return json.loads(v)
        return [i.strip() for i in v.split(",") if i.strip()]

    class Config:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # ← only change

settings = Settings()