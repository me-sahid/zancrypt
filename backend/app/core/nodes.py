import os
import shutil
from sqlalchemy import select
from app.models.node_registry import NodeRegistry
from app.db import async_session_maker

DEFAULT_NODES = [
    {
        "node_name": "Backblaze-Node1", 
        "region": "us-west-004", 
        "provider": "S3",
        "metadata":{
            "bucket": os.environ.get("B2_BUCKET", "zancrypt-node-1"),
            "endpoint": os.environ.get("B2_ENDPOINT", ""),
            "access_key": os.environ.get("B2_KEY_ID",""),
            "secret_key": os.environ.get("B2_APP_KEY",""),
            "capacity_gb":1024,
            "current_load": 0
        }
    }
    ,
    {
        "node_name": "Supabase-Node2", 
        "region": os.environ.get("SUPABASE_REGION","ap-south-1" ), 
        "provider": "S3",
        "metadata":{
            "bucket": os.environ.get("SUPABASE_BUCKET", "zancrypt-node-1"),
            "endpoint": os.environ.get("SUPABASE_ENDPOINT", ""),
            "access_key": os.environ.get("SUPABASE_ACCESS_KEY",""),
            "secret_key": os.environ.get("SUPABASE_SECRET_KEY",""),
            "capacity_gb":1024,
            "current_load": 0
        }
    },
    {
        "node_name": "Storj-Node3", 
        "region": os.environ.get("STORJ_REGION","global" ), 
        "provider": "S3",
        "metadata":{
            "bucket": os.environ.get("STORJ_BUCKET", "zancrypt-node-1"),
            "endpoint": os.environ.get("STORJ_ENDPOINT", ""),
            "access_key": os.environ.get("STORJ_ACCESS_KEY",""),
            "secret_key": os.environ.get("STORJ_SECRET_KEY",""),
            "capacity_gb":1024,
            "current_load": 0
        }
    }
]

async def initialize_nodes():
    """Seed the database with default nodes — no local disk storage."""
    async with async_session_maker() as session:
        for node_data in DEFAULT_NODES:
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
                    node_metadata=node_data["metadata"]
                )
                session.add(new_node)
            else:
                node.node_metadata = node_data["metadata"]
                node.region = node_data["region"]
        
        
        await session.commit()
