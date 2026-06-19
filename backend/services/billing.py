"""خدمة توليد الفواتير PDF بالدينار الجزائري"""
import logging
import os
from datetime import datetime
from database import get_pool
import uuid

logger = logging.getLogger("rafiq.billing")

async def generate_invoice(transaction_id: str, booking_id: str, amount_dzd: float):
    """توليد فاتورة PDF وتحديث قاعدة البيانات"""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            # جلب تفاصيل الحجز للفاتورة
            data = await conn.fetchrow("""
                SELECT b.booking_ref, b.check_in, b.check_out, b.guests_count,
                       u.full_name, u.phone,
                       s.name_ar AS service_name, s.type AS service_type,
                       w.name_ar AS wilaya,
                       t.invoice_number, t.cib_ref, t.amount_dzd, t.paid_at
                FROM transactions t
                JOIN bookings b ON b.id = t.booking_id
                JOIN users u ON u.id = b.user_id
                JOIN services s ON s.id = b.service_id
                JOIN wilayas w ON w.id = b.wilaya_id
                WHERE t.id = $1
            """, uuid.UUID(transaction_id))

            if not data:
                logger.error(f"Invoice data not found for transaction {transaction_id}")
                return

            invoice_content = _build_invoice_text(data)
            invoice_path = f"/app/assets/invoices/{data['invoice_number']}.txt"
            os.makedirs(os.path.dirname(invoice_path), exist_ok=True)

            with open(invoice_path, "w", encoding="utf-8") as f:
                f.write(invoice_content)

            await conn.execute(
                "UPDATE transactions SET invoice_pdf_url=$1 WHERE id=$2",
                invoice_path, uuid.UUID(transaction_id)
            )
            logger.info(f"✅ Invoice generated: {data['invoice_number']}")

    except Exception as e:
        logger.error(f"Invoice generation failed: {e}")


def _build_invoice_text(data: dict) -> str:
    """بناء نص الفاتورة"""
    divider = "═" * 50
    return f"""
{divider}
           منصة الرفيق — فاتورة رسمية
           RAFIQ Platform — Official Invoice
{divider}

رقم الفاتورة:  {data['invoice_number']}
رقم الحجز:    {data['booking_ref']}
مرجع CIB:     {data['cib_ref'] or 'MOCK'}
تاريخ الدفع:  {data['paid_at'].strftime('%Y-%m-%d %H:%M') if data['paid_at'] else 'N/A'}

{divider}
بيانات العميل:
   الاسم:    {data['full_name'] or 'غير محدد'}
   الهاتف:   {data['phone']}

{divider}
تفاصيل الخدمة:
   الخدمة:   {data['service_name']}
   النوع:    {data['service_type']}
   الولاية:  {data['wilaya']}
   الدخول:   {data['check_in']}
   الخروج:   {data['check_out'] or 'N/A'}
   الضيوف:   {data['guests_count']}

{divider}
المبلغ الإجمالي:  {float(data['amount_dzd']):,.2f} دج (DZD)
{divider}
شكراً لاختياركم منصة الرفيق
الجزائر — www.rafiq.dz
{divider}
"""
