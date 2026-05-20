import os
import sys
import asyncio
from typing import List, Optional
from sqlalchemy import select, update
from app.models.node_registry import NodeRegistry
from app.db import async_session_maker
from app.core.config import settings

# ─── Startup validation: Backblaze B2 (Node 1) ───────────────────────────────
required_b2_vars = [
    ("B2_KEY_ID", settings.B2_KEY_ID),
    ("B2_APP_KEY", settings.B2_APP_KEY),
    ("B2_BUCKET", settings.B2_BUCKET),
    ("B2_ENDPOINT", settings.B2_ENDPOINT),
    ("B2_REGION", settings.B2_REGION),
]
missing_b2_vars = [name for name, val in required_b2_vars if not val or str(val).strip() == ""]
if missing_b2_vars:
    print(f"[CRITICAL] Missing Backblaze B2 env vars: {', '.join(missing_b2_vars)}", file=sys.stderr)
    sys.exit(1)

# ─── Startup validation: Supabase S3 (Node 2) ────────────────────────────────
required_supabase_vars = [
    ("SUPABASE_ENDPOINT", settings.SUPABASE_ENDPOINT),
    ("SUPABASE_REGION", settings.SUPABASE_REGION),
    ("SUPABASE_ACCESS_KEY", settings.SUPABASE_ACCESS_KEY),
    ("SUPABASE_SECRET_KEY", settings.SUPABASE_SECRET_KEY),
    ("SUPABASE_BUCKET", settings.SUPABASE_BUCKET),
]
missing_supabase_vars = [name for name, val in required_supabase_vars if not val or str(val).strip() == ""]
if missing_supabase_vars:
    print(f"[CRITICAL] Missing Supabase env vars: {', '.join(missing_supabase_vars)}", file=sys.stderr)
    sys.exit(1)

# ─── Startup validation: Storj S3 (Node 3) ───────────────────────────────────
required_storj_vars = [
    ("STORJ_ENDPOINT", settings.STORJ_ENDPOINT),
    ("STORJ_REGION", settings.STORJ_REGION),
    ("STORJ_ACCESS_KEY", settings.STORJ_ACCESS_KEY),
    ("STORJ_SECRET_KEY", settings.STORJ_SECRET_KEY),
    ("STORJ_BUCKET", settings.STORJ_BUCKET),
]
missing_storj_vars = [name for name, val in required_storj_vars if not val or str(val).strip() == ""]
if missing_storj_vars:
    print(f"[CRITICAL] Missing Storj env vars: {', '.join(missing_storj_vars)}", file=sys.stderr)
    sys.exit(1)

try:
    import aioboto3
    from botocore.config import Config
except ImportError:
    aioboto3 = None
    Config = None


def _s3_client_kwargs(provider: str) -> dict:
    """Return the S3 client keyword arguments for the given provider."""
    if provider == "SUPABASE":
        return {
            "endpoint_url": settings.SUPABASE_ENDPOINT,
            "aws_access_key_id": settings.SUPABASE_ACCESS_KEY,
            "aws_secret_access_key": settings.SUPABASE_SECRET_KEY,
            "region_name": settings.SUPABASE_REGION,
        }
    if provider == "STORJ":
        return {
            "endpoint_url": settings.STORJ_ENDPOINT,
            "aws_access_key_id": settings.STORJ_ACCESS_KEY,
            "aws_secret_access_key": settings.STORJ_SECRET_KEY,
            "region_name": settings.STORJ_REGION,
        }
    # Default: Backblaze B2
    return {
        "endpoint_url": settings.B2_ENDPOINT,
        "aws_access_key_id": settings.B2_KEY_ID,
        "aws_secret_access_key": settings.B2_APP_KEY,
        "region_name": settings.B2_REGION,
    }


def _bucket_for(provider: str) -> str:
    """Return the correct bucket name for the given provider."""
    if provider == "SUPABASE":
        return settings.SUPABASE_BUCKET
    if provider == "STORJ":
        return settings.STORJ_BUCKET
    return settings.B2_BUCKET


def _is_cloud_provider(provider: str) -> bool:
    """True for any provider that uses S3-compatible cloud storage."""
    return provider in ("S3", "SUPABASE", "STORJ")


