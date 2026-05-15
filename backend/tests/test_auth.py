import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_register_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/auth/register", json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "strongpassword123"
        })
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

@pytest.mark.asyncio
async def test_login_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First register
        await ac.post("/auth/register", json={
            "email": "test2@example.com",
            "username": "testuser2",
            "password": "strongpassword123"
        })
        # Then login
        response = await ac.post("/auth/login", data={
            "username": "testuser2",
            "password": "strongpassword123"
        })
    assert response.status_code == 200
    assert "access_token" in response.json()

