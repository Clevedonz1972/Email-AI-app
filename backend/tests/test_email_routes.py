import pytest
from sqlalchemy.orm import Session
from backend.models.email import Email, StressLevel, Priority
from backend.models.user import User
from backend.main import app
from backend.database import get_db
from fastapi.testclient import TestClient
from tests.utils import create_test_user, create_test_email

client = TestClient(app)


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        password_hash="hashed_password",
        full_name="Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_email(db_session: Session, test_user: User):
    """Create a test email"""
    email = Email(
        subject="Test Email",
        content="Test content",
        user_id=test_user.id,
        sender={"email": "test@example.com", "name": "Test User"},
        recipient={"email": "recipient@example.com", "name": "Recipient"},
        category_id=None
    )
    db_session.add(email)
    db_session.commit()
    db_session.refresh(email)
    return email


def test_create_email(client, test_user):
    """Test email creation"""
    response = client.post(
        "/api/emails",
        json={
            "subject": "Test Email",
            "content": "Test content",
            "sender": {"email": "test@example.com", "name": "Test User"},
            "recipient": {"email": "recipient@example.com", "name": "Recipient"},
            "category_id": None,
        },
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["subject"] == "Test Email"
    assert data["content"] == "Test content"


def test_get_emails(client, test_user):
    """Test getting emails"""
    response = client.get(
        "/api/emails",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_analyze_email(client, test_user, test_email):
    """Test email analysis"""
    response = client.post(
        f"/api/emails/{test_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "stress_level" in data
    assert "priority" in data
    assert "action_items" in data
    assert "sentiment_score" in data
