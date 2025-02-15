import os
os.environ["TESTING"] = "true"  # Set this before other imports
os.environ["OPENAI_API_KEY"] = "sk-testdummyapikey"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from typing import Generator
from unittest.mock import patch
from datetime import datetime, timedelta
from jose import jwt
from httpx import AsyncClient
import json

from backend.database import Base, get_db
from backend.main import app as fastapi_app
from backend.ai.handlers import AIHandler
from backend.models.email import StressLevel, Priority
from backend.models import User, Email
from backend.config import settings
from .utils import create_test_user, create_test_email

# Test database URL
TEST_DATABASE_URL = "postgresql://localhost/email_ai_test"

@pytest.fixture(scope="session")
def engine():
    return create_engine(TEST_DATABASE_URL)

@pytest.fixture
def db_session(engine):
    """Create a fresh database session for each test"""
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)

# Export db_session as db for backward compatibility
db = db_session

@pytest.fixture
def app():
    """Main FastAPI app fixture"""
    return fastapi_app

@pytest.fixture
def client(app, db_session):
    """Test client with DB session"""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def create_test_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    data = {
        "sub": str(user_id),
        "exp": expire
    }
    return jwt.encode(data, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

@pytest.fixture
def mock_current_user():
    user = {
        "id": 1,
        "email": "test@example.com",
        "is_active": True
    }
    user["token"] = create_test_token(user["id"])
    return user

@pytest.fixture
def mock_auth_header(mock_current_user):
    return {"Authorization": f"Bearer {mock_current_user['token']}"}

@pytest.fixture
def ai_handler():
    return AIHandler(testing=True)

@pytest.fixture
def mock_openai_response():
    return {
        "stress_level": StressLevel.LOW,
        "priority": Priority.MEDIUM,
        "summary": "Test summary",
        "action_items": ["Action 1", "Action 2"],
        "sentiment_score": 0.5
    }

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure we're in testing mode"""
    old_env = os.environ.copy()
    os.environ["TESTING"] = "1"
    yield
    os.environ.clear()
    os.environ.update(old_env)

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    return create_test_user(db_session)

@pytest.fixture
def test_email(db_session, test_user):
    """Create a test email"""
    return create_test_email(db_session, test_user)

@pytest.fixture
async def async_client(app, db_session):
    """Async test client"""
    app.dependency_overrides[get_db] = lambda: db_session

    # Define an async mock for openai.ChatCompletion.acreate
    async def async_mock_acreate(*args, **kwargs):
        return type('MockResponse', (), {
            "choices": [
                type('Choice', (), {
                    "message": type('Message', (), {
                        "content": json.dumps({
                            "summary": "Test summary",
                            "stress_level": "LOW",
                            "priority": "MEDIUM",
                            "action_items": ["Test action item"],
                            "sentiment_score": 0.5,
                            "content": "Test reply content",
                            "tone": "professional",
                            "formality_level": 2
                        })
                    })
                })
            ]
        })

    # Patch the async function before yielding the client
    from unittest.mock import patch
    with patch("openai.ChatCompletion.acreate", side_effect=async_mock_acreate):
        from httpx import AsyncClient
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def mock_openai_api():
    """(Optional) Additional global patch if needed; already handled in async_client."""
    yield 