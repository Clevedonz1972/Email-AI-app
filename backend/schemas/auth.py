from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    full_name: str


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    full_name: str

    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    new_password: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
