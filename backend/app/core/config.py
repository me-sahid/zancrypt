from pathlib import Path
from typing import List

from pydantic import Field, PostgresDsn, SecretStr
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = Field("production", env="ENVIRONMENT")
    APP_NAME: str = Field("secure-distributed-file-vault", env="APP_NAME")
    DEBUG: bool = Field(False, env="DEBUG")
    SECRET_KEY: str = Field("super-secret-key-change-me", env="SECRET_KEY")

    # Database
    DATABASE_URL: PostgresDsn
    DB_POOL_SIZE: int = Field(20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(10, env="DB_MAX_OVERFLOW")
    DB_POOL_TIMEOUT: int = Field(30, env="DB_POOL_TIMEOUT")

    # Redis
    REDIS_URL: str = Field("redis://redis:6379/0", env="REDIS_URL")
    REDIS_CACHE_DB: int = Field(1, env="REDIS_CACHE_DB")
    REDIS_BROKER_URL: str = Field("redis://redis:6379/1", env="REDIS_BROKER_URL")
    REDIS_BACKEND_URL: str = Field("redis://redis:6379/2", env="REDIS_BACKEND_URL")

    # Auth & JWT
    JWT_SECRET_KEY: SecretStr
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    DOMAIN: str = Field("localhost", env="DOMAIN")
    RP_ID: str = Field("localhost", env="RP_ID")
    RP_NAME: str = Field("Zancrypt", env="RP_NAME")

    # Security
    RATE_LIMIT: str = Field("100/minute", env="RATE_LIMIT")
    CORS_ORIGINS: List[str] = Field(["*"], env="CORS_ORIGINS")
    TRUSTED_PROXIES: List[str] = Field(["127.0.0.1"], env="TRUSTED_PROXIES")
    BCRYPT_ROUNDS: int = Field(12, env="BCRYPT_ROUNDS")

    # Distributed Storage
    STORAGE_NODE_COUNT: int = Field(5, env="STORAGE_NODE_COUNT")
    STORAGE_REPLICATION_FACTOR: int = Field(3, env="STORAGE_REPLICATION_FACTOR")
    MAX_UPLOAD_SIZE: int = Field(104857600, env="MAX_UPLOAD_SIZE")  # 100MB
    TMP_STAGING_DIR: str = Field("/dev/shm/vault_staging", env="TMP_STAGING_DIR")

    # Observability
    ENABLE_OTEL: bool = Field(True, env="ENABLE_OTEL")
    PROMETHEUS_METRICS_ENABLED: bool = Field(True, env="PROMETHEUS_METRICS_ENABLED")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
