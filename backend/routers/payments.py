"""
Payments Router — CIB Webhook + Payment Initiation
مسارات المدفوعات — بوابة CIB
"""
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from database import get_pool
from services.cib_gateway import cib_gateway
from services.billing import generate_invoice
from cache import publish_event

logger = logging.getLogger("rafiq.payments")
router = APIRouter()


class InitPaymentRequest(BaseModel):
    booking_id: str
    callback_url: str = "http://localhost:8000/api/payments/webhook/cib"


# ──────────────────────────────────────────────
# POST /api/payments/initiate
# بدء عملية الدفع عبر CIB
# ──────────────────────────────────────────────
@router.post("/payments/initiate")
async def initiate_payment(req: InitPaymentRequest):
    """بدء عملية دفع جديدة عبر CIB"""
    pool = get_pool()

    async with pool.acquire() as conn:
        # جلب بيانات الحجز
        booking = await conn.fetchrow(
            """
            SELECT b.id, b.booking_ref, b.total_dzd, b.booking_status,
                   u.full_name, s.name_ar AS service_name
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN services s ON s.id = b.service_id
            WHERE b.id = $1
            """,
            uuid.UUID(req.booking_id)
        )

        if not booking:
            raise HTTPException(404, "الحجز غير موجود")

        if booking["booking_status"] == "paid":
            raise HTTPException(400, "تم دفع هذا الحجز مسبقاً")

        # إنشاء طلب دفع CIB
        cib_order = await cib_gateway.create_payment_order(
            booking_id=str(booking["id"]),
            amount_dzd=float(booking["total_dzd"]),
            description=f"حجز {booking['service_name']} — {booking['booking_ref']}",
            callback_url=req.callback_url
        )

        # تسجيل المعاملة في DB
        await conn.execute(
            """
            INSERT INTO transactions (booking_id, amount_dzd, cib_order_id, status)
            VALUES ($1, $2, $3, 'pending')
            ON CONFLICT (cib_order_id) DO NOTHING
            """,
            uuid.UUID(req.booking_id),
            booking["total_dzd"],
            cib_order["order_id"]
        )

    return {
        "success": True,
        "order": cib_order,
        "booking_ref": booking["booking_ref"],
        "amount_dzd": float(booking["total_dzd"])
    }


# ──────────────────────────────────────────────
# POST /api/payments/webhook/cib
# Webhook استقبال إشعار الدفع من CIB
# ──────────────────────────────────────────────
@router.post("/payments/webhook/cib")
async def cib_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    استقبال إشعار الدفع من بوابة CIB
    ملاحظة: لا يوجد HMAC validation في النسخة الحالية
    سيُضاف عند توفر بيانات CIB الحقيقية
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON payload")

    cib_order_id = payload.get("order_id") or payload.get("cib_order_id")
    status = payload.get("status", "").lower()
    cib_ref = payload.get("transaction_id") or payload.get("cib_ref", f"TXN-{uuid.uuid4().hex[:16].upper()}")

    if not cib_order_id:
        raise HTTPException(400, "Missing order_id in payload")

    logger.info(f"CIB Webhook received: order={cib_order_id}, status={status}")

    pool = get_pool()
    async with pool.acquire() as conn:
        # جلب المعاملة
        txn = await conn.fetchrow(
            "SELECT id, booking_id, amount_dzd FROM transactions WHERE cib_order_id = $1",
            cib_order_id
        )

        if not txn:
            logger.warning(f"Transaction not found for CIB order: {cib_order_id}")
            return {"received": True}

        if status in ("success", "paid", "completed"):
            # ✅ دفع ناجح
            await conn.execute(
                """
                UPDATE transactions
                SET status='success', cib_ref=$1, cib_payload=$2, paid_at=NOW()
                WHERE id=$3
                """,
                cib_ref, str(payload), txn["id"]
            )
            await conn.execute(
                "UPDATE bookings SET booking_status='paid', updated_at=NOW() WHERE id=$1",
                txn["booking_id"]
            )

            # توليد الفاتورة في الخلفية
            background_tasks.add_task(
                generate_invoice, str(txn["id"]), str(txn["booking_id"]),
                float(txn["amount_dzd"])
            )

            # إشعار لوحة التحكم عبر Redis
            await publish_event("rafiq:dashboard:events", {
                "type": "payment_success",
                "data": {
                    "transaction_id": str(txn["id"]),
                    "booking_id": str(txn["booking_id"]),
                    "amount_dzd": float(txn["amount_dzd"]),
                    "cib_ref": cib_ref,
                    "timestamp": datetime.now().isoformat()
                }
            })
            logger.info(f"✅ Payment confirmed: {cib_ref} — {txn['amount_dzd']:,.0f} DZD")

        elif status in ("failed", "error", "cancelled"):
            # ❌ دفع فاشل
            await conn.execute(
                "UPDATE transactions SET status='failed', cib_payload=$1 WHERE id=$2",
                str(payload), txn["id"]
            )
            await conn.execute(
                "UPDATE bookings SET booking_status='pending', updated_at=NOW() WHERE id=$1",
                txn["booking_id"]
            )
            await publish_event("rafiq:dashboard:events", {
                "type": "payment_failed",
                "data": {
                    "booking_id": str(txn["booking_id"]),
                    "reason": payload.get("reason", "CIB payment failed"),
                    "timestamp": datetime.now().isoformat()
                }
            })

    return {"received": True, "processed": True}


