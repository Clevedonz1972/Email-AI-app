from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
from .models.base import Base
import os
from sqlalchemy.pool import StaticPool

# Use test database if in testing mode
testing = os.getenv("TESTING", "").lower() in ("true", "1", "yes")
if testing:
    DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import all models to ensure they are included in Base metadata
from .models import User, Email, Category, EmailAnalysis, EmailMessage
