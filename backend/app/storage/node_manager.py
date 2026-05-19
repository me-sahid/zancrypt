import os
import shutil
import hashlib
from typing import List, Optional
from sqlalchemy import select, update
from app.models.node_registry import NodeRegistry
from app.db import async_session_maker
from app.core.config import settings

try:
    import aioboto3
except ImportError:
    aioboto3 = None

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
        """Physically write shard to the node's local directory if healthy."""
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()
                if not node or not node.healthy:
                    return False

            if node.provider == "S3":
                if not aioboto3:
                    print("aioboto3 not installed for S3 node")
                    return False
                s3_session = aioboto3.Session()
                async with s3_session.client(
                    "s3",
                    endpoint_url=settings.B2_ENDPOINT,
                    aws_access_key_id=settings.B2_KEY_ID,
                    aws_secret_access_key=settings.B2_APP_KEY,
                ) as s3_client:
                    bucket = settings.B2_BUCKET
                    await s3_client.put_object(Bucket=bucket, Key=f"{node_name.lower()}/{shard_id}", Body=data)
            else:
                node_path = os.path.join(self.base_path, node_name.lower())
                os.makedirs(node_path, exist_ok=True)
                
                shard_path = os.path.join(node_path, shard_id)
                with open(shard_path, "wb") as f:
                    f.write(data)
            
            # Update storage metrics in metadata
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
            print(f"Error writing to node {node_name}: {e}")
            return False

    async def read_shard(self, node_name: str, shard_id: str) -> Optional[bytes]:
        """Read shard from node if healthy."""
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()
                if not node or not node.healthy:
                    return None

            if node.provider == "S3":
                if not aioboto3:
                    return None
                s3_session = aioboto3.Session()
                async with s3_session.client(
                    "s3",
                    endpoint_url=settings.B2_ENDPOINT,
                    aws_access_key_id=settings.B2_KEY_ID,
                    aws_secret_access_key=settings.B2_APP_KEY,
                ) as s3_client:
                    bucket = settings.B2_BUCKET
                    response = await s3_client.get_object(Bucket=bucket, Key=f"{node_name.lower()}/{shard_id}")
                    return await response['Body'].read()
            else:
                shard_path = os.path.join(self.base_path, node_name.lower(), shard_id)
                if os.path.exists(shard_path):
                    with open(shard_path, "rb") as f:
                        return f.read()
                return None
        except Exception:
            return None

    async def delete_shard(self, node_name: str, shard_id: str) -> bool:
        try:
            async with async_session_maker() as session:
                result = await session.execute(
                    select(NodeRegistry).where(NodeRegistry.node_name == node_name)
                )
                node = result.scalar_one_or_none()
                
            if node and node.provider == "S3":
                if not aioboto3:
                    return False
                s3_session = aioboto3.Session()
                async with s3_session.client(
                    "s3",
                    endpoint_url=settings.B2_ENDPOINT,
                    aws_access_key_id=settings.B2_KEY_ID,
                    aws_secret_access_key=settings.B2_APP_KEY,
                ) as s3_client:
                    bucket = settings.B2_BUCKET
                    await s3_client.delete_object(Bucket=bucket, Key=f"{node_name.lower()}/{shard_id}")
                    return True
            else:
                shard_path = os.path.join(self.base_path, node_name.lower(), shard_id)
                if os.path.exists(shard_path):
                    os.remove(shard_path)
                return True
        except Exception:
            return False

    async def toggle_node(self, node_id: int, status: bool) -> bool:
        """Simulate node failure/recovery by toggling its healthy status."""
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
