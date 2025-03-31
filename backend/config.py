from pydantic import BaseSettings, Field
import os
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

# Get the backend directory (where config.py is located)
BASE_DIR = Path(__file__).resolve().parent.parent

# Force set the JWT_SECRET_KEY
os.environ["JWT_SECRET_KEY"] = "your_super_secret_key_for_development_only"

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, le=60)
    OPENAI_API_KEY: str
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost", "http://frontend:3000", "http://frontend", "http://127.0.0.1:3000"]
    TESTING: bool = False
    LOG_LEVEL: str = "INFO"
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    # Redis settings
    REDIS_HOST: str = Field(default="redis")
    REDIS_PORT: int = Field(default=6379)
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/0")

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

    # Neo4j settings
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password")
    
    # OpenAI settings
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    
    # Vector memory settings
    VECTOR_MEMORY_COLLECTION: str = os.getenv("VECTOR_MEMORY_COLLECTION", "email_memory")
    VECTOR_MEMORY_DIMENSION: int = int(os.getenv("VECTOR_MEMORY_DIMENSION", "1536"))
    
    # Application settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD: int = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
    
    # Cache settings
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))
    CACHE_MAX_SIZE: int = int(os.getenv("CACHE_MAX_SIZE", "1000"))

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

def to_dict(self) -> Dict[str, Any]:
    """Convert settings to dictionary"""
    return {
        key: value for key, value in self.__dict__.items()
        if not key.startswith("_")
    }
