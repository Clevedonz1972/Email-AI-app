from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from datetime import timedelta
from backend.models.user import User
from backend.schemas.auth import (
    Token,
    UserCreate,
    UserResponse,
    PasswordResetRequest,
    PasswordReset,
    ChangePassword,
)
from backend.auth.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from backend.database import get_db
from pydantic import BaseModel
from backend.config import settings
from backend.auth.security import authenticate_user
from jose import jwt, JWTError
from backend.auth.dependencies import get_current_active_user
from backend.utils.email import send_password_reset_email
from backend.utils.logger import logger

# Temporarily comment out email import
# from backend.utils.email import send_password_reset_email

router = APIRouter(tags=["authentication"])


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)) -> Any:
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=get_password_hash(user_data.password),
        preferences=User.get_default_preferences(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request, response: Response, db: Session = Depends(get_db)
):
    """
    Use the refresh token stored in an HTTP‑only cookie to generate a new access token.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not provided")

    try:
        payload = jwt.decode(
            refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token",
            )
        user_identifier = payload.get("sub")
        user = db.query(User).filter(User.email == user_identifier).first()
        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        new_access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {"access_token": new_access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )


@router.post("/login", response_model=Token)
async def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate the user and return an access token.
    Sets the refresh token as an HTTP‑only cookie.
    """
    db_user = authenticate_user(db, email=user.email, password=user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Change to True on HTTPS
        samesite="lax",
        max_age=14 * 24 * 60 * 60,  # 14 days
    )
    return {"access_token": access_token, "token_type": "Bearer"}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request a password reset email
    Always return success to prevent email enumeration
    """
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(hours=1),
        )
        try:
            await send_password_reset_email(user.email, token)
        except Exception as e:
            logger.error(f"Failed to send reset email: {str(e)}")
            if settings.TESTING:
                raise
            # Don't expose error to client

    return {"message": "Password reset email sent"}


@router.post("/reset-password/{token}", response_model=dict)
async def reset_password(
    token: str, password_data: PasswordReset, db: Session = Depends(get_db)
):
    """Reset password using token"""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid reset token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        user.set_password(password_data.new_password)
        db.commit()

        return {"message": "Password updated successfully"}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")


@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Change user password"""
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


@router.post("/password-reset")
async def request_password_reset(email: str):
    """Request password reset"""
    # Temporarily simplified
    return {"message": "If account exists, reset instructions sent"}
