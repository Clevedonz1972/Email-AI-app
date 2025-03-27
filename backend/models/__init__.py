from .base import Base
from .user import User
from .email import Email, EmailCategory, EmailAnalysis, EmailMessage
from .category import Category
from .analytics import UserAnalytics, EmailAnalytics
from .feedback import QuickFeedback, DetailedFeedback, FeedbackAnalytics, AccessibilityFeedback
from .testing import TestScenario, TestFeedback

__all__ = [
    'Base',
    'User',
    'Email',
    'Category',
    'EmailCategory',
    'EmailAnalysis',
    'EmailMessage',
    'UserAnalytics',
    'EmailAnalytics',
    'QuickFeedback',
    'DetailedFeedback',
    'FeedbackAnalytics',
    'AccessibilityFeedback',
    'TestScenario',
    'TestFeedback'
]

# Ensure all models are registered with Base.metadata
models = [
    User, Email, Category, EmailAnalysis, EmailMessage, 
    UserAnalytics, EmailAnalytics, QuickFeedback, DetailedFeedback,
    FeedbackAnalytics, AccessibilityFeedback, TestScenario, TestFeedback
]
