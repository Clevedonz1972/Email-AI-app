from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import BaseModel
from sqlalchemy.sql import func

class StressLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Email(BaseModel):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    subject = Column(String, nullable=False)
    content = Column(String, nullable=False)
    sender = Column(JSON, nullable=False)
    recipient = Column(JSON)
    timestamp = Column(DateTime, default=func.now())
    category = Column(String, default="inbox")
    is_read = Column(Boolean, default=False)
    is_processed = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    stress_level = Column(Enum(StressLevel))
    priority = Column(Enum(Priority))
    summary = Column(String)
    action_items = Column(JSON)  # List of strings
    sentiment_score = Column(Float)

    user = relationship("User", back_populates="emails")
    category = relationship("Category", back_populates="emails")
    analytics = relationship("EmailAnalytics", back_populates="email") 