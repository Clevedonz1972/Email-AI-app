from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Float,
    JSON,
    Enum,
    Text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base, BaseModel
from sqlalchemy.sql import func
from backend.models.enums import StressLevel, Priority


class EmailCategory(str, enum.Enum):
    INBOX = "inbox"
    SENT = "sent"
    DRAFT = "draft"
    TRASH = "trash"


class Email(BaseModel):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    sender = Column(JSON, nullable=False)
    recipient = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    is_processed = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    stress_level = Column(String(6), nullable=True)
    priority = Column(String(6), nullable=True)
    summary = Column(String, nullable=True)
    action_items = Column(JSON, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI analysis fields
    ai_summary = Column(String, nullable=True)
    ai_emotional_tone = Column(String, nullable=True)
    ai_suggested_action = Column(JSON, nullable=True)
    embedding_id = Column(String, nullable=True)

    user = relationship("User", back_populates="emails")
    category = relationship("Category", back_populates="emails")
    analytics = relationship("EmailAnalytics", back_populates="email", uselist=False)
    analysis = relationship("EmailAnalysis", back_populates="email", uselist=False)
    quick_feedback = relationship("QuickFeedback", back_populates="email")
    detailed_feedback = relationship("DetailedFeedback", back_populates="email")
    stress_accuracy = relationship("StressLevelAccuracy", back_populates="email")


class EmailMessage(BaseModel):
    __tablename__ = "email_messages"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    content = Column(String, nullable=False)
    sender = Column(JSON, nullable=False)
    recipient = Column(JSON)
    timestamp = Column(DateTime, default=func.now())
    stress_level = Column(Enum(StressLevel))
    priority = Column(Enum(Priority))
    sentiment_score = Column(Float)


class EmailAnalysis(BaseModel):
    __tablename__ = "email_analysis"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("emails.id"))
    stress_level = Column(Enum(StressLevel))
    priority = Column(Enum(Priority))
    sentiment_score = Column(Float)
    summary = Column(String)
    action_items = Column(JSON)  # List of strings
    action_required = Column(Boolean, default=False)
    explanation = Column(String)
    timestamp = Column(DateTime, default=func.now())
    
    # Enhanced ASTI analysis fields
    emotional_tone = Column(String, nullable=True)
    explicit_expectations = Column(JSON, nullable=True)  # List of strings
    implicit_expectations = Column(JSON, nullable=True)  # List of strings
    suggested_actions = Column(JSON, nullable=True)  # List of action objects
    suggested_response = Column(Text, nullable=True)
    needs_immediate_attention = Column(Boolean, default=False)
    embedding_vector_id = Column(String, nullable=True)  # Reference to vector storage

    email = relationship("Email", back_populates="analysis")
