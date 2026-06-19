"""
RAFIQ EXECUTIVE ASSISTANT — FastAPI Main Application
المساعد الذكي التنفيذي لمنصة الرفيق
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import logging
from typing import List

from config import settings
from database import create_db_pool, close_db_pool
from cache import create_redis_pool, close_redis_pool, get_redis
from routers import bookings, payments, analytics, notifications, wilayas, ai

# ================================================================
# Logging
# ================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rafiq")

# ================================================================
# WebSocket Connection Manager
# ================================================================
class DashboardConnectionManager:
    """مدير اتصالات WebSocket للوحة التحكم اللحظية"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Dashboard connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Dashboard disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """بث البيانات لجميع لوحات التحكم المتصلة"""
        if not self.active_connections:
            return
        data = json.dumps(message, ensure_ascii=False)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

ws_manager = DashboardConnectionManager()

# ================================================================
# Lifespan (Startup/Shutdown)
# ================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 RAFIQ Executive Assistant starting...")

    # Initialize DB pool
    await create_db_pool()
    logger.info("✅ PostgreSQL connected")

    # Initialize Redis pool
    await create_redis_pool()
    logger.info("✅ Redis connected")

    # Start Redis PubSub listener for n8n events
    asyncio.create_task(listen_redis_events())
    logger.info("✅ Redis PubSub listener started")

    yield

    # Cleanup
    await close_db_pool()
    await close_redis_pool()
    logger.info("👋 RAFIQ Executive Assistant stopped")


async def listen_redis_events():
    """الاستماع لأحداث n8n عبر Redis PubSub وبثها للوحة التحكم"""
    try:
        redis = await get_redis()
        pubsub = redis.pubsub()
        await pubsub.subscribe("rafiq:dashboard:events")
        logger.info("📡 Listening on rafiq:dashboard:events channel")

        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    await ws_manager.broadcast(data)
                except json.JSONDecodeError:
                    pass
    except Exception as e:
        logger.error(f"Redis PubSub error: {e}")

# ================================================================
# FastAPI App
# ================================================================
app = FastAPI(
    title="🧠 RAFIQ Executive Assistant API",
    description="المساعد الذكي التنفيذي — منصة الرفيق الجزائرية",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================================
# WebSocket Endpoint
# ================================================================
@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """WebSocket للبيانات اللحظية في لوحة التحكم"""
    await ws_manager.connect(websocket)
    try:
        while True:
            # انتظار رسائل من العميل (ping/pong)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# ================================================================
# Routers
# ================================================================
app.include_router(bookings.router, prefix="/api/bookings", tags=["📅 الحجوزات"])
app.include_router(payments.router, prefix="/api", tags=["💳 المدفوعات CIB"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["📊 التحليلات"])
app.include_router(notifications.router, prefix="/api/alerts", tags=["🔔 التنبيهات"])
app.include_router(wilayas.router, prefix="/api/wilayas", tags=["🗺️ الولايات"])
app.include_router(ai.router, prefix="/api/ai", tags=["🤖 الذكاء الاصطناعي"])

# ================================================================
# Health Check
# ================================================================
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "RAFIQ Executive Assistant",
        "version": "1.0.0",
        "connections": len(ws_manager.active_connections)
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "🧠 مرحباً بالمساعد الذكي التنفيذي لمنصة الرفيق",
        "docs": "/api/docs",
        "version": "1.0.0"
    }

# Make manager accessible to routers
app.state.ws_manager = ws_manager
