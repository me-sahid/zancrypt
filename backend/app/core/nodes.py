import os
import shutil
from sqlalchemy import select
from app.models.node_registry import NodeRegistry
from app.db import async_session_maker

DEFAULT_NODES = [
    {"node_name": "Backblaze-Node1", "region": "us-west-004", "provider": "S3"},
    {"node_name": "Supabase-Node2", "region": "ap-south-1", "provider": "SUPABASE"},
    {"node_name": "Storj-Node3", "region": "us-east-1", "provider": "STORJ"},
    {"node_name": "Tokyo-Alpha", "region": "ap-northeast-1", "provider": "AWS"},
    {"node_name": "Frankfurt-01", "region": "eu-central-1", "provider": "GCP"},
    {"node_name": "Mumbai-Primary", "region": "ap-south-1", "provider": "DigitalOcean"},
    {"node_name": "Oregon-Delta", "region": "us-west-2", "provider": "Azure"},
    {"node_name": "Singapore-Zeta", "region": "ap-southeast-1", "provider": "Oracle"},
]

STORAGE_BASE_DIR = os.environ.get("STORAGE_BASE_DIR", "/tmp/storage")

async def initialize_nodes():
    """Seed the database with default nodes and create local storage directories."""
    # 1. Create storage directories
    if not os.path.exists(STORAGE_BASE_DIR):
        os.makedirs(STORAGE_BASE_DIR)
        
    async with async_session_maker() as session:
        for node_data in DEFAULT_NODES:
            # Create local folder for node
            node_path = os.path.join(STORAGE_BASE_DIR, node_data["node_name"].lower())
            if not os.path.exists(node_path):
                os.makedirs(node_path)
            
            # Check if node already exists in DB
            result = await session.execute(
                select(NodeRegistry).where(NodeRegistry.node_name == node_data["node_name"])
            )
            node = result.scalar_one_or_none()
            
            if not node:
                new_node = NodeRegistry(
                    node_name=node_data["node_name"],
                    region=node_data["region"],
                    provider=node_data["provider"],
                    healthy=True,
                    node_metadata={
                        "path": node_path,
                        "capacity_gb": 1024,
                        "current_load": 0
                    }
                )
                session.add(new_node)
        
        await session.commit()