# ──────────────────────────────────────────────
# GET /api/payments/mock-checkout/{order_id}
# صفحة دفع تجريبية (Mock CIB Checkout)
# ──────────────────────────────────────────────
@router.get("/payments/mock-checkout/{order_id}", response_class=HTMLResponse)
async def mock_checkout_page(order_id: str):
    """صفحة دفع تجريبية تحاكي CIB — تُزال في الإنتاج"""
    html = f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>CIB — صفحة الدفع التجريبية</title>
        <style>
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            body {{ font-family: Arial, sans-serif; background: #0a0a14; color: #fff;
                   display: flex; align-items: center; justify-content: center; min-height: 100vh; }}
            .card {{ background: #1a1a2e; border: 1px solid #6366f1; border-radius: 16px;
                    padding: 40px; max-width: 420px; width: 90%; text-align: center; }}
            .logo {{ font-size: 48px; margin-bottom: 16px; }}
            h1 {{ color: #6366f1; margin-bottom: 8px; }}
            .order {{ background: #0a0a14; border-radius: 8px; padding: 16px;
                     margin: 24px 0; font-size: 13px; color: #94a3b8; }}
            .order span {{ color: #22d3ee; font-weight: bold; }}
            .btn {{ display: block; width: 100%; padding: 14px;
                   border: none; border-radius: 10px; font-size: 16px;
                   cursor: pointer; margin-top: 12px; font-weight: bold; }}
            .btn-success {{ background: linear-gradient(135deg, #6366f1, #22d3ee); color: #fff; }}
            .btn-fail {{ background: #1e293b; color: #ef4444; border: 1px solid #ef4444; }}
            .badge {{ background: #f59e0b22; color: #f59e0b; border: 1px solid #f59e0b44;
                    padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 20px;
                    display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">🏦</div>
            <div class="badge">وضع تجريبي — MOCK CIB</div>
            <h1>بوابة دفع الرفيق</h1>
            <p style="color:#94a3b8; font-size:14px;">محاكاة دفع CIB للتطوير</p>
            <div class="order">
                رقم الطلب: <span>{order_id}</span><br><br>
                هذه الصفحة تجريبية. اضغط "محاكاة نجاح الدفع"
                لاختبار مسار n8n الكامل.
            </div>
            <button class="btn btn-success" onclick="simulatePayment('success')">
                ✅ محاكاة نجاح الدفع
            </button>
            <button class="btn btn-fail" onclick="simulatePayment('failed')">
                ❌ محاكاة فشل الدفع
            </button>
            <p id="msg" style="margin-top:16px;font-size:13px;color:#22d3ee;"></p>
        </div>
        <script>
            async function simulatePayment(status) {{
                document.getElementById('msg').textContent = '⏳ جارٍ المعالجة...';
                const res = await fetch('/api/payments/webhook/cib', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{
                        order_id: '{order_id}',
                        status: status,
                        transaction_id: 'TXN-MOCK-' + Date.now(),
                        amount: 0
                    }})
                }});
                const data = await res.json();
                document.getElementById('msg').textContent =
                    status === 'success' ? '✅ تم تأكيد الدفع! تحقق من لوحة التحكم.' : '❌ تم محاكاة فشل الدفع.';
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


# ──────────────────────────────────────────────
# GET /api/payments/summary
# ملخص المعاملات المالية
# ──────────────────────────────────────────────
@router.get("/payments/summary")
async def payments_summary():
    """ملخص مالي شامل بالدينار الجزائري"""
    pool = get_pool()
    async with pool.acquire() as conn:
        stats = await conn.fetchrow("""
            SELECT
                COUNT(*) FILTER (WHERE status='success') AS total_success,
                COUNT(*) FILTER (WHERE status='failed') AS total_failed,
                COUNT(*) FILTER (WHERE status='pending') AS total_pending,
                COALESCE(SUM(amount_dzd) FILTER (WHERE status='success'), 0) AS total_revenue,
                COALESCE(SUM(amount_dzd) FILTER (WHERE status='success' AND paid_at >= NOW()-INTERVAL '24h'), 0) AS revenue_24h,
                COALESCE(SUM(amount_dzd) FILTER (WHERE status='success' AND paid_at >= NOW()-INTERVAL '7d'), 0) AS revenue_7d,
                COALESCE(SUM(amount_dzd) FILTER (WHERE status='success' AND DATE_TRUNC('month',paid_at)=DATE_TRUNC('month',NOW())), 0) AS revenue_month
            FROM transactions
        """)
        recent = await conn.fetch("""
            SELECT t.id, t.amount_dzd, t.cib_ref, t.status, t.paid_at,
                   t.invoice_number, b.booking_ref, u.full_name, w.name_ar AS wilaya
            FROM transactions t
            JOIN bookings b ON b.id = t.booking_id
            JOIN users u ON u.id = b.user_id
            JOIN wilayas w ON w.id = b.wilaya_id
            ORDER BY t.created_at DESC LIMIT 20
        """)

    return {
        "summary": {
            "total_success": stats["total_success"],
            "total_failed": stats["total_failed"],
            "total_pending": stats["total_pending"],
            "revenue": {
                "total": float(stats["total_revenue"]),
                "last_24h": float(stats["revenue_24h"]),
                "last_7d": float(stats["revenue_7d"]),
                "this_month": float(stats["revenue_month"]),
                "currency": "DZD"
            }
        },
        "recent_transactions": [dict(r) for r in recent]
    }
