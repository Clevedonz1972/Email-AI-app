from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Category(BaseModel):
    __tablename__ = 'categories'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(7))  # Hex color code
    icon = Column(String(50))
    rules = Column(JSON)  # Rules for auto-categorization
    
    # Relationships
    user = relationship("User", back_populates="categories")
    emails = relationship("Email", back_populates="category") 