from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from backend.config import settings
from backend.utils.password import verify_password, get_password_hash


class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    preferences = Column(JSON, default={})

    # Relationships
    emails = relationship("Email", back_populates="user")
    categories = relationship("Category", back_populates="user")
    user_analytics = relationship("UserAnalytics", back_populates="user")
    email_analytics = relationship("EmailAnalytics", back_populates="user")
    quick_feedback = relationship("QuickFeedback", back_populates="user")
    detailed_feedback = relationship("DetailedFeedback", back_populates="user")
    feedback_analytics = relationship("FeedbackAnalytics", back_populates="user")
    # Remove templates relationship for now

    # Add relationships for testing
    test_scenarios = relationship("TestScenario", back_populates="user")
    test_feedback = relationship("TestFeedback", back_populates="user")

    def set_password(self, password: str) -> None:
        """Set hashed password"""
        self.password_hash = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify password"""
        return verify_password(password, self.password_hash)

    @staticmethod
    def get_default_preferences() -> dict:
        return {
            "accessibility": {
                "high_contrast": False,
                "large_text": False,
                "reduced_motion": False,
                "text_scale": 100,
            },
            "notifications": {
                "email": True,
                "push": False,
                "quiet_hours": {"start": "22:00", "end": "07:00"},
            },
            "ai_assistance": {
                "level": "balanced",
                "auto_categorize": True,
                "stress_monitoring": True,
            },
            "notification_frequency": "daily",
            "theme": "light",
            "simplified_view": {
                "enabled": False,
                "hide_metadata": False,
                "focus_mode": False,
                "auto_enable_on_stress": True
            }
        }

    def create_access_token(
        self, additional_data: dict = None, expires_delta: timedelta = None
    ) -> str:
        """Create access token with optional additional data and expiry"""
        data = {"sub": str(self.id)}
        if additional_data:
            data.update(additional_data)

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

        data.update({"exp": expire})
        return jwt.encode(data, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


class UserPreferences(BaseModel):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    accessibility = Column(JSON, default={
        "high_contrast": False,
        "large_text": False,
        "reduced_motion": False,
        "text_scale": 100,
    })
    notifications = Column(JSON, default={
        "email": True,
        "push": False,
        "quiet_hours": {"start": "22:00", "end": "07:00"},
    })
    ai_assistance = Column(JSON, default={
        "level": "balanced",
        "auto_categorize": True,
        "stress_monitoring": True,
    })
    notification_frequency = Column(String, default="daily")
    theme = Column(String, default="light")
    stress_sensitivity = Column(String, default="MEDIUM")
    anxiety_triggers = Column(JSON, default=["deadline", "urgent"])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="user_preferences")

User.user_preferences = relationship("UserPreferences", back_populates="user", uselist=False)
