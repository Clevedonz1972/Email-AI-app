from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import BaseModel

class FeedbackType(str, enum.Enum):
    SUGGESTION = "suggestion"
    STRESS_LEVEL = "stress_level"
    ACCESSIBILITY = "accessibility"

class QuickFeedback(BaseModel):
    __tablename__ = "quick_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=True)
    suggestion_id = Column(String, nullable=True)
    is_positive = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="quick_feedback")
    email = relationship("Email", back_populates="quick_feedback")

class DetailedFeedback(BaseModel):
    __tablename__ = "detailed_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=True)
    suggestion_id = Column(String, nullable=True)
    feedback = Column(String, nullable=False)
    rating = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    feedback_metadata = Column(JSON, nullable=True)  # For storing additional context

    # Relationships
    user = relationship("User", back_populates="detailed_feedback")
    email = relationship("Email", back_populates="detailed_feedback")

class FeedbackAnalytics(BaseModel):
    __tablename__ = "feedback_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    positive_count = Column(Integer, default=0)
    average_rating = Column(Float, nullable=True)
    common_issues = Column(JSON, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="feedback_analytics")

class StressLevelAccuracy(BaseModel):
    __tablename__ = "stress_level_accuracy"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=False)
    predicted_level = Column(String, nullable=False)
    user_reported_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    context = Column(JSON, nullable=True)  # Store factors that influenced the prediction

    # Relationships
    email = relationship("Email", back_populates="stress_accuracy")

class AccessibilityFeedback(BaseModel):
    __tablename__ = "accessibility_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature_type = Column(String, nullable=False)  # e.g., "contrast", "font_size", "motion"
    is_helpful = Column(Boolean, nullable=True)
    issues_reported = Column(JSON, nullable=True)
    suggestions = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    resolution_status = Column(String, nullable=True) 