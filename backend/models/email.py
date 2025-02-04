from sqlalchemy import Column, String, Text, ForeignKey, Enum, Float, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class StressLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Priority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Email(BaseModel):
    __tablename__ = 'emails'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    subject = Column(String(255), nullable=False)
    sender = Column(String(255), nullable=False)
    recipient = Column(String(255), nullable=False)
    content = Column(Text)
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # AI-analyzed fields
    stress_level = Column(Enum(StressLevel))
    priority = Column(Enum(Priority))
    ai_summary = Column(Text)
    action_items = Column(JSON)  # List of action items
    sentiment_score = Column(Float)
    
    # Status fields
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="emails")
    category = relationship("Category", back_populates="emails")
    analytics = relationship("EmailAnalytics", back_populates="email") 