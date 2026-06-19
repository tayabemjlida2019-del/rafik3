#!/bin/bash
# ============================================================
# RAFIQ Executive Assistant — Quick Start Script
# ============================================================
set -e

echo ""
echo "🧭 RAFIQ Executive Assistant — بدء التشغيل"
echo "=============================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت. ثبّته أولاً: https://docker.com"
    exit 1
fi

# Setup .env if not exists
if [ ! -f .env ]; then
    echo "📋 نسخ ملف البيئة..."
    cp .env.example .env
    echo "⚠️  عدّل ملف .env وأضف بيانات CIB الحقيقية لاحقاً"
fi

# Generate random secrets if using defaults
sed -i 's/CHANGE_ME_STRONG_PASSWORD/rafiq_pg_'$(openssl rand -hex 8)'/g' .env 2>/dev/null || true
sed -i 's/CHANGE_ME_SECRET_KEY_256BIT/rafiq_api_'$(openssl rand -hex 32)'/g' .env 2>/dev/null || true
sed -i 's/CHANGE_ME_REDIS_PASSWORD/rafiq_redis_'$(openssl rand -hex 8)'/g' .env 2>/dev/null || true
sed -i 's/CHANGE_ME_N8N_PASSWORD/rafiq_n8n_'$(openssl rand -hex 8)'/g' .env 2>/dev/null || true
sed -i 's/CHANGE_ME_ENCRYPTION_KEY/'$(openssl rand -hex 24)'/g' .env 2>/dev/null || true

echo "🚀 تشغيل الحاويات..."
docker compose up -d --build

echo ""
echo "⏳ انتظار تهيئة قاعدة البيانات (30 ثانية)..."
sleep 30

echo ""
echo "✅ النظام يعمل!"
echo ""
echo "  🖥️  لوحة التحكم:   http://localhost:3000"
echo "  ⚡  FastAPI Docs:   http://localhost:8000/api/docs"
echo "  🔄  n8n Workflows:  http://localhost:5678"
echo "  🗄️  PostgreSQL:     localhost:5432 / rafiq_db"
echo ""
echo "  📥 اختبار Webhook CIB:"
echo "     curl -X POST http://localhost:8000/api/payments/webhook/cib \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"order_id\":\"CIB-TEST-001\",\"status\":\"success\",\"transaction_id\":\"TXN-TEST\"}'"
echo ""
