import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_endpoints(client: AsyncClient) -> None:
    # Use /health/ with a trailing slash to prevent 307 temporary redirects
    response = await client.get("/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    response = await client.get("/health/redis")
    assert response.status_code in (200, 500)
