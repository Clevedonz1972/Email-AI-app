import pytest
from backend.models.email import Email, StressLevel
from unittest.mock import patch

@pytest.fixture
def mock_email():
    return Email(
        content="Test email content",
        subject="Test subject",
        sender={"email": "test@example.com"},
        recipient={"email": "recipient@example.com"}
    )

def test_email_analysis_flow(
    mock_email,
    mock_openai_api,
    client,
    test_user,
    db_session
):
    # Add email to db and link to user
    mock_email.user_id = test_user.id
    db_session.add(mock_email)
    db_session.commit()
    
    response = client.post(
        f"/emails/{mock_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    assert response.status_code == 200
    assert "stress_level" in response.json()
    
    updated_email = db_session.query(Email).get(mock_email.id)
    assert updated_email.stress_level == StressLevel.LOW

def test_error_handling(
    mock_email,
    client,
    test_user,
    db_session
):
    mock_email.user_id = test_user.id
    db_session.add(mock_email)
    db_session.commit()
    
    with patch('openai.ChatCompletion.create', side_effect=Exception("API Error")):
        response = client.post(
            f"/emails/{mock_email.id}/analyze",
            headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
        )
        assert response.status_code == 500 