import sys
import asyncio
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.seed import seed_catalog_images
from app.core.auth import create_access_token

def pytest_configure(config):
    config.addinivalue_line("markers", "network: mark test as network-dependent external API call")


@pytest.fixture(autouse=True)
def mock_external_api_keys(monkeypatch):
    """
    Autouse fixture to isolate test runs from ambient environment keys.
    Ensures tests run in unconfigured/offline mode by default,
    allowing deterministic AgentRouter fallback and predictable status responses.
    """
    monkeypatch.setattr("app.config.settings.OPENAI_API_KEY", None, raising=False)
    monkeypatch.setattr("app.config.settings.PLANETARY_COMPUTER_SUBSCRIPTION_KEY", None, raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("PLANETARY_COMPUTER_SUBSCRIPTION_KEY", raising=False)


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

test_session_factory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def override_get_db():
    async with test_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    async def init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        async with test_session_factory() as session:
            await seed_catalog_images(session)

    asyncio.run(init_db())
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def auth_headers():
    token = create_access_token({
        "sub": "test-user-sub-12345",
        "email": "analyst@satquery.ai",
        "role": "authenticated",
        "user_metadata": {"role": "GIS Analyst"},
    })
    return {"Authorization": f"Bearer {token}"}

