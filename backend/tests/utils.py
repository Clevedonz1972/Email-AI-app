from backend.models.user import User
from backend.models.email import Email
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Union


def create_test_user(db: Session) -> User:
    """Create a test user, deleting existing one if needed."""
    # Delete existing test user and their emails
    existing_user = db.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        # First delete all emails associated with the user
        db.query(Email).filter(Email.user_id == existing_user.id).delete()
        # Then delete the user
        db.query(User).filter(User.id == existing_user.id).delete()
        db.commit()

    user = User(email="test@example.com", is_active=True, preferences={})
    user.set_password("testpass123")  # Set a password
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_email(db: Session, user_id: Union[int, User]) -> Email:
    """Create a test email."""
    if isinstance(user_id, User):
        user_id = user_id.id

    email = Email(
        user_id=user_id,
        subject="Test Subject",
        content="Test Content",
        sender={"email": "sender@example.com", "name": "Sender"},
        recipient={"email": "recipient@example.com", "name": "Recipient"},
        is_archived=False,
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return email
