from enum import Enum

class StressLevel(str, Enum):
    """Enum for email stress levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Priority(str, Enum):
    """Enum for email priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high" 