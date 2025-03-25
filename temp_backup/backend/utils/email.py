import logging
from typing import List, Optional
from fastapi import BackgroundTasks
from backend.config import settings

logger = logging.getLogger(__name__)

async def send_email(
    recipient_email: str,
    subject: str,
    html_content: str,
    background_tasks: Optional[BackgroundTasks] = None
) -> bool:
    """
    Generic function to send an email.
    If background_tasks is provided, the email is sent asynchronously.
    """
    try:
        # This is a placeholder implementation
        # In a real implementation, you would use a service like SendGrid, Mailgun, etc.
        logger.info(f"Sending email to {recipient_email} with subject: {subject}")
        
        # For testing, just log the email content
        if settings.TESTING:
            logger.info(f"Email content: {html_content}")
        
        # Simulate successful email sending
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

async def send_password_reset_email(email: str, token: str) -> bool:
    """
    Send a password reset email with a token link.
    """
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{frontend_url}/reset-password?token={token}"
    subject = "Reset Your Password"
    html_content = f"""
    <html>
        <body>
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>The link will expire in 1 hour.</p>
        </body>
    </html>
    """
    return await send_email(email, subject, html_content) 