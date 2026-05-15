from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_async_session

router = APIRouter()

@router.get("/", summary="Readiness check")
async def health_root() -> dict[str, str]:
    return {"status": "ok", "detail": "Secure Distributed File Vault is ready"}

from app.utils.redis import redis_client

@router.get("/redis")
async def health_redis() -> dict[str, str]:
    await redis_client.client.ping()
    return {"status": "ok", "backend": "redis"}

@router.get("/postgres")
async def health_postgres(session: AsyncSession = Depends(get_async_session)) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"status": "ok", "backend": "postgres"}

@router.get("/nodes")
async def health_nodes() -> dict[str, str]:
    return {"status": "ok", "active_nodes": "simulated", "expected_count": "5"}
