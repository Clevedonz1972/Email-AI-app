from .base import Base
from .user import User
from .email import Email, EmailCategory, EmailAnalysis, EmailMessage
from .category import Category
from .analytics import UserAnalytics, EmailAnalytics

__all__ = [
    'Base',
    'User',
    'Email',
    'Category',
    'EmailCategory',
    'EmailAnalysis',
    'EmailMessage',
    'UserAnalytics',
    'EmailAnalytics'
]

# Ensure all models are registered with Base.metadata
models = [User, Email, Category, EmailAnalysis, EmailMessage, UserAnalytics, EmailAnalytics]
