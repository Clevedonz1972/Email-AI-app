import os

os.environ["TESTING"] = "true"  # Set this before other imports
os.environ["OPENAI_API_KEY"] = "test-api-key"
os.environ["JWT_SECRET_KEY"] = "test_secret_key"

import pytest
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from typing import Generator
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime, timedelta
from jose import jwt
from httpx import AsyncClient
import json

from backend.database import Base, get_db, engine, SessionLocal
from backend.main import app
from backend.ai.handlers import AIHandler
from backend.models import User, Email, Category, EmailAnalysis, EmailMessage, UserAnalytics, EmailAnalytics
from backend.models.email import StressLevel, Priority, EmailCategory
from backend.config import settings
from .utils import create_test_user, create_test_email
from backend.auth.security import get_current_active_user
from backend.utils.password import get_password_hash
from .test_data import setup_test_data
from backend.tests.test_data import create_test_users, create_test_emails
from backend.tasks.worker import celery
from backend.services.openai_service import get_client

# Use SQLite in-memory database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

def verify_table_exists(engine, table_name):
    """Check if a table exists in the database"""
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
        return bool(result.scalar())

def verify_all_tables(engine):
    """Verify that all required tables exist"""
    required_tables = [
        "users",
        "emails",
        "categories",
        "email_analysis",
        "user_analytics",
        "email_analytics",
        "email_messages"
    ]
    for table in required_tables:
        if not verify_table_exists(engine, table):
            return False
    return True

@pytest.fixture(scope="function")
def test_engine():
    """Create a test database engine"""
    engine = create_engine(
        TEST_SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=True
    )
    
    # Create all tables
    Base.metadata.drop_all(bind=engine)  # Drop existing tables
    Base.metadata.create_all(bind=engine)
    
    # Verify tables were created
    if not verify_all_tables(engine):
        raise Exception("Failed to create all required database tables")
        
    return engine

@pytest.fixture(scope="function")
def db_session(test_engine):
    """Create a test database session"""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

@pytest.fixture(scope="function")
def test_client(db_session):
    """Create a test client with database session override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def setup_test_db(db_session):
    """Set up test database with sample data"""
    users = create_test_users(db_session)
    emails = create_test_emails(db_session, users)
    db_session.commit()
    return {"users": users, "emails": emails}

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure we're in testing mode"""
    old_env = os.environ.copy()
    os.environ["TESTING"] = "1"
    os.environ["JWT_SECRET_KEY"] = "test-secret-key"  # Add JWT secret key for testing
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["OPENAI_API_KEY"] = "test-api-key"
    os.environ["MAIL_USERNAME"] = "test@example.com"
    os.environ["MAIL_PASSWORD"] = "test_password"
    os.environ["MAIL_FROM"] = "test@example.com"
    os.environ["MAIL_PORT"] = "587"
    os.environ["MAIL_SERVER"] = "smtp.gmail.com"
    os.environ["MAIL_FROM_NAME"] = "Test"
    os.environ["MAIL_TLS"] = "1"
    os.environ["MAIL_SSL"] = "0"
    os.environ["USE_CREDENTIALS"] = "1"
    os.environ["VALIDATE_CERTS"] = "1"
    os.environ["MAIL_SUPPRESS_SEND"] = "1"  # Suppress actual email sending during tests
    os.environ["MAIL_STARTTLS"] = "1"
    os.environ["MAIL_SSL_TLS"] = "0"
    yield
    os.environ.clear()
    os.environ.update(old_env)

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        password_hash="testpassword",
        is_active=True,
        full_name="Test User",
        preferences={}
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_email(db_session, test_user):
    """Create a test email"""
    email = Email(
        user_id=test_user.id,
        subject="Test Email",
        content="This is a test email content",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"},
        is_processed=False,
        stress_level=None,
        priority=None,
        summary=None,
        action_items=None,
        sentiment_score=None
    )
    db_session.add(email)
    db_session.commit()
    db_session.refresh(email)
    return email

@pytest.fixture
def mock_current_user(test_user):
    """Create a mock current user"""
    return {
        "id": test_user.id,
        "email": test_user.email,
        "is_active": True,
        "token": test_user.create_access_token()
    }

@pytest.fixture
def mock_auth_header(mock_current_user):
    """Create mock auth headers"""
    return {"Authorization": f"Bearer {mock_current_user['token']}"}

@pytest.fixture
def ai_handler():
    """Create AI handler for testing"""
    return AIHandler(testing=True)

