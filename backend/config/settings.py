from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional, List
import os
from pathlib import Path

# Get the backend directory (where config.py is located)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = Field(
        default="sqlite:///./test.db",
        description="Database connection string"
    )
    
    # JWT settings
    JWT_SECRET_KEY: str = Field(
        default="your-secret-key",
        description="Secret key for JWT token generation"
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm for JWT token generation"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    
    # Frontend settings
    FRONTEND_URL: str = Field(
        default="http://localhost:3000",
        description="Frontend application URL"
    )
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"],
        description="Allowed CORS origins"
    )
    
    # Email settings
    MAIL_USERNAME: str = Field(
        default="test@example.com",
        description="SMTP username"
    )
    MAIL_PASSWORD: str = Field(
        default="password",
        description="SMTP password"
    )
    MAIL_FROM: str = Field(
        default="test@example.com",
        description="From email address"
    )
    MAIL_PORT: int = Field(
        default=587,
        description="SMTP port"
    )
    MAIL_SERVER: str = Field(
        default="smtp.gmail.com",
        description="SMTP server"
    )
    MAIL_STARTTLS: bool = Field(
        default=True,
        description="Use STARTTLS"
    )
    MAIL_SSL_TLS: bool = Field(
        default=False,
        description="Use SSL/TLS"
    )
    MAIL_USE_CREDENTIALS: bool = Field(
        default=True,
        description="Use SMTP authentication"
    )
    MAIL_VALIDATE_CERTS: bool = Field(
        default=True,
        description="Validate SSL certificates"
    )
    
    # Testing settings
    TESTING: bool = Field(
        default=False,
        description="Testing mode flag"
    )
    TEST_USER_EMAIL: str = Field(
        default="test@example.com",
        description="Test user email"
    )
    TEST_USER_PASSWORD: str = Field(
        default="test123",
        description="Test user password"
    )
    
    # OpenAI settings
    OPENAI_API_KEY: str = Field(
        default="your-openai-key",
        description="OpenAI API key"
    )
    
    # Logging settings
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level"
    )

    # Redis settings
    REDIS_HOST: str = Field(
        default="localhost",
        description="Redis host"
    )
    REDIS_PORT: int = Field(
        default=6379,
        description="Redis port"
    )
    REDIS_PASSWORD: Optional[str] = Field(
        default=None,
        description="Redis password"
    )
    REDIS_DB: int = Field(
        default=0,
        description="Redis database number"
    )

    # Celery settings
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Celery broker URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/0",
        description="Celery result backend"
    )
    
    # Monitoring settings
    SENTRY_DSN: Optional[str] = Field(
        default=None,
        description="Sentry DSN"
    )
    ENVIRONMENT: str = Field(
        default="development",
        description="Environment (development/staging/production)"
    )
    
    # Email settings
    MAIL_FROM_NAME: str = Field(
        default="Email AI App",
        description="From email name"
    )
    USE_CREDENTIALS: bool = Field(
        default=True,
        description="Use SMTP authentication"
    )
    VALIDATE_CERTS: bool = Field(
        default=True,
        description="Validate SSL certificates"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = "utf-8"


print(
    f"Looking for env file at: {str(BASE_DIR / ('.env.test' if os.getenv('TESTING') else '.env'))}"
)

settings = Settings(
    _env_file=str(BASE_DIR / ('.env.test' if os.getenv('TESTING') else '.env'))
)

print(
    "Loaded settings:",
    {
        "DATABASE_URL": settings.DATABASE_URL,
        "JWT_SECRET_KEY": "***" if settings.JWT_SECRET_KEY else None,
        "OPENAI_API_KEY": "***" if settings.OPENAI_API_KEY else None,
        "REDIS_HOST": settings.REDIS_HOST,
        "ENVIRONMENT": settings.ENVIRONMENT,
    },
) 