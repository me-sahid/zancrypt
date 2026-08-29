from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_async_session

from app.utils.redis import redis_client

router = APIRouter()

@router.get("", summary="Readiness check")
@router.get("/", summary="Readiness check")
async def health_root(session: AsyncSession = Depends(get_async_session)) -> dict:
    redis_status = "connected"
    try:
        await redis_client.client.ping()
    except Exception:
        redis_status = "disconnected"

    db_status = "connected"
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "detail": "Secure Distributed File Vault is ready",
        "redis": redis_status,
        "nodes": "healthy" if db_status == "connected" else "degraded",
        "postgres": db_status
    }


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

@router.get("/stats")
async def health_stats(session: AsyncSession = Depends(get_async_session)) -> dict:
    try:
        from app.models.file import File
        from sqlalchemy import select, func
        result = await session.execute(
            select(func.count(File.id)).where(File.is_deleted == False)
        )
        count = result.scalar() or 0
        return {"status": "ok", "vaults_count": count}
    except Exception:
        return {"status": "error", "vaults_count": 0}

