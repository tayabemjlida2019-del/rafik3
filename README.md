# 🧠 RAFIQ Executive Assistant
### المساعد الذكي التنفيذي لمنصة الرفيق

> منصة شاملة لإدارة الحجوزات الفندقية، الكراء السياحي، المطاعم التقليدية، والنقل في **58 ولاية جزائرية** — مع أتمتة كاملة لبوابة الدفع CIB وتحليل جغرافي لحظي.

---

## 🏗️ البنية التقنية

| الطبقة | التقنية |
|--------|---------|
| 🖥️ لوحة التحكم | Next.js 14 + D3.js + Recharts + Framer Motion |
| ⚡ الخلفية | FastAPI + asyncpg + WebSocket |
| 🔄 الأتمتة | n8n Workflows (CIB + Loyalty + Geo) |
| 🗄️ قاعدة البيانات | PostgreSQL 16 (58 ولاية + Triggers) |
| 🔴 التخزين المؤقت | Redis 7 (PubSub للبيانات اللحظية) |
| 🌐 الشبكة | Nginx Reverse Proxy |
| 🐳 النشر | Docker Compose |

---

## 🚀 تشغيل المشروع

### المتطلبات
- Docker Desktop
- Git

### التشغيل
```bash
git clone https://github.com/YOUR_USERNAME/rafiq-executive-assistant
cd rafiq-executive-assistant
cp .env.example .env
# عدّل .env إذا لزم الأمر
docker compose up -d --build
```

### الروابط بعد التشغيل
| الخدمة | الرابط |
|--------|--------|
| 🖥️ لوحة التحكم | http://localhost:3000 |
| 📚 API Docs | http://localhost:8000/api/docs |
| 🔄 n8n | http://localhost:5678 |

---

## 💳 تكامل CIB (وضع تجريبي)

المشروع يعمل حالياً في **Mock Mode** — اختبر الدفع عبر:
```
http://localhost:8000/api/payments/mock-checkout/TEST-001
```

لتفعيل الـ CIB الحقيقي، عدّل في `.env`:
```env
CIB_MOCK_MODE=false
CIB_API_KEY=مفتاحك
CIB_SECRET_KEY=سرك
CIB_MERCHANT_ID=رقم_التاجر
```

---

## 🗺️ الميزات الرئيسية

- ✅ **58 ولاية جزائرية** — خريطة تفاعلية بألوان الذروة
- ✅ **WebSocket** — تحديثات لحظية في لوحة التحكم
- ✅ **n8n Workflows** — أتمتة CIB + مراقبة الولاء + تنبيه الذروة الجغرافية
- ✅ **نقاط الولاء** — تُحسب تلقائياً بعد كل دفعة
- ✅ **الفواتير** — رقم تلقائي بالدينار الجزائري
- ✅ **تنبيهات المدير** — ذروة جغرافية + عملاء VIP

---

## 📁 هيكل المشروع

```
rafiq-executive-assistant/
├── docker-compose.yml
├── .env.example
├── db/init.sql              ← PostgreSQL: 58 ولاية + Schema كامل
├── backend/                 ← FastAPI
├── n8n/workflows/           ← مسارات الأتمتة
├── frontend/                ← Next.js Dashboard
└── nginx/                   ← Reverse Proxy
```

---

## 🇩🇿 منصة الرفيق — الجزائر

مبني تحت مظلة القرار الوزاري 1275 للمؤسسات الناشئة الجزائرية.
