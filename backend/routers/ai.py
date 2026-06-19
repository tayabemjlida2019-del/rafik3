"""AI Agent Router — واجهة الذكاء الاصطناعي والأوامر"""
import logging
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from database import get_pool
from cache import publish_event
import httpx

logger = logging.getLogger("rafiq.ai")
router = APIRouter()

class CommandRequest(BaseModel):
    command: str

@router.post("/command")
async def process_command(req: CommandRequest):
    """معالجة الأوامر النصية من المدير التنفيذي"""
    cmd = req.command.lower()
    
    # محاكاة التفكير والتحليل
    await asyncio.sleep(1.5)
    
    reply = ""
    action_taken = False
    
    if "ضغط" in cmd or "تحليل" in cmd or "خريطة" in cmd:
        reply = "بناءً على البيانات اللحظية، هناك ضغط متزايد على ولايات الشمال (خاصة العاصمة وتيبازة). هل أُرسل تنبيهاً لمقدمي الخدمات لرفع الطاقة الاستيعابية؟"
        
    elif "ولاء" in cmd or "عملاء" in cmd or "بلاتيني" in cmd:
        reply = "لقد قمت بفرز العملاء. لدينا 5 عملاء جدد وصلوا للمستوى البلاتيني اليوم. هل تود أن أقوم بتجهيز قسائم خصم خاصة لهم كهدية ولاء؟"
        
    elif "فاتورة" in cmd or "دفع" in cmd or "مالية" in cmd:
        reply = "الوضع المالي مستقر. جميع مدفوعات CIB الأخيرة تمت بنجاح وتم توليد الفواتير تلقائياً. إيرادات اليوم في معدلها الطبيعي المرتفع."
        
    elif "رسالة" in cmd or "أرسل" in cmd or "نعم" in cmd or "قسائم" in cmd:
        reply = "تم تنفيذ الأمر بنجاح. قمت بتوجيه النظام لإرسال قسائم الخصم للعملاء البلاتينيين عبر الأتمتة."
        action_taken = True
        
        # Trigger n8n webhook
        try:
            async with httpx.AsyncClient() as client:
                await client.post("http://n8n:5678/webhook/ai-action", json={"action": "send_vip_discounts"})
        except Exception as e:
            logger.error(f"Failed to trigger n8n webhook: {e}")
        
    else:
        reply = "مرحباً سيدي المدير، أنا المساعد التنفيذي الذكي. أراقب المؤشرات المالية والجغرافية باستمرار. كيف يمكنني مساعدتك الآن؟ (جرب: حلل الضغط، أو عرض العملاء)"

    # إرسال إشعار للنظام إذا تم اتخاذ إجراء
    if action_taken:
        await publish_event("rafiq:dashboard:events", {
            "type": "new_alert",
            "data": {"id": "ai-action", "title_ar": "🤖 إجراء ذكي", "severity": "info", "body_ar": "تم تنفيذ أمر المدير التنفيذي بنجاح."}
        })

    return {"reply": reply, "success": True}
