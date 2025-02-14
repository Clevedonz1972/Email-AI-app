import pytest
from ..ai.handlers import AIHandler
from ..models.email import Email, StressLevel
from unittest.mock import patch

@pytest.fixture
def mock_email():
    return Email(
        content="Test email content",
        subject="Test subject",
        sender={"email": "test@example.com"},
        recipient={"email": "recipient@example.com"}
    )

@pytest.mark.asyncio
async def test_email_analysis_flow(
    mock_email,
    mock_openai_api,
    db_session,
    async_client,
    test_user
):
    # Add email to db and link to user
    mock_email.user_id = test_user.id
    db_session.add(mock_email)
    db_session.commit()
    
    response = await async_client.post(
        f"/emails/{mock_email.id}/analyze",
        headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
    )
    assert response.status_code == 200
    assert "stress_level" in response.json()
    
    updated_email = db_session.query(Email).get(mock_email.id)
    assert updated_email.stress_level == StressLevel.LOW

@pytest.mark.asyncio
async def test_error_handling(
    mock_email,
    mock_openai_api,
    async_client,
    test_user,
    db_session
):
    # Add email to db and link to user
    mock_email.user_id = test_user.id
    db_session.add(mock_email)
    db_session.commit()
    
    with patch('openai.ChatCompletion.acreate', side_effect=Exception("API Error")):
        response = await async_client.post(
            f"/emails/{mock_email.id}/analyze",
            headers={"Authorization": f"Bearer {test_user.create_access_token()}"}
        )
        assert response.status_code == 500 