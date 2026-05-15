import pytest

from httpx import AsyncClient

@pytest.mark.asyncio
async def test_file_list_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/files/list")
    assert response.status_code == 401
