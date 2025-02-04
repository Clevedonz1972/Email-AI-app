from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class EmailTemplate(BaseModel):
    __tablename__ = 'email_templates'

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    subject_template = Column(String(255))
    content_template = Column(Text)
    variables = Column(JSON)  # List of variables that can be replaced
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # Relationships
    user = relationship("User", back_populates="templates")
    category = relationship("Category", back_populates="templates") 