import asyncio
from typing import AsyncIterator
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app as main_app
from app.core.config import settings
import app.db
import app.storage.node_manager
import app.core.nodes

from app.models import User, UserRole, File, FileVersion, Manifest, ShardRegistry, Session as UserSession, WebAuthnCredential
import hashlib
import bcrypt as bcrypt_lib

_global_loop = None

@pytest.fixture(scope="function")
def event_loop():
    global _global_loop
    if _global_loop is None or _global_loop.is_closed():
        _global_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_global_loop)
    yield _global_loop

@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"

@pytest.fixture(scope="session")
def fastapi_app() -> FastAPI:
    return main_app

@pytest.fixture(scope="function", autouse=True)
async def setup_test_engine() -> AsyncIterator[None]:
    # Use NullPool to ensure connections are closed and not pooled across tests
    test_engine = create_async_engine(
        str(settings.DATABASE_URL),
        poolclass=NullPool,
        future=True
    )
    orig_engine = app.db.engine
    orig_sessionmaker = app.db.AsyncSessionLocal
    orig_db_maker = app.db.async_session_maker
    orig_node_maker = app.storage.node_manager.async_session_maker
    orig_core_maker = app.core.nodes.async_session_maker

    # Guarantee all tables (including newly added ones) exist for test sessions
    from app.models.base import Base
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    test_session_maker = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    app.db.engine = test_engine
    app.db.AsyncSessionLocal = test_session_maker
    app.db.async_session_maker = test_session_maker
    app.storage.node_manager.async_session_maker = test_session_maker
    app.core.nodes.async_session_maker = test_session_maker

    yield

    await test_engine.dispose()
    app.db.engine = orig_engine
    app.db.AsyncSessionLocal = orig_sessionmaker
    app.db.async_session_maker = orig_db_maker
    app.storage.node_manager.async_session_maker = orig_node_maker
    app.core.nodes.async_session_maker = orig_core_maker

@pytest.fixture(scope="function")
async def db_session() -> AsyncIterator[AsyncSession]:
    async with app.db.AsyncSessionLocal() as session:
        yield session
        
        # Cleanup test data to keep the database completely pristine
        from sqlalchemy import delete, select
        result = await session.execute(
            select(User.id).where(User.email.like("%@example.com"))
        )
        test_user_ids = [row[0] for row in result.all()]

        if test_user_ids:
            file_result = await session.execute(
                select(File.id).where(File.owner_id.in_(test_user_ids))
            )
            file_ids = [row[0] for row in file_result.all()]

            if file_ids:
                from app.models.share import Share
                await session.execute(
                    delete(Share).where(Share.owner_user_id.in_(test_user_ids))
                )
                await session.execute(
                    delete(Manifest).where(Manifest.file_id.in_(file_ids))
                )
                await session.execute(
                    delete(ShardRegistry).where(ShardRegistry.file_id.in_(file_ids))
                )
                await session.execute(
                    delete(FileVersion).where(FileVersion.file_id.in_(file_ids))
                )
                await session.execute(
                    delete(File).where(File.id.in_(file_ids))
                )

            await session.execute(
                delete(WebAuthnCredential).where(WebAuthnCredential.user_id.in_(test_user_ids))
            )
            await session.execute(
                delete(UserSession).where(UserSession.user_id.in_(test_user_ids))
            )
            await session.execute(
                delete(User).where(User.id.in_(test_user_ids))
            )
            await session.commit()

@pytest.fixture(scope="function")
async def client(fastapi_app: FastAPI) -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://testserver") as client:
        yield client

@pytest.fixture(scope="function")
async def test_user(db_session: AsyncSession) -> User:
    from sqlalchemy import select
    result = await db_session.execute(select(User).where(User.email == "testuser@example.com"))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    access_key = "test-access-key-123"
    hashed_input = hashlib.sha256(access_key.encode()).hexdigest()
    salt = bcrypt_lib.gensalt()
    identity_verifier = bcrypt_lib.hashpw(hashed_input.encode(), salt).decode()

    user = User(
        email="testuser@example.com",
        username="testuser@example.com",
        full_name="Test User",
        region="us-east",
        master_key_salt="mock-salt-123",
        identity_verifier=identity_verifier,
        encrypted_recovery_metadata="mock-recovery-metadata",
        role=UserRole.user,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def user_token(test_user: User) -> str:
    from app.security.jwt import create_access_token
    return create_access_token(subject=str(test_user.id))

@pytest.fixture(scope="function")
async def auth_client(client: AsyncClient, user_token: str) -> AsyncIterator[AsyncClient]:
    client.headers["Authorization"] = f"Bearer {user_token}"
    yield client
    if "Authorization" in client.headers:
        del client.headers["Authorization"]
