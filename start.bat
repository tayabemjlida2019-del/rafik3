@echo off
:: ============================================================
:: RAFIQ Executive Assistant — Windows Quick Start
:: ============================================================
title RAFIQ Executive Assistant

echo.
echo  =========================================
echo   RAFIQ Executive Assistant — Windows
echo  =========================================
echo.

:: Check Docker Desktop
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop غير مثبت
    echo تحميل: https://www.docker.com/products/docker-desktop/
    pause & exit /b 1
)

:: Setup .env
if not exist ".env" (
    echo [INFO] نسخ ملف البيئة...
    copy .env.example .env
    echo [WARN] عدّل .env وأضف بيانات CIB عند الاستعداد
)

echo [INFO] بناء وتشغيل الحاويات...
docker compose up -d --build

echo.
echo [INFO] انتظار 30 ثانية لتهيئة قاعدة البيانات...
timeout /t 30 /nobreak >nul

echo.
echo  =========================================
echo   النظام يعمل!
echo  =========================================
echo.
echo   Dashboard:   http://localhost:3000
echo   API Docs:    http://localhost:8000/api/docs
echo   n8n:         http://localhost:5678
echo.
echo   [اختبار CIB Webhook]
echo   افتح: http://localhost:8000/api/payments/mock-checkout/TEST-001
echo.

start http://localhost:3000
pause
