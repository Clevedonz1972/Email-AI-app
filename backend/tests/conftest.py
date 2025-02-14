import os
os.environ["TESTING"] = "true"  # Set this before other imports

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
from backend.main import app
from backend.ai.handlers import AIHandler
from backend.models.email import StressLevel, Priority
from backend.models import User, Email
from backend.config import settings
from .utils import create_test_user

# Test database URL
TEST_DATABASE_URL = "postgresql://localhost/email_ai_test"

@pytest.fixture(scope="session")
def engine():
    return create_engine(TEST_DATABASE_URL)

@pytest.fixture(scope="function")
def db_session(engine):
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

@pytest.fixture(autouse=True)
def mock_openai_api():
    """Mock OpenAI API for testing"""
    with patch('openai.ChatCompletion.create') as mock_create, \
         patch('openai.ChatCompletion.acreate') as mock_acreate:

        def create_mock_response(content_str: str):
            """Create a properly structured mock response"""
            return type('Response', (), {
                'choices': [
                    type('Choice', (), {
                        'message': type('Message', (), {
                            'content': content_str,
                            'role': 'assistant'
                        }),
                        'finish_reason': 'stop',
                        'index': 0
                    })
                ],
                'model': 'gpt-4',
                'usage': {'total_tokens': 100}
            })

        # Analysis response (for analyze_email)
        analysis_json = json.dumps({
            "summary": "Test summary",
            "stress_level": "low",
            "priority": "medium",
            "action_items": ["Test action item"],
            "sentiment_score": 0.5
        })

        # Reply response (for generate_reply)
        reply_json = json.dumps({
            "content": "This is a test reply",
            "tone": "professional",
            "formality_level": 2
        })

        # Response suggestion
        response_json = json.dumps({
            "content": "Here's a suggested response",
            "tone": "balanced",
            "formality_level": 2
        })

        # Simplified content response
        simplify_json = json.dumps({
            "content": "This is simplified content"
        })

        def get_response(prompt: str):
            if "analyze" in prompt.lower():
                return create_mock_response(analysis_json)
            elif "reply" in prompt.lower():
                return create_mock_response(reply_json)
            elif "response" in prompt.lower():
                return create_mock_response(response_json)
            else:
                return create_mock_response(simplify_json)

        # Set up both sync and async mocks to return the same structure
        mock_create.side_effect = lambda **kwargs: get_response(
            kwargs.get('messages', [{}])[0].get('content', '')
        )
        mock_acreate.side_effect = lambda **kwargs: get_response(
            kwargs.get('messages', [{}])[0].get('content', '')
        )
        yield

@pytest.fixture
def client(db_session):
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
    return create_test_user(db_session) 