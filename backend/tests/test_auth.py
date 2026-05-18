import pytest
from httpx import AsyncClient
from app.models.user import User

@pytest.mark.asyncio
async def test_register_start(client: AsyncClient):
    response = await client.post("/auth/register/start", json={
        "email": "newuser@example.com",
        "full_name": "New User",
        "region": "us-west",
        "access_key": "some-access-key-xyz",
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
async def test_login_fallback_success(client: AsyncClient, test_user: User):
    response = await client.post("/auth/login/fallback", json={
        "email": "testuser@example.com",
        "access_key": "test-access-key-123"
    })
    assert response.status_code == 200
    res_data = response.json()
    assert "access_token" in res_data
    assert "refresh_token" in res_data
    assert res_data["user"]["email"] == "testuser@example.com"

@pytest.mark.asyncio
async def test_login_fallback_invalid_key(client: AsyncClient, test_user: User):
    response = await client.post("/auth/login/fallback", json={
        "email": "testuser@example.com",
        "access_key": "wrong-access-key"
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_login_fallback_unregistered(client: AsyncClient):
    response = await client.post("/auth/login/fallback", json={
        "email": "unregistered@example.com",
        "access_key": "any-key"
    })
    assert response.status_code == 401
