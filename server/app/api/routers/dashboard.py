import json
import time
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_current_user_or_api_key
from app.models.file import File
from app.models.node_registry import NodeRegistry
from app.models.shard_registry import ShardRegistry

router = APIRouter()
CACHE_TTL = 30

@router.get("/stats")
async def get_dashboard_stats(
    current_user=Depends(get_current_user_or_api_key),
    session: AsyncSession = Depends(get_async_session)
) -> dict:

    # Use async Redis — per request, per user
    cache_key = f"dashboard_stats:{current_user.id}"
    redis_client = None

    try:
        import redis.asyncio as aioredis
        from app.core.config import settings
        redis_client = aioredis.from_url(settings.REDIS_URL)
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    # Total storage — current user only
    total_storage_res = await session.execute(
        select(func.sum(File.file_size))
        .where(File.owner_id == current_user.id, File.is_deleted == False)
    )
    total_storage_bytes = int(total_storage_res.scalar() or 0)

    # Stored files — current user only
    stored_files_res = await session.execute(
        select(func.count(File.id))
        .where(File.owner_id == current_user.id, File.is_deleted == False)
    )
    stored_files = stored_files_res.scalar() or 0

    # Active nodes
    active_nodes_res = await session.execute(
        select(func.count(NodeRegistry.id))
        .where(NodeRegistry.healthy == True)
    )
    active_nodes = active_nodes_res.scalar() or 0

    # Security score
    total_shards_res = await session.execute(
        select(func.count(ShardRegistry.shard_id))
        .join(File, ShardRegistry.file_id == File.id)
        .where(File.owner_id == current_user.id)
    )
    total_shards = total_shards_res.scalar() or 0

    if total_shards == 0:
        security_score = 100
    else:
        valid_shards_res = await session.execute(
            select(func.count(ShardRegistry.shard_id))
            .join(File, ShardRegistry.file_id == File.id)
            .where(
                File.owner_id == current_user.id,
                ShardRegistry.shard_hash.isnot(None),
                ShardRegistry.shard_hash != ""
            )
        )
        valid_shards = valid_shards_res.scalar() or 0
        security_score = round((valid_shards / total_shards) * 100)

    stats_data = {
        "total_storage_bytes": total_storage_bytes,
        "stored_files": stored_files,
        "active_nodes": active_nodes,
        "security_score": security_score
    }

    #Cache with async client
    try:
        if redis_client:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(stats_data))
    except Exception:
        pass
    finally:
        if redis_client:
            await redis_client.aclose()

    return stats_data