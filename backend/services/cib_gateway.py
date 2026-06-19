"""
CIB Payment Gateway Service — MOCK MODE
خدمة بوابة الدفع CIB (نسخة تجريبية)
ملاحظة: سيتم استبدال هذا بالـ API الحقيقي عند انطلاق المنصة
"""
import httpx
import uuid
import random
import logging
from datetime import datetime
from typing import Optional
from config import settings

logger = logging.getLogger("rafiq.cib")


class CIBGateway:
    """
    بوابة CIB للدفع الإلكتروني
    حالياً: وضع محاكاة (Mock)
    مستقبلاً: يُستبدل بـ CIB_API_BASE_URL الحقيقي + مفاتيح API
    """

    def __init__(self):
        self.base_url = settings.CIB_API_BASE_URL
        self.api_key = settings.CIB_API_KEY
        self.merchant_id = settings.CIB_MERCHANT_ID
        self.mock_mode = settings.CIB_MOCK_MODE

    async def create_payment_order(
        self,
        booking_id: str,
        amount_dzd: float,
        description: str,
        callback_url: str
    ) -> dict:
        """إنشاء طلب دفع جديد عبر CIB"""

        if self.mock_mode:
            return await self._mock_create_order(booking_id, amount_dzd, description)

        # === الكود الحقيقي (يُفعّل بعد الحصول على بيانات CIB) ===
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/orders",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "X-Merchant-ID": self.merchant_id,
                },
                json={
                    "order_id": booking_id,
                    "amount": int(amount_dzd * 100),  # بالسنتيم
                    "currency": "DZD",
                    "description": description,
                    "callback_url": callback_url,
                    "return_url": callback_url,
                }
            )
            response.raise_for_status()
            return response.json()

    async def verify_payment(self, cib_order_id: str) -> dict:
        """التحقق من حالة دفعة عبر CIB"""

        if self.mock_mode:
            return await self._mock_verify_payment(cib_order_id)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/orders/{cib_order_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            response.raise_for_status()
            return response.json()

    # ── Mock Implementations (للتطوير فقط) ──────────────────────

    async def _mock_create_order(self, booking_id: str, amount_dzd: float, description: str) -> dict:
        """محاكاة إنشاء طلب دفع"""
        mock_order_id = f"CIB-MOCK-{uuid.uuid4().hex[:12].upper()}"
        logger.info(f"[MOCK CIB] Created order {mock_order_id} for {amount_dzd:,.0f} DZD")
        return {
            "order_id": mock_order_id,
            "booking_id": booking_id,
            "amount_dzd": amount_dzd,
            "currency": "DZD",
            "payment_url": f"http://localhost:8000/api/payments/mock-checkout/{mock_order_id}",
            "expires_at": datetime.now().isoformat(),
            "status": "pending",
            "mock": True
        }

    async def _mock_verify_payment(self, cib_order_id: str) -> dict:
        """محاكاة التحقق من الدفع — دائماً ناجح في وضع التطوير"""
        logger.info(f"[MOCK CIB] Verifying {cib_order_id}")
        return {
            "order_id": cib_order_id,
            "status": "success",
            "amount_dzd": 0,  # سيُحدَّث من DB
            "paid_at": datetime.now().isoformat(),
            "cib_ref": f"TXN-{uuid.uuid4().hex[:16].upper()}",
            "mock": True
        }


# Singleton
cib_gateway = CIBGateway()
