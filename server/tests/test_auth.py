import pytest
from httpx import AsyncClient
from app.models.user import User

@pytest.mark.asyncio
async def test_register_start(client: AsyncClient):
    response = await client.post("/auth/register/start", json={
        "email": "newuser@example.com",
        "full_name": "New User",
        "region": "us-west",
        "recovery_key": "some-recovery-key-xyz",
        "master_key_salt": "some-salt",
        "encrypted_recovery_metadata": "some-recovery"
    })
    assert response.status_code == 200
    res_data = response.json()
    assert "options" in res_data
    assert "session_id" in res_data

@pytest.mark.asyncio
async def test_register_start_already_registered(client: AsyncClient, test_user: User):
    # test_user has email "testuser@example.com"
    response = await client.post("/auth/register/start", json={
        "email": test_user.email,
        "full_name": "Duplicate User",
        "region": "us-west"
    })
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_fallback_removed(client: AsyncClient):
    # Fallback login endpoint has been removed; passkeys are the exclusive authentication method
    response = await client.post("/auth/login/fallback", json={
        "email": "testuser@example.com",
        "recovery_key": "any-key"
    })
    assert response.status_code in (404, 405)
