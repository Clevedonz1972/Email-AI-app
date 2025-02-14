import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from models.email import Email, StressLevel, Priority
from models.user import User
from main import app
from tests.utils import create_test_user, create_test_email

client = TestClient(app)

@pytest.fixture
def test_user(db: Session):
    return create_test_user(db)

@pytest.fixture
def test_email(db: Session, test_user: User):
    return create_test_email(db, test_user)

def test_create_email(client, test_user):
    response = client.post(
        "/emails",
        json={
            "subject": "Test Email",
            "content": "This is a test email content",
            "sender": {"email": "sender@example.com", "name": "Sender"},
            "recipient": {"email": "recipient@example.com", "name": "Recipient"},
            "category": "inbox"
        },
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    assert response.status_code == 200

def test_get_emails(client, test_user):
    response = client.get(
        "/emails",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    assert response.status_code == 200

def test_analyze_email(db: Session, test_user: User, test_email: Email):
    response = client.post(
        f"/emails/{test_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["stress_level"], str)
    assert isinstance(data["priority"], str)
    assert isinstance(data["sentiment_score"], float) 