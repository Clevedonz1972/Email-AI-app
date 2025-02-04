from sqlalchemy import Column, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class UserAnalytics(BaseModel):
    __tablename__ = 'user_analytics'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    email_volume = Column(Integer, default=0)
    avg_response_time = Column(Float)
    stress_patterns = Column(JSON)
    productivity_scores = Column(JSON)
    category_distribution = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="analytics")

class EmailAnalytics(BaseModel):
    __tablename__ = 'email_analytics'

    email_id = Column(Integer, ForeignKey('emails.id'), nullable=False)
    processing_time = Column(Float)
    ai_confidence = Column(Float)
    user_corrections = Column(JSON)
    interaction_metrics = Column(JSON)
    
    # Relationships
    email = relationship("Email", back_populates="analytics") 