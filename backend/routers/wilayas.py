"""Wilayas Router — 58 ولاية جزائرية"""
from fastapi import APIRouter
from database import get_pool

router = APIRouter()

@router.get("/")
async def get_wilayas():
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM wilayas ORDER BY code")
    return {"wilayas": [dict(r) for r in rows]}

@router.get("/{code}")
async def get_wilaya(code: int):
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM wilayas WHERE code=$1", code)
    if not row:
        from fastapi import HTTPException
        raise HTTPException(404, "الولاية غير موجودة")
    return dict(row)
