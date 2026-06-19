"""اتصال PostgreSQL — RAFIQ"""
import asyncpg
from typing import Optional
import logging
from config import settings

logger = logging.getLogger("rafiq.db")
_pool: Optional[asyncpg.Pool] = None

async def create_db_pool():
    global _pool
    _pool = await asyncpg.create_pool(
        host=settings.POSTGRES_HOST, port=settings.POSTGRES_PORT,
        database=settings.POSTGRES_DB, user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        min_size=5, max_size=20, command_timeout=60
    )
    logger.info("PostgreSQL pool created")

async def close_db_pool():
    global _pool
    if _pool:
        await _pool.close()

def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool not initialized")
    return _pool

async def get_conn():
    return get_pool().acquire()
