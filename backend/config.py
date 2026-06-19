"""إعدادات البيئة — RAFIQ Executive Assistant"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Any

class Settings(BaseSettings):
    # PostgreSQL
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "rafiq_db"
    POSTGRES_USER: str = "rafiq_admin"
    POSTGRES_PASSWORD: str = "changeme"

    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "changeme"

    # API
    API_SECRET_KEY: str = "dev-secret-key-change-in-production"
    DEBUG: bool = True

    # CIB (Mock Mode for now)
    CIB_API_BASE_URL: str = "https://mock-cib.rafiq.dz/v1"
    CIB_API_KEY: str = "mock_api_key"
    CIB_SECRET_KEY: str = "mock_secret_key"
    CIB_MERCHANT_ID: str = "mock_merchant_id"
    CIB_WEBHOOK_SECRET: str = ""
    CIB_MOCK_MODE: bool = True

    # CORS (comma-separated string OR JSON list)
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:80"

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v: Any) -> str:
        if isinstance(v, list):
            return ','.join(v)
        return str(v)

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(',') if o.strip()]

    # Invoice
    INVOICE_COMPANY_NAME: str = "منصة الرفيق"
    INVOICE_COMPANY_ADDRESS: str = "الجزائر العاصمة، الجزائر"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def REDIS_URL(self) -> str:
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
