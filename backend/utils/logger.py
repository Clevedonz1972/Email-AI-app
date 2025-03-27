import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional
import sys
from backend.config import settings

class CustomFormatter(logging.Formatter):
    """Custom formatter that outputs logs in JSON format."""
    
    def __init__(self):
        super().__init__()
    
    def format(self, record: logging.LogRecord) -> str:
        """Format the log record as JSON."""
        log_entry = {
            "timestamp": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S.%fZ"),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if they exist
        if hasattr(record, "extra"):
            log_entry["extra"] = self._serialize_extra(record.extra)
        
        # Add exception info if it exists
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)
    
    def _serialize_extra(self, extra: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize extra fields, handling non-JSON serializable objects."""
        serialized = {}
        for key, value in extra.items():
            try:
                # Try to serialize the value directly
                json.dumps(value)
                serialized[key] = value
            except (TypeError, ValueError):
                # If direct serialization fails, convert to string
                if hasattr(value, "__dict__"):
                    serialized[key] = str(value.__dict__)
                else:
                    serialized[key] = str(value)
        return serialized

def setup_logger(name: str = "email_ai", level: str = "INFO") -> logging.Logger:
    """Set up application logger with proper formatting and handlers."""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(CustomFormatter())
    logger.addHandler(console_handler)
    
    # File handlers
    error_handler = logging.FileHandler("logs/error.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(CustomFormatter())
    logger.addHandler(error_handler)
    
    accessibility_handler = logging.FileHandler("logs/accessibility.log")
    accessibility_handler.setLevel(logging.INFO)
    accessibility_handler.setFormatter(CustomFormatter())
    logger.addHandler(accessibility_handler)
    
    return logger

# Create and configure the logger
logger = setup_logger()

# Create a formatter instance for serialization
_formatter = CustomFormatter()

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Log an error with context."""
    error_context = {
        "error_type": error.__class__.__name__,
        "error_message": str(error)
    }
    if context:
        error_context.update(_formatter._serialize_extra(context))
    
    logger.error(
        str(error),
        extra=error_context,
        exc_info=True
    )

def log_accessibility_event(event_type: str, data: Optional[Dict[str, Any]] = None) -> None:
    """Log an accessibility-related event."""
    event_data = {
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat()
    }
    if data:
        event_data.update(_formatter._serialize_extra(data))
    
    logger.info(
        f"Accessibility event: {event_type}",
        extra=event_data
    )
