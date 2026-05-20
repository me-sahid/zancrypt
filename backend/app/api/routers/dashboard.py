import json
import time
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_current_user
from app.models.file import File
from app.models.node_registry import NodeRegistry
from app.models.shard_registry import ShardRegistry

router = APIRouter()

CACHE_TTL = 30  # seconds

def _get_redis():
    from app.core.config import settings
    import redis
    return redis.from_url(settings.REDIS_URL)


@router.get("/stats")
async def get_dashboard_stats(
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> dict:
    cache_key = f"dashboard_stats:{current_user.id}"
    
    # 1. Check Redis cache
    try:
        cached = _get_redis().get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass  # Redis unavailable — fall through to DB query

    # 2. Query database for real-time stats
    
    # Total Storage (Sum of sizes of non-deleted files belonging to the user)
    total_storage_res = await session.execute(
        select(func.sum(File.file_size))
        .where(File.owner_id == current_user.id, File.is_deleted == False)
    )
    total_storage_bytes = int(total_storage_res.scalar() or 0)

    # Stored Files (Count of non-deleted files belonging to the user)
    stored_files_res = await session.execute(
        select(func.count(File.id))
        .where(File.owner_id == current_user.id, File.is_deleted == False)
    )
    stored_files = stored_files_res.scalar() or 0

    # Active Nodes (Count of healthy nodes in registry)
    active_nodes_res = await session.execute(
        select(func.count(NodeRegistry.id))
        .where(NodeRegistry.healthy == True)
    )
    active_nodes = active_nodes_res.scalar() or 0

    # Security Score (Valid shard hash ratio or 100 if no shards exist)
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

    # 3. Save to Redis and return response
    stats_data = {
        "total_storage_bytes": total_storage_bytes,
        "stored_files": stored_files,
        "active_nodes": active_nodes,
        "security_score": security_score
    }
    try:
        _get_redis().setex(cache_key, CACHE_TTL, json.dumps(stats_data))
    except Exception:
        pass  # Redis unavailable — return fresh data without caching
    
    return stats_data

