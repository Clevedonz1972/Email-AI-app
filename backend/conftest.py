import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from backend.database import Base, get_db
from backend.main import app
from backend.config import settings
from backend.models.user import User
from backend.models.email import Email

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="session")
def TestingSessionLocal(engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal

@pytest.fixture
def db(TestingSessionLocal):
    """Get a database session for testing"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db):
    """Get a test client"""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture(autouse=True)
def test_env():
    """Ensure we're in test mode"""
    settings.TESTING = True
    return settings

@pytest.fixture
def test_user(db):
    user = User(
        email="test@example.com",
        hashed_password="testpassword",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def mock_openai_api(monkeypatch):
    def mock_create(*args, **kwargs):
        return {
            "choices": [
                {
                    "message": {
                        "content": "{'stress_level': 'LOW', 'priority': 'NORMAL', 'summary': 'Test summary', 'action_items': [], 'sentiment_score': 0.5}"
                    }
                }
            ]
        }
    
    monkeypatch.setattr("openai.ChatCompletion.create", mock_create) 