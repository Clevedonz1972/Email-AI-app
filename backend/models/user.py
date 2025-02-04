from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash

class User(BaseModel):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    preferences = Column(JSON, default={})
    
    # Relationships
    emails = relationship("Email", back_populates="user")
    categories = relationship("Category", back_populates="user")
    templates = relationship("EmailTemplate", back_populates="user")
    analytics = relationship("UserAnalytics", back_populates="user")

    def set_password(self, password: str):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.hashed_password, password)

    @property
    def default_preferences(self) -> dict:
        return {
            "accessibility": {
                "high_contrast": False,
                "large_text": False,
                "reduced_motion": False,
                "text_scale": 100
            },
            "notifications": {
                "email": True,
                "push": False,
                "quiet_hours": {"start": "22:00", "end": "07:00"}
            },
            "ai_assistance": {
                "level": "balanced",
                "auto_categorize": True,
                "stress_monitoring": True
            }
        } 