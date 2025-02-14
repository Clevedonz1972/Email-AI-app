import logging
import sys
from typing import Any, Dict

class CustomFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # Add extra fields if they exist
        extra_fields = ""
        if hasattr(record, "extra"):
            extra = getattr(record, "extra")
            if isinstance(extra, dict):
                extra_fields = " ".join(f"{k}={v}" for k, v in extra.items())

        # Basic log format
        base_format = "%(asctime)s [%(levelname)s] %(message)s"
        if extra_fields:
            base_format += f" {extra_fields}"

        self._style._fmt = base_format
        return super().format(record)

# Create logger
logger = logging.getLogger("email_ai")
logger.setLevel(logging.INFO)

# Create console handler
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(CustomFormatter())
logger.addHandler(handler)

def log_with_context(level: int, message: str, extra: Dict[str, Any] = None) -> None:
    """Log a message with optional context."""
    logger.log(level, message, extra={"extra": extra} if extra else None)

# Export the logger
__all__ = ["logger", "log_with_context"] 