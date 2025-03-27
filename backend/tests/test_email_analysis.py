import pytest
from backend.schemas.email import EmailMessage
from unittest.mock import patch, AsyncMock
from backend.services.stress_analysis import analyze_email_stress
from backend.models.email import Email, StressLevel, Priority
from backend.models.user import UserPreferences


@pytest.fixture
def mock_email():
    return Email(
        subject="Test Subject",
        content="Test content",
        sender={"email": "test@example.com", "name": "Test User"},
        recipient={"email": "recipient@example.com", "name": "Recipient"},
        is_processed=False,
        stress_level=None,
        priority=None,
        summary=None,
        action_items=None,
        sentiment_score=None
    )


def test_email_analysis_flow(mock_email, client, test_user, db_session):
    """Test email analysis flow"""
    # Add email to db and link to user
    mock_email.user_id = test_user.id
    mock_email.content = "Test content for analysis"
    db_session.add(mock_email)
    db_session.commit()
    db_session.refresh(mock_email)

    # Make the analysis request
    response = client.post(
        f"/api/emails/{mock_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["stress_level"] == StressLevel.LOW.value
    assert data["priority"] == Priority.MEDIUM.value
    assert data["summary"] == "Test summary"
    assert data["action_items"] == ["Test action"]
    assert data["sentiment_score"] == 0.5


def test_error_handling(mock_email, client, test_user, db_session):
    """Test error handling"""
    mock_email.user_id = test_user.id
    db_session.add(mock_email)
    db_session.commit()
    db_session.refresh(mock_email)

    with patch("backend.ai.handlers.AIHandler.analyze_email") as mock_analyze:
        mock_analyze.side_effect = Exception("API Error")
        
        response = client.post(
            f"/api/emails/{mock_email.id}/analyze",
            headers={"Authorization": f"Bearer {test_user.create_access_token()}"},
        )
        assert response.status_code == 500
        assert "Failed to analyze email" in response.json()["detail"]


@pytest.mark.asyncio
async def test_stress_analysis():
    """Test stress analysis service"""
    email = EmailMessage(
        id="test",
        subject="Test Email",
        content="This is a test email with urgent deadline",
        sender={"email": "test@example.com", "name": "Test User"},
        timestamp="2024-02-21T12:00:00Z"
    )

    user_prefs = UserPreferences(
        id=1,
        user_id=1,
        stress_sensitivity="MEDIUM",
        anxiety_triggers=["deadline", "urgent"]
    )

    result = await analyze_email_stress(email, user_prefs)
    assert result is not None
    assert result.stress_level == "MEDIUM"
    assert result.priority in ["LOW", "MEDIUM", "HIGH"]
    assert result.summary is not None
    assert isinstance(result.action_items, list)
    assert isinstance(result.sentiment_score, float)
