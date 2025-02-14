from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Category(BaseModel):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    color = Column(String(7))  # Hex color code
    icon = Column(String(50))
    rules = Column(JSON)  # Rules for auto-categorization
    
    # Relationships
    user = relationship("User", back_populates="categories")
    emails = relationship("Email", back_populates="category") 