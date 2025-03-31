"""
Authentication utilities for the FastAPI application.
This module provides the functionality to authenticate users and get current user information.
"""

from backend.auth.security import get_current_user, get_current_active_user, get_optional_current_user

# Re-export the authentication functions for backward compatibility
__all__ = ["get_current_user", "get_current_active_user", "get_optional_current_user"] 