import asyncio

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from app.main import app as main_app

from httpx import ASGITransport

@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"

@pytest.fixture(scope="session")
async def app() -> FastAPI:
    return main_app

@pytest.fixture(scope="session")
async def client(app: FastAPI) -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        yield client

