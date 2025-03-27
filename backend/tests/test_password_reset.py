import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from backend.utils.email import send_password_reset_email
from backend.models.user import User
from jose import jwt
from backend.config import settings
from fastapi import HTTPException
from datetime import datetime, timedelta
from fastapi_mail.errors import ConnectionErrors


@pytest.mark.asyncio
async def test_forgot_password_endpoint_valid_email(client, test_user):
    """Test forgot password with valid email"""
    with patch("backend.utils.email.FastMail") as mock_fastmail:
        mock_instance = AsyncMock()
        mock_instance.send_message = AsyncMock()
        mock_fastmail.return_value = mock_instance

        response = client.post("/api/auth/forgot-password", json={"email": test_user.email})
        assert response.status_code == 200
        assert response.json()["message"] == "Password reset email sent"
        mock_instance.send_message.assert_called_once()


@pytest.mark.asyncio
async def test_forgot_password_endpoint_invalid_email(client):
    """Test forgot password with invalid email"""
    response = client.post("/api/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert response.status_code == 200
    assert response.json()["message"] == "Password reset email sent"


@pytest.mark.asyncio
async def test_reset_password_valid_token(client, test_user):
    """Test reset password with valid token"""
    token = jwt.encode(
        {
            "sub": str(test_user.id),  # Use ID instead of email
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "type": "reset"
        },
        settings.JWT_SECRET_KEY,
        algorithm="HS256"
    )
    response = client.post(
        f"/api/auth/reset-password/{token}",
        json={"new_password": "newpassword123"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"


@pytest.mark.asyncio
async def test_reset_password_expired_token(client, test_user):
    """Test reset password with expired token"""
    token = jwt.encode(
        {
            "sub": str(test_user.id),  # Use ID instead of email
            "exp": datetime.utcnow() - timedelta(minutes=30),
            "type": "reset"
        },
        settings.JWT_SECRET_KEY,
        algorithm="HS256"
    )
    response = client.post(
        f"/api/auth/reset-password/{token}",
        json={"new_password": "newpassword123"}
    )
    assert response.status_code == 400
    assert "expired" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_email_sending_success():
    """Test successful email sending"""
    with patch("backend.utils.email.FastMail") as mock_fastmail:
        mock_instance = AsyncMock()
        mock_instance.send_message = AsyncMock()
        mock_fastmail.return_value = mock_instance

        await send_password_reset_email("test@example.com", "test-token")
        mock_instance.send_message.assert_called_once()


@pytest.mark.asyncio
async def test_email_sending_failure():
    """Test email sending failure"""
    with patch("backend.utils.email.FastMail") as mock_fastmail:
        mock_instance = AsyncMock()
        mock_instance.send_message = AsyncMock(side_effect=ConnectionErrors("Failed to send email"))
        mock_fastmail.return_value = mock_instance

        with pytest.raises(HTTPException) as exc_info:
            await send_password_reset_email("test@example.com", "test-token")
        assert exc_info.value.status_code == 500
        assert "Failed to send password reset email" in str(exc_info.value.detail)
