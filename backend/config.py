from pydantic import BaseSettings, Field
import os
from pathlib import Path
from typing import List

# Get the backend directory (where config.py is located)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, le=60)
    OPENAI_API_KEY: str
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    TESTING: bool = False
    LOG_LEVEL: str = "INFO"
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    # Redis settings
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")

    # Email settings
    MAIL_USERNAME: str = Field(default="")
    MAIL_PASSWORD: str = Field(default="")
    MAIL_FROM: str = Field(default="")
    MAIL_PORT: int = Field(default=587)
    MAIL_SERVER: str = Field(default="smtp.gmail.com")
    MAIL_FROM_NAME: str = Field(default="Email AI App")
    MAIL_TLS: bool = Field(default=True)
    MAIL_SSL: bool = Field(default=False)
    USE_CREDENTIALS: bool = Field(default=True)
    VALIDATE_CERTS: bool = Field(default=True)

    class Config:
        # Use absolute path for env files
        env_file = str(BASE_DIR / (".env.test" if os.getenv("TESTING") else ".env"))
        env_file_encoding = "utf-8"


print(
    f"Looking for env file at: {str(BASE_DIR / ('.env.test' if os.getenv('TESTING') else '.env'))}"
)

settings = Settings()

print(
    "Loaded settings:",
    {
        "DATABASE_URL": settings.DATABASE_URL,
        "JWT_SECRET_KEY": "***" if settings.JWT_SECRET_KEY else None,
        "OPENAI_API_KEY": "***" if settings.OPENAI_API_KEY else None,
    },
)
