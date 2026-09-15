import os
import tempfile
import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

logger = logging.getLogger(__name__)

def get_database_url() -> str:
    db_url = (settings.DATABASE_URL or "").strip()
    # If no DATABASE_URL or pointing to default unconfigured localhost:5432, use serverless SQLite in /tmp
    if not db_url or "localhost:5432" in db_url or "127.0.0.1:5432" in db_url:
        tmp_dir = "/tmp" if os.path.exists("/tmp") else tempfile.gettempdir()
        sqlite_path = os.path.join(tmp_dir, "satquery.db").replace("\\", "/")
        return f"sqlite+aiosqlite:///{sqlite_path}"
    return db_url

async_engine = create_async_engine(
    get_database_url(),
    echo=False,
    future=True,
)

async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            try:
                await session.rollback()
            except Exception:
                pass
            raise
        finally:
            try:
                await session.close()
            except Exception:
                pass

async def get_db_optional() -> AsyncGenerator[Optional[AsyncSession], None]:
    session: Optional[AsyncSession] = None
    try:
        session = async_session_factory()
    except Exception as exc:
        logger.warning("Database unavailable, proceeding in stateless mode: %s", exc)

    if session is None:
        yield None
        return

    try:
        yield session
    except Exception:
        try:
            await session.rollback()
        except Exception:
            pass
        raise
    finally:
        try:
            await session.close()
        except Exception:
            pass
