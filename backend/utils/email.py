from typing import Optional, List
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.config import settings

async def send_email(
    subject: str,
    recipients: List[str],
    body: str,
    is_html: bool = True
) -> None:
    """Send an email using aiosmtplib"""
    if settings.TESTING:
        # In test mode, just log the email
        print(f"TEST MODE: Email would be sent to {recipients}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        return

    message = MIMEMultipart()
    message["From"] = settings.MAIL_FROM
    message["To"] = ", ".join(recipients)
    message["Subject"] = subject

    # Add body
    if is_html:
        message.attach(MIMEText(body, "html"))
    else:
        message.attach(MIMEText(body, "plain"))

    try:
        smtp = aiosmtplib.SMTP(
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            use_tls=settings.MAIL_STARTTLS,
            start_tls=settings.MAIL_STARTTLS
        )

        await smtp.connect()
        
        if settings.MAIL_USE_CREDENTIALS:
            await smtp.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        
        await smtp.send_message(message)
        await smtp.quit()
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        raise

async def send_password_reset_email(email: str, token: str) -> None:
    """Send password reset email"""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to proceed:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>The link will expire in 30 minutes.</p>
        </body>
    </html>
    """
    
    await send_email(
        subject="Password Reset Request",
        recipients=[email],
        body=body,
        is_html=True
    )
