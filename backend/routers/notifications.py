"""Notifications/Alerts Router — تنبيهات المدير"""
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import get_pool
from cache import publish_event

logger = logging.getLogger("rafiq.alerts")
router = APIRouter()


class CreateAlertRequest(BaseModel):
    type: str
    title_ar: str
    body_ar: Optional[str] = None
    severity: str = "info"
    metadata: Optional[dict] = None


@router.get("/")
async def get_alerts(unread_only: bool = False, limit: int = 50):
    """جلب قائمة التنبيهات"""
    pool = get_pool()
    async with pool.acquire() as conn:
        query = "SELECT * FROM alerts"
        if unread_only:
            query += " WHERE is_read=FALSE"
        query += " ORDER BY created_at DESC LIMIT $1"
        rows = await conn.fetch(query, limit)
    return {"alerts": [dict(r) for r in rows]}


@router.post("/")
async def create_alert(req: CreateAlertRequest):
    """إنشاء تنبيه جديد (من n8n أو النظام)"""
    pool = get_pool()
    import json
    async with pool.acquire() as conn:
        alert_id = await conn.fetchval(
            """INSERT INTO alerts(type, title_ar, body_ar, severity, metadata)
               VALUES($1,$2,$3,$4,$5) RETURNING id""",
            req.type, req.title_ar, req.body_ar, req.severity,
            json.dumps(req.metadata) if req.metadata else None
        )
    await publish_event("rafiq:dashboard:events", {
        "type": "new_alert",
        "data": {"id": str(alert_id), "title_ar": req.title_ar, "severity": req.severity}
    })
    return {"success": True, "id": str(alert_id)}


@router.patch("/{alert_id}/read")
async def mark_read(alert_id: str):
    """تحديد التنبيه كمقروء"""
    pool = get_pool()
    import uuid
    async with pool.acquire() as conn:
        await conn.execute("UPDATE alerts SET is_read=TRUE WHERE id=$1", uuid.UUID(alert_id))
    return {"success": True}


@router.patch("/read-all")
async def mark_all_read():
    """تحديد جميع التنبيهات كمقروءة"""
    pool = get_pool()
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM alerts WHERE is_read=FALSE")
        await conn.execute("UPDATE alerts SET is_read=TRUE WHERE is_read=FALSE")
    return {"success": True, "marked_count": count}
