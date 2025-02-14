from pydantic_settings import BaseSettings
import os
from pathlib import Path
from typing import List

# Get the backend directory (where config.py is located)
BASE_DIR = Path(__file__).resolve().parent  # Removed one .parent

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    TESTING: bool = False
    LOG_LEVEL: str = "INFO"
    
    class Config:
        # Use absolute path for env files
        env_file = str(BASE_DIR / ".env.test" if os.getenv("TESTING") else ".env")
        env_file_encoding = "utf-8"

print(f"Looking for env file at: {str(BASE_DIR / '.env.test' if os.getenv('TESTING') else '.env')}")

settings = Settings()

print("Loaded settings:", {
    "DATABASE_URL": settings.DATABASE_URL,
    "JWT_SECRET_KEY": "***" if settings.JWT_SECRET_KEY else None,
    "OPENAI_API_KEY": "***" if settings.OPENAI_API_KEY else None
}) 