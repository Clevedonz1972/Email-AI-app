import pytest
from fastapi.testclient import TestClient
from ..conftest import client, db  # noqa
from httpx import AsyncClient
from backend.main import app
from ..utils import create_test_user, create_test_email

@pytest.fixture
def auth_headers(mock_current_user):
    return {"Authorization": f"Bearer {mock_current_user['token']}"}

def test_create_email(client, test_user):
    """Test email creation with proper response structure"""
    response = client.post(
        "/emails",
        json={
            "subject": "Test Email",
            "content": "Test content",
            "sender": {"email": "test@example.com", "name": "Test User"},
            "recipient": {"email": "recipient@example.com", "name": "Recipient"},
            "category": "inbox"
        },
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["subject"] == "Test Email"
    assert data["content"] == "Test content"

def test_get_emails(client, test_user):
    """Test getting user's emails"""
    response = client.get(
        "/emails",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_analyze_email(client, test_user, test_email):
    """Test email analysis with proper mock response"""
    response = client.post(
        f"/emails/{test_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "stress_level" in data
    assert "priority" in data
    assert "sentiment_score" in data
    assert "summary" in data
    assert "action_items" in data

def test_generate_reply(client, test_user, test_email):
    """Test reply generation for an email"""
    response = client.post(
        f"/emails/{test_email.id}/reply",
        params={"tone": "professional"},
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "tone" in data
    assert "formality_level" in data 