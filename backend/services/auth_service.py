"""
Authentication service for backend API
This is a simple mock implementation for development purposes
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pydantic import BaseModel

# Auth bearer scheme
security = HTTPBearer()

class User(BaseModel):
    """User model"""
    id: str
    email: str
    name: str

# Mock user for development
MOCK_USER = User(
    id="dev-user-123",
    email="dev@example.com",
    name="Developer User"
)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get the current authenticated user
    
    For development, this returns a mock user regardless of the token
    In production, this would validate the JWT token
    """
    try:
        token = credentials.credentials
        # In production, validate the token here
        # For development, always return the mock user
        return MOCK_USER
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 