"""
Notification service for handling email notifications with accessibility preferences.
"""

from typing import Dict, Any, Optional
from backend.models.user import User

class NotificationService:
    """Service for handling email notifications with accessibility preferences."""
    
    @staticmethod
    async def send_notification(user: User, message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a notification to the user with their preferred format and frequency.
        
        Args:
            user: The user to notify
            message: The notification message and format details
            
        Returns:
            Dict containing notification details and status
        """
        try:
            # Get user preferences
            preferences = user.preferences or {}
            notification_prefs = preferences.get("notifications", {})
            
            # Apply notification format based on accessibility preferences
            accessibility_prefs = preferences.get("accessibility", {})
            format_settings = {
                "high_contrast": accessibility_prefs.get("high_contrast", False),
                "large_text": accessibility_prefs.get("large_text", False),
                "reduced_motion": accessibility_prefs.get("reduced_motion", False)
            }
            
            # Combine message with format settings
            formatted_message = {
                **message,
                "format_settings": format_settings,
                "frequency": notification_prefs.get("frequency", "immediate")
            }
            
            # In a real implementation, this would send the actual notification
            # For testing, we return the formatted message
            return {
                "status": "sent",
                "user_id": user.id,
                "message": formatted_message
            }
            
        except Exception as e:
            return {
                "status": "error",
                "user_id": user.id,
                "error": str(e)
            }
    
    @staticmethod
    async def check_notification_timing(user: User) -> bool:
        """
        Check if it's appropriate to send a notification based on user preferences.
        
        Args:
            user: The user to check notification timing for
            
        Returns:
            bool: Whether notification should be sent
        """
        preferences = user.preferences or {}
        notification_prefs = preferences.get("notifications", {})
        
        # In a real implementation, this would check quiet hours, frequency limits, etc.
        return notification_prefs.get("email", True) 