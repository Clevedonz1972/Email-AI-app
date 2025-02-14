from sqlalchemy import Column, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship, Session
from .base import Base

class UserAnalytics(Base):
    __tablename__ = 'user_analytics'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    email_volume = Column(Integer, default=0)
    avg_response_time = Column(Float)
    stress_patterns = Column(JSON)
    productivity_scores = Column(JSON)
    category_distribution = Column(JSON)
    
    # Fix the relationship name to match User model
    user = relationship("User", back_populates="user_analytics")

class EmailAnalytics(Base):
    __tablename__ = "email_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    email_id = Column(Integer, ForeignKey("emails.id"))
    stress_score = Column(Float)
    priority_score = Column(Float)
    sentiment_score = Column(Float)
    analysis_data = Column(JSON)
    
    # Relationships
    email = relationship("Email", back_populates="analytics")
    user = relationship("User", back_populates="email_analytics")

def update_analytics(db: Session, email_id: int, data: dict):
    with db.begin_nested():
        analytics = db.query(EmailAnalytics)\
            .filter_by(email_id=email_id)\
            .with_for_update()\
            .first()
        # Update logic here 