import requests
import json
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User, UserRole
import hashlib
import bcrypt as bcrypt_lib

BASE_URL = "http://localhost:8000"
DATABASE_URL = "postgresql+asyncpg://user:password@db:5432/vault"

from app.security.jwt import create_access_token

async def setup_db():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(select(User).where(User.email == "settings_tester@example.com"))
        user = res.scalar_one_or_none()
        if not user:
            recovery_key = "SettingsTest123!"
            hashed_input = hashlib.sha256(recovery_key.encode()).hexdigest()
            salt = bcrypt_lib.gensalt()
            recovery_key_hash = bcrypt_lib.hashpw(hashed_input.encode(), salt).decode()
            
            user = User(
                email="settings_tester@example.com",
                username="settings_tester@example.com",
                full_name="Original Name",
                region="us-east",
                master_key_salt="mock_salt",
                recovery_key_hash=recovery_key_hash,
                role=UserRole.user,
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        return user.id

def test_settings():
    user_id = asyncio.run(setup_db())
    print("User ready")
    token = create_access_token(subject=str(user_id))
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test PUT Profile
    put_res = requests.put(f"{BASE_URL}/auth/profile", json={
        "full_name": "Updated Name",
        "region": "ap-northeast"
    }, headers=headers, timeout=10)
    assert put_res.status_code == 200, f"PUT profile failed: {put_res.text}"
    updated_user = put_res.json()
    assert updated_user["full_name"] == "Updated Name", "Name not updated"
    assert updated_user["region"] == "ap-northeast", "Region not updated"
    print("PUT /auth/profile tested successfully")
    
    # Test GET Nodes Health
    nodes_res = requests.get(f"{BASE_URL}/health/nodes", timeout=10)
    assert nodes_res.status_code == 200, f"GET nodes failed: {nodes_res.text}"
    nodes_data = nodes_res.json()
    assert "active_nodes" in nodes_data, "Missing active_nodes"
    print("GET /health/nodes tested successfully")
    
    print("ALL API TESTS PASSED")

if __name__ == "__main__":
    test_settings()
