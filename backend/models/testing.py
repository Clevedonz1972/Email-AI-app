from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class TestScenario(Base):
    """Model for tracking test scenario completion"""
    __tablename__ = "test_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scenario_id = Column(String, index=True)
    completed = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="test_scenarios")
    feedback = relationship("TestFeedback", back_populates="scenario")

class TestFeedback(Base):
    """Model for storing test feedback"""
    __tablename__ = "test_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scenario_id = Column(String, ForeignKey("test_scenarios.scenario_id"))
    feedback_text = Column(Text)
    is_issue = Column(Boolean, default=False)
    rating = Column(Float, nullable=True)
    submission_date = Column(DateTime, default=datetime.utcnow)
    resolution_status = Column(String, default="pending")  # pending, in_progress, resolved
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="test_feedback")
    scenario = relationship("TestScenario", back_populates="feedback") 