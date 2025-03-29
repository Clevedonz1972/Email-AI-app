from .auth import router as auth_router
from .email import router as email_router
from .health import router as health_router
from .preferences import router as preferences_router
from .asti import router as asti_router

__all__ = ["auth_router", "email_router", "health_router", "preferences_router", "asti_router"]
