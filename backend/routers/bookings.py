"""Bookings Router — إدارة الحجوزات"""
import uuid, logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import date
from database import get_pool
from cache import publish_event

logger = logging.getLogger("rafiq.bookings")
router = APIRouter()

class CreateBookingRequest(BaseModel):
    user_phone: str
    user_name: str
    service_id: str
    check_in: date
    check_out: Optional[date] = None
    guests_count: int = 1
    notes: Optional[str] = None
    source: str = "platform"


@router.post("/")
async def create_booking(req: CreateBookingRequest):
    """إنشاء حجز جديد"""
    pool = get_pool()
    async with pool.acquire() as conn:
        # جلب أو إنشاء المستخدم
        user = await conn.fetchrow("SELECT id FROM users WHERE phone=$1", req.user_phone)
        if not user:
            user_id = uuid.uuid4()
            await conn.execute(
                "INSERT INTO users(id, phone, full_name) VALUES($1,$2,$3)",
                user_id, req.user_phone, req.user_name
            )
        else:
            user_id = user["id"]

        # جلب الخدمة
        service = await conn.fetchrow(
            "SELECT id, price_dzd, wilaya_id FROM services WHERE id=$1 AND is_active=TRUE",
            uuid.UUID(req.service_id)
        )
        if not service:
            raise HTTPException(404, "الخدمة غير متاحة")

        nights = 1
        if req.check_out and req.check_in:
            nights = max(1, (req.check_out - req.check_in).days)
        total = float(service["price_dzd"]) * nights * req.guests_count
        commission = total * 0.12

        booking_id = await conn.fetchval(
            """
            INSERT INTO bookings(user_id, service_id, wilaya_id, check_in, check_out,
                                 guests_count, total_dzd, commission_dzd, notes, source)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id
            """,
            user_id, service["id"], service["wilaya_id"],
            req.check_in, req.check_out, req.guests_count,
            total, commission, req.notes, req.source
        )
        booking_ref = await conn.fetchval("SELECT booking_ref FROM bookings WHERE id=$1", booking_id)

    await publish_event("rafiq:dashboard:events", {
        "type": "new_booking",
        "data": {"booking_id": str(booking_id), "booking_ref": booking_ref, "total_dzd": total}
    })

    return {"success": True, "booking_id": str(booking_id), "booking_ref": booking_ref, "total_dzd": total}


@router.get("/")
async def list_bookings(
    status: Optional[str] = None,
    wilaya_code: Optional[int] = None,
    limit: int = Query(50, le=200),
    offset: int = 0
):
    """قائمة الحجوزات مع فلاتر"""
    pool = get_pool()
    async with pool.acquire() as conn:
        query = """
            SELECT b.id, b.booking_ref, b.booking_status, b.check_in, b.check_out,
                   b.total_dzd, b.guests_count, b.source, b.created_at,
                   u.full_name, u.phone, u.loyalty_tier,
                   s.name_ar AS service_name, s.type AS service_type,
                   w.name_ar AS wilaya, w.code AS wilaya_code
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN services s ON s.id = b.service_id
            JOIN wilayas w ON w.id = b.wilaya_id
            WHERE 1=1
        """
        params = []
        if status:
            params.append(status)
            query += f" AND b.booking_status = ${len(params)}"
        if wilaya_code:
            params.append(wilaya_code)
            query += f" AND w.code = ${len(params)}"

        params.extend([limit, offset])
        query += f" ORDER BY b.created_at DESC LIMIT ${len(params)-1} OFFSET ${len(params)}"

        rows = await conn.fetch(query, *params)
        total = await conn.fetchval("SELECT COUNT(*) FROM bookings")

    return {
        "bookings": [dict(r) for r in rows],
        "total": total, "limit": limit, "offset": offset
    }


@router.get("/{booking_id}")
async def get_booking(booking_id: str):
    """تفاصيل حجز محدد"""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT b.*, u.full_name, u.phone, u.loyalty_tier, u.loyalty_pts,
                   s.name_ar AS service_name, s.type AS service_type, s.price_dzd,
                   w.name_ar AS wilaya, w.code AS wilaya_code, w.region,
                   t.status AS payment_status, t.cib_ref, t.invoice_number, t.paid_at
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN services s ON s.id = b.service_id
            JOIN wilayas w ON w.id = b.wilaya_id
            LEFT JOIN transactions t ON t.booking_id = b.id AND t.status='success'
            WHERE b.id = $1
        """, uuid.UUID(booking_id))
        if not row:
            raise HTTPException(404, "الحجز غير موجود")
    return dict(row)


@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """إلغاء حجز"""
    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE bookings SET booking_status='cancelled', updated_at=NOW() WHERE id=$1 AND booking_status='pending'",
            uuid.UUID(booking_id)
        )
    if result == "UPDATE 0":
        raise HTTPException(400, "لا يمكن إلغاء هذا الحجز")
    return {"success": True, "message": "تم إلغاء الحجز"}
