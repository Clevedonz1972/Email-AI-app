"""
Notification service for sending email and application notifications.
"""
from typing import Dict, List, Optional, Union
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.utils.logger import logger, log_error
from backend.config import settings
from backend.models.user import User
import json

class NotificationService:
    """
    Service for handling various types of notifications to users,
    including emails and in-app notifications.
    """
    
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.testing = settings.TESTING
    
    async def send_email(
        self, 
        recipient: str, 
        subject: str, 
        body: str, 
        html_body: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> Dict[str, Union[bool, str]]:
        """
        Send an email notification to a user.
        
        Args:
            recipient: Email address of the recipient
            subject: Email subject
            body: Plain text email body
            html_body: HTML version of the email body (optional)
            cc: List of CC recipients (optional)
            bcc: List of BCC recipients (optional)
            
        Returns:
            Dict with success status and optional error message
        """
        if self.testing:
            logger.info(f"[TEST MODE] Would send email to {recipient} with subject: {subject}")
            return {"success": True, "message": "Email would be sent in non-test mode"}
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = recipient
            
            if cc:
                msg['Cc'] = ', '.join(cc)
            if bcc:
                msg['Bcc'] = ', '.join(bcc)
            
            # Attach plain text version
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach HTML version if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                
                recipients = [recipient]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)
                
                server.sendmail(self.from_email, recipients, msg.as_string())
            
            logger.info(f"Email sent to {recipient} with subject: {subject}")
            return {"success": True}
        
        except Exception as e:
            error_msg = f"Failed to send email to {recipient}: {str(e)}"
            log_error(error_msg)
            return {"success": False, "error": error_msg}
    
    async def send_password_reset(self, user: User, reset_token: str) -> Dict[str, Union[bool, str]]:
        """
        Send a password reset email with a token.
        
        Args:
            user: User object containing email and name
            reset_token: The password reset token
            
        Returns:
            Dict with success status and optional error message
        """
        subject = "Reset Your Password - Email AI App"
        
        # Build the reset URL using the frontend URL and token
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Create the email body
        body = f"""
Hello {user.full_name},

You recently requested to reset your password for your Email AI App account.
Click the link below to reset it:

{reset_url}

If you did not request a password reset, please ignore this email or contact support
if you have questions.

This link will expire in 1 hour.

Regards,
The Email AI App Team
"""
        
        # Create HTML version
        html_body = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Password Reset Request</h2>
    <p>Hello {user.full_name},</p>
    <p>You recently requested to reset your password for your Email AI App account.</p>
    <p><a href="{reset_url}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Your Password</a></p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
    <p>This link will expire in 1 hour.</p>
    <p>Regards,<br>The Email AI App Team</p>
</div>
"""
        
        return await self.send_email(
            recipient=user.email,
            subject=subject,
            body=body,
            html_body=html_body
        )
    
    async def send_welcome_email(self, user: User) -> Dict[str, Union[bool, str]]:
        """
        Send a welcome email to a newly registered user.
        
        Args:
            user: User object containing email and name
            
        Returns:
            Dict with success status and optional error message
        """
        subject = "Welcome to Email AI App!"
        
        body = f"""
Hello {user.full_name},

Welcome to Email AI App! We're excited to have you on board.

Your account has been successfully created. Here are some resources to help you get started:

1. Check out our Quick Start Guide: https://emailai.app/quickstart
2. Set up your email preferences: https://emailai.app/preferences
3. Learn about our accessibility features: https://emailai.app/accessibility

If you have any questions or need assistance, feel free to reply to this email.

Best regards,
The Email AI App Team
"""
        
        html_body = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Email AI App!</h2>
    <p>Hello {user.full_name},</p>
    <p>Welcome to Email AI App! We're excited to have you on board.</p>
    <p>Your account has been successfully created. Here are some resources to help you get started:</p>
    <ul>
        <li><a href="https://emailai.app/quickstart">Check out our Quick Start Guide</a></li>
        <li><a href="https://emailai.app/preferences">Set up your email preferences</a></li>
        <li><a href="https://emailai.app/accessibility">Learn about our accessibility features</a></li>
    </ul>
    <p>If you have any questions or need assistance, feel free to reply to this email.</p>
    <p>Best regards,<br>The Email AI App Team</p>
</div>
"""
        
        return await self.send_email(
            recipient=user.email,
            subject=subject,
            body=body,
            html_body=html_body
        )
        
    async def send_app_notification(self, user_id: int, message: str, level: str = "info", data: Optional[Dict] = None) -> Dict:
        """
        Send an in-app notification to a user.
        
        In a real implementation, this might store notifications in the database
        and/or send through WebSockets. For now, it just logs.
        
        Args:
            user_id: ID of the user to notify
            message: Notification message
            level: Notification level (info, warning, error)
            data: Optional additional data as JSON
            
        Returns:
            Dict with success status
        """
        if self.testing:
            logger.info(f"[TEST MODE] Would send app notification to user {user_id}: {message}")
            return {"success": True}
            
        try:
            # In a real implementation, this would store the notification
            # in the database and possibly send through WebSockets
            
            notification = {
                "user_id": user_id,
                "message": message,
                "level": level,
                "data": data or {},
                "created_at": "now"  # Would be a real timestamp in production
            }
            
            logger.info(f"App notification for user {user_id}: {json.dumps(notification)}")
            return {"success": True}
            
        except Exception as e:
            error_msg = f"Failed to send app notification to user {user_id}: {str(e)}"
            log_error(error_msg)
            return {"success": False, "error": error_msg} 