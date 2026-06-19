"""Analytics Router — تحليل جغرافي وولاء العملاء"""
import logging
from fastapi import APIRouter
from database import get_pool

logger = logging.getLogger("rafiq.analytics")
router = APIRouter()


@router.get("/geo-pressure")
async def geo_pressure():
    """🗺️ تحليل الضغط الجغرافي اللحظي — 58 ولاية"""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT w.code, w.name_ar, w.name_fr, w.region,
                   w.latitude, w.longitude,
                   COUNT(b.id) AS active_bookings,
                   COALESCE(SUM(t.amount_dzd) FILTER (WHERE t.status='success'), 0) AS revenue_24h,
                   COUNT(b.id) FILTER (WHERE b.booking_status='paid') AS paid_bookings
            FROM wilayas w
            LEFT JOIN bookings b ON b.wilaya_id = w.id
              AND b.created_at >= NOW() - INTERVAL '24 hours'
            LEFT JOIN transactions t ON t.booking_id = b.id
            GROUP BY w.code, w.name_ar, w.name_fr, w.region, w.latitude, w.longitude
            ORDER BY active_bookings DESC
        """)

        max_bookings = max((r["active_bookings"] for r in rows), default=1) or 1
        result = []
        for r in rows:
            intensity = round(r["active_bookings"] / max_bookings, 3)
            result.append({
                "code": r["code"],
                "name_ar": r["name_ar"],
                "name_fr": r["name_fr"],
                "region": r["region"],
                "lat": float(r["latitude"] or 0),
                "lng": float(r["longitude"] or 0),
                "active_bookings": r["active_bookings"],
                "paid_bookings": r["paid_bookings"],
                "revenue_24h": float(r["revenue_24h"]),
                "intensity": intensity,
                "status": "hot" if intensity > 0.7 else "warm" if intensity > 0.3 else "cold"
            })
    return {"wilayas": result, "total": len(result)}


@router.get("/top-customers")
async def top_customers(limit: int = 20):
    """⭐ أفضل العملاء حسب نقاط الولاء"""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT u.id, u.full_name, u.phone, u.loyalty_pts,
                   u.loyalty_tier, u.total_spent, u.bookings_count,
                   w.name_ar AS wilaya, u.created_at
            FROM users u LEFT JOIN wilayas w ON w.id = u.wilaya_id
            WHERE u.is_active = TRUE
            ORDER BY u.loyalty_pts DESC LIMIT $1
        """, limit)

    return {
        "customers": [
            {**dict(r), "total_spent": float(r["total_spent"]),
             "tier_icon": {"platinum":"💎","gold":"🥇","silver":"🥈","bronze":"🥉"}.get(r["loyalty_tier"],"🥉")}
            for r in rows
        ],
        "total": len(rows)
    }


@router.get("/kpis")
async def dashboard_kpis():
    """📊 KPIs الرئيسية للوحة التحكم"""
    pool = get_pool()
    async with pool.acquire() as conn:
        kpis = await conn.fetchrow("""
            SELECT
                (SELECT COUNT(*) FROM bookings WHERE booking_status NOT IN ('cancelled','completed')) AS active_bookings,
                (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE) AS today_bookings,
                (SELECT COUNT(*) FROM users WHERE is_active=TRUE) AS total_customers,
                (SELECT COALESCE(SUM(amount_dzd),0) FROM transactions WHERE status='success' AND DATE(paid_at)=CURRENT_DATE) AS today_revenue,
                (SELECT COALESCE(SUM(amount_dzd),0) FROM transactions WHERE status='success' AND DATE_TRUNC('month',paid_at)=DATE_TRUNC('month',NOW())) AS month_revenue,
                (SELECT COUNT(DISTINCT wilaya_id) FROM bookings WHERE booking_status IN ('confirmed','paid') AND created_at >= NOW()-INTERVAL '24h') AS active_wilayas,
                (SELECT COUNT(*) FROM alerts WHERE is_read=FALSE) AS unread_alerts
        """)
        revenue_trend = await conn.fetch("""
            SELECT DATE(paid_at) AS day,
                   SUM(amount_dzd) AS revenue,
                   COUNT(*) AS transactions
            FROM transactions WHERE status='success'
              AND paid_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(paid_at) ORDER BY day
        """)
        service_breakdown = await conn.fetch("""
            SELECT s.type, COUNT(b.id) AS bookings,
                   COALESCE(SUM(t.amount_dzd),0) AS revenue
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            LEFT JOIN transactions t ON t.booking_id = b.id AND t.status='success'
            GROUP BY s.type ORDER BY revenue DESC
        """)

    return {
        "kpis": {
            "active_bookings": kpis["active_bookings"],
            "today_bookings": kpis["today_bookings"],
            "total_customers": kpis["total_customers"],
            "today_revenue_dzd": float(kpis["today_revenue"]),
            "month_revenue_dzd": float(kpis["month_revenue"]),
            "active_wilayas": kpis["active_wilayas"],
            "unread_alerts": kpis["unread_alerts"],
        },
        "revenue_trend": [
            {"day": str(r["day"]), "revenue": float(r["revenue"]), "transactions": r["transactions"]}
            for r in revenue_trend
        ],
        "service_breakdown": [
            {"type": r["type"], "bookings": r["bookings"], "revenue": float(r["revenue"])}
            for r in service_breakdown
        ]
    }


@router.get("/revenue-by-region")
async def revenue_by_region():
    """إيرادات مجمّعة حسب المنطقة (شمال / هضاب / جنوب)"""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT w.region,
                   COUNT(b.id) AS bookings,
                   COALESCE(SUM(t.amount_dzd),0) AS revenue
            FROM wilayas w
            LEFT JOIN bookings b ON b.wilaya_id = w.id
            LEFT JOIN transactions t ON t.booking_id = b.id AND t.status='success'
            GROUP BY w.region ORDER BY revenue DESC
        """)
    return [{"region": r["region"], "bookings": r["bookings"], "revenue": float(r["revenue"])} for r in rows]
