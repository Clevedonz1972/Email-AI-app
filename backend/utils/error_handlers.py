from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Union, Dict, Any
from sqlalchemy.exc import SQLAlchemyError
import logging
from backend.config import settings

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

class APIError(HTTPException):
    """Base API error class"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str = None,
        internal_error: Exception = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        if internal_error:
            logger.error(f"Internal error: {str(internal_error)}")

class DatabaseError(APIError):
    """Database-related errors"""
    def __init__(self, detail: str, internal_error: Exception = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="DATABASE_ERROR",
            internal_error=internal_error
        )

class ValidationError(APIError):
    """Data validation errors"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=422,
            detail=detail,
            error_code="VALIDATION_ERROR"
        )

class AuthenticationError(APIError):
    """Authentication-related errors"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code="AUTHENTICATION_ERROR"
        )

class AuthorizationError(APIError):
    """Authorization-related errors"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=403,
            detail=detail,
            error_code="AUTHORIZATION_ERROR"
        )

async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """Handle API errors and return formatted response"""
    error_response = {
        "error": {
            "code": exc.error_code or "UNKNOWN_ERROR",
            "message": exc.detail,
            "status": exc.status_code
        }
    }
    
    # Log error with request information
    logger.error(
        f"API Error: {exc.error_code} - {exc.detail}",
        extra={
            "request_url": str(request.url),
            "request_method": request.method,
            "client_host": request.client.host if request.client else None,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )

async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy errors"""
    error = DatabaseError(
        detail="A database error occurred",
        internal_error=exc
    )
    return await api_error_handler(request, error)

async def validation_error_handler(request: Request, exc: Union[ValidationError, Exception]) -> JSONResponse:
    """Handle validation errors"""
    if isinstance(exc, ValidationError):
        return await api_error_handler(request, exc)
    
    error = ValidationError(detail=str(exc))
    return await api_error_handler(request, error)

def setup_error_handlers(app: Any) -> None:
    """Set up error handlers for the FastAPI application"""
    app.add_exception_handler(APIError, api_error_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler) 