"""Redis Cache + PubSub — RAFIQ"""
import redis.asyncio as aioredis
from typing import Optional
import logging
from config import settings

logger = logging.getLogger("rafiq.cache")
_redis: Optional[aioredis.Redis] = None

async def create_redis_pool():
    global _redis
    _redis = aioredis.from_url(
        settings.REDIS_URL, encoding="utf-8",
        decode_responses=True, max_connections=20
    )
    await _redis.ping()
    logger.info("Redis connected")

async def close_redis_pool():
    global _redis
    if _redis:
        await _redis.aclose()

async def get_redis() -> aioredis.Redis:
    if _redis is None:
        raise RuntimeError("Redis not initialized")
    return _redis

async def publish_event(channel: str, data: dict):
    """نشر حدث على Redis PubSub"""
    import json
    r = await get_redis()
    await r.publish(channel, json.dumps(data, ensure_ascii=False))