class NodeManager:
    def __init__(self) -> None:
        self.base_path = "/app/storage"

    async def get_active_nodes(self) -> List[str]:
        """Fetch names of all healthy and active nodes from the registry."""
        async with async_session_maker() as session:
            result = await session.execute(
                select(NodeRegistry.node_name).where(NodeRegistry.healthy == True)
            )
            return [row[0] for row in result.all()]

    async def write_shard(self, node_name: str, shard_id: str, data: bytes) -> bool:
        """Write shard to the node's cloud storage or local directory with retry logic."""
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()
                if not node or not node.healthy:
                    return False

            if _is_cloud_provider(node.provider) and not os.environ.get("TESTING"):
                if not aioboto3:
                    print(f"[ERROR] aioboto3 not installed — cannot write to {node.provider} node")
                    return False

                s3_config = Config(
                    connect_timeout=30,
                    read_timeout=30,
                    retries={"max_attempts": 1},
                )
                client_kwargs = _s3_client_kwargs(node.provider)
                bucket = _bucket_for(node.provider)
                provider_tag = node.provider.lower()

                last_err = None
                for attempt in range(1, 4):
                    try:
                        s3_session = aioboto3.Session()
                        async with s3_session.client("s3", config=s3_config, **client_kwargs) as s3:
                            await s3.put_object(
                                Bucket=bucket,
                                Key=f"{node_name.lower()}/{shard_id}",
                                Body=data,
                                ContentLength=len(data),
                            )
                        break  # success
                    except Exception as e:
                        last_err = e
                        print(f"[RETRY] [{provider_tag}] write_shard attempt {attempt} failed for {shard_id} on {node_name}: {e}")
                        if attempt < 3:
                            await asyncio.sleep(1)
                else:
                    print(f"[ERROR] [{provider_tag}] write_shard failed for {shard_id} on {node_name} after 3 attempts: {last_err}")
                    return False
            else:
                node_path = os.path.join(self.base_path, node_name.lower())
                os.makedirs(node_path, exist_ok=True)
                with open(os.path.join(node_path, shard_id), "wb") as f:
                    f.write(data)

            # Update per-node storage metadata
            async with async_session_maker() as session:
                metadata = node.node_metadata or {}
                metadata["current_load"] = metadata.get("current_load", 0) + len(data)
                await session.execute(
                    update(NodeRegistry)
                    .where(NodeRegistry.id == node.id)
                    .values(node_metadata=metadata)
                )
                await session.commit()

            return True
        except Exception as e:
            print(f"[ERROR] write_shard: node={node_name} shard={shard_id}: {e}")
            return False

    async def read_shard(self, node_name: str, shard_id: str) -> Optional[bytes]:
        """Read shard from cloud storage or local directory with retry logic."""
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()
                if not node or not node.healthy:
                    return None

            if _is_cloud_provider(node.provider) and not os.environ.get("TESTING"):
                if not aioboto3:
                    return None

                s3_config = Config(
                    connect_timeout=30,
                    read_timeout=30,
                    retries={"max_attempts": 1},
                )
                client_kwargs = _s3_client_kwargs(node.provider)
                bucket = _bucket_for(node.provider)
                provider_tag = node.provider.lower()

                last_err = None
                for attempt in range(1, 4):
                    try:
                        s3_session = aioboto3.Session()
                        async with s3_session.client("s3", config=s3_config, **client_kwargs) as s3:
                            response = await s3.get_object(
                                Bucket=bucket,
                                Key=f"{node_name.lower()}/{shard_id}",
                            )
                            return await response["Body"].read()
                    except Exception as e:
                        last_err = e
                        print(f"[RETRY] [{provider_tag}] read_shard attempt {attempt} failed for {shard_id} on {node_name}: {e}")
                        if attempt < 3:
                            await asyncio.sleep(1)
                else:
                    print(f"[ERROR] [{provider_tag}] read_shard failed for {shard_id} on {node_name} after 3 attempts: {last_err}")
                    return None
            else:
                shard_path = os.path.join(self.base_path, node_name.lower(), shard_id)
                if os.path.exists(shard_path):
                    with open(shard_path, "rb") as f:
                        return f.read()
                return None
        except Exception as e:
            print(f"[ERROR] read_shard: node={node_name} shard={shard_id}: {e}")
            return None

    async def delete_shard(self, node_name: str, shard_id: str) -> bool:
        """Delete shard from cloud storage or local directory with retry logic."""
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()

            if node and _is_cloud_provider(node.provider) and not os.environ.get("TESTING"):
                if not aioboto3:
                    return False

                s3_config = Config(
                    connect_timeout=30,
                    read_timeout=30,
                    retries={"max_attempts": 1},
                )
                client_kwargs = _s3_client_kwargs(node.provider)
                bucket = _bucket_for(node.provider)
                provider_tag = node.provider.lower()

                last_err = None
                for attempt in range(1, 4):
                    try:
                        s3_session = aioboto3.Session()
                        async with s3_session.client("s3", config=s3_config, **client_kwargs) as s3:
                            await s3.delete_object(
                                Bucket=bucket,
                                Key=f"{node_name.lower()}/{shard_id}",
                            )
                        return True
                    except Exception as e:
                        last_err = e
                        print(f"[RETRY] [{provider_tag}] delete_shard attempt {attempt} failed for {shard_id} on {node_name}: {e}")
                        if attempt < 3:
                            await asyncio.sleep(1)
                else:
                    print(f"[ERROR] [{provider_tag}] delete_shard failed for {shard_id} on {node_name} after 3 attempts: {last_err}")
                    return False
            else:
                shard_path = os.path.join(self.base_path, node_name.lower(), shard_id)
                if os.path.exists(shard_path):
                    os.remove(shard_path)
                return True
        except Exception as e:
            print(f"[ERROR] delete_shard: node={node_name} shard={shard_id}: {e}")
            return False

    async def toggle_node(self, node_id: int, status: bool) -> bool:
        """Toggle a node's healthy status (simulate failure/recovery)."""
        try:
            async with async_session_maker() as session:
                await session.execute(
                    update(NodeRegistry)
                    .where(NodeRegistry.id == node_id)
                    .values(healthy=status)
                )
                await session.commit()
            return True
        except Exception:
            return False