@pytest.fixture
def mock_openai_response():
    return {
        "stress_level": StressLevel.LOW,
        "priority": Priority.MEDIUM,
        "summary": "Test summary",
        "action_items": ["Action 1", "Action 2"],
        "sentiment_score": 0.5,
    }

@pytest.fixture
async def async_client(db_session):
    """Async test client"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # Session is handled by the db_session fixture

    app.dependency_overrides[get_db] = override_get_db

    # Define an async mock for openai client
    async def async_mock_create(*args, **kwargs):
        # Check if the content contains stress indicators
        content = kwargs.get("messages", [{}])[-1].get("content", "")
        is_stressful = any(word in content.lower() for word in ["urgent", "asap", "deadline"])
        
        return type(
            "MockResponse",
            (),
            {
                "choices": [
                    type(
                        "Choice",
                        (),
                        {
                            "message": type(
                                "Message",
                                (),
                                {
                                    "content": json.dumps(
                                        {
                                            "summary": "Test summary",
                                            "stress_level": "HIGH" if is_stressful else "LOW",
                                            "priority": "HIGH" if is_stressful else "MEDIUM",
                                            "action_items": ["Test action item"],
                                            "sentiment_score": -0.5 if is_stressful else 0.5,
                                            "content": "Test reply content",
                                            "tone": "professional",
                                            "formality_level": 2,
                                        }
                                    )
                                },
                            )
                        },
                    )
                ]
            },
        )

    # Create a mock AsyncOpenAI client
    class MockAsyncOpenAI:
        class ChatCompletions:
            @staticmethod
            async def create(*args, **kwargs):
                return await async_mock_create(*args, **kwargs)
        
        chat = ChatCompletions()

    # Patch the AsyncOpenAI class
    with patch("openai.AsyncOpenAI", return_value=MockAsyncOpenAI()):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def mock_openai_api():
    """Mock OpenAI API responses"""
    with patch("openai.AsyncOpenAI") as mock_client:
        mock_chat = MagicMock()
        mock_completions = MagicMock()
        mock_create = AsyncMock()
        mock_create.return_value.choices = [
            MagicMock(message=MagicMock(content="Mocked OpenAI response"))
        ]
        mock_completions.create = mock_create
        mock_chat.completions = mock_completions
        mock_client.return_value.chat = mock_chat
        yield mock_create

@pytest.fixture
def setup_test_db(db_session):
    """Set up test database with test data"""
    test_data = setup_test_data(db_session)
    return test_data

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure we're in test mode"""
    settings.TESTING = True
    settings.JWT_SECRET_KEY = "test-secret-key"
    return settings

@pytest.fixture(scope="function")
def init_test_db(test_engine, db_session):
    """Initialize test database with required tables and basic data"""
    # Create a test user
    test_user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        is_active=True,
        full_name="Test User"
    )
    db_session.add(test_user)
    
    # Create some test emails
    test_emails = [
        Email(
            user_id=1,
            subject=f"Test Email {i}",
            content=f"This is test email content {i}",
            sender={"email": "sender@example.com", "name": "Sender"},
            recipient={"email": "recipient@example.com", "name": "Recipient"},
            is_processed=True,
            stress_level=StressLevel.LOW,
            priority=Priority.MEDIUM,
            summary="Test summary",
            action_items=["Test action"],
            sentiment_score=0.5,
            created_at=datetime.utcnow()
        )
        for i in range(5)
    ]
    db_session.add_all(test_emails)
    
    try:
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        raise e
    
    return {"user": test_user, "emails": test_emails}

@pytest.fixture(autouse=True)
def setup_test_database(test_engine, db_session, init_test_db):
    """Automatically set up test database for all tests"""
    yield
    # Cleanup after test
    db_session.rollback()
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop all tables after tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_celery():
    # Configure Celery to use memory backend for testing
    celery.conf.update(
        task_always_eager=True,  # Tasks run synchronously
        task_eager_propagates=True,  # Exceptions are propagated
        broker_url='memory://',
        result_backend='cache+memory://'  # Use memory cache as result backend
    )
    return celery

@pytest.fixture(autouse=True)
async def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock_response = {
        "stress_level": "HIGH",
        "priority": "HIGH",
        "summary": "Test summary",
        "action_items": ["Action 1", "Action 2"],
        "sentiment_score": -0.5
    }
    
    # Create a mock response object
    mock_message = MagicMock()
    mock_message.content = json.dumps(mock_response)
    
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    
    # Create the mock client
    mock_client = AsyncMock()
    mock_client.chat.completions.create.return_value = mock_completion
    
    with patch("backend.services.openai_service.get_client", return_value=mock_client):
        yield mock_client
