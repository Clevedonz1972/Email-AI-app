import requests
import logging
from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class EmailData:
    """Structured email data with clear labeling and organization"""
    id: str
    sender_name: str
    sender_email: str
    subject: str
    preview: str
    timestamp: str
    priority: str
    is_read: bool
    stress_level: Optional[str] = None  # NEW: Track potential stress triggers
    ai_summary: Optional[str] = None    # NEW: Store AI-generated summary
    action_items: Optional[List[str]] = None  # NEW: Clear list of required actions
    due_date: Optional[str] = None      # NEW: Track deadlines
    body: Optional[str] = None
    attachments: Optional[List[Dict]] = None
    labels: Optional[List[str]] = None
    category: Optional[str] = None      # NEW: Email category (e.g., "Bills", "Social", "Work")

class EmailAPIClient:
    """Enhanced email client with neurodiversity-friendly features"""
    
    def __init__(
        self, 
        base_url: str = "http://localhost:8000", 
        api_key: Optional[str] = None,
        max_retries: int = 3,
        timeout: int = 30
    ):
        self.base_url = base_url
        self.session = self._setup_session(max_retries, timeout)
        
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def _setup_session(self, max_retries: int, timeout: int) -> requests.Session:
        """Configure session with retry logic and timeouts"""
        session = requests.Session()
        
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE", "POST"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.timeout = timeout
        
        return session

    def _handle_request_error(self, e: requests.RequestException, operation: str) -> Dict:
        """Enhanced error handling with user-friendly messages"""
        error_msg = f"Error during {operation}: {str(e)}"
        logger.error(error_msg)
        
        user_friendly_msg = {
            "success": False,
            "error": "Unable to complete the requested action",
            "details": str(e),
            "suggestions": [
                "Check your internet connection",
                "Try again in a few moments",
                "Contact support if the problem persists"
            ]
        }
        
        return user_friendly_msg

    def get_emails(
        self, 
        limit: int = 50, 
        offset: int = 0, 
        folder: str = "inbox",
        filters: Optional[Dict] = None,
        sort_by: str = "date",
        stress_level: Optional[str] = None
    ) -> Union[List[EmailData], Dict]:
        """
        Fetch emails with enhanced filtering and sorting options
        
        Args:
            limit: Maximum number of emails to return
            offset: Number of emails to skip
            folder: Email folder to fetch from
            filters: Additional filtering options
            sort_by: Sort criteria (date, priority, stress_level)
            stress_level: Filter by stress level (low, medium, high)
        """
        try:
            params = {
                "limit": limit,
                "offset": offset,
                "folder": folder,
                "sort_by": sort_by
            }
            
            if filters:
                params.update(filters)
            if stress_level:
                params["stress_level"] = stress_level

            response = self.session.get(
                f"{self.base_url}/api/emails",
                params=params
            )
            response.raise_for_status()
            
            return [EmailData(**email) for email in response.json()]
        except requests.RequestException as e:
            return self._handle_request_error(e, "fetch emails")

    def mark_as_read(self, email_id: str) -> bool:
        """Mark an email as read"""
        try:
            response = self.session.patch(
                f"{self.base_url}/api/emails/{email_id}/read"
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self._handle_request_error(e, "mark email as read")
            return False

    def update_priority(self, email_id: str, priority: str) -> bool:
        """Update email priority"""
        try:
            response = self.session.patch(
                f"{self.base_url}/api/emails/{email_id}/priority",
                json={"priority": priority}
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self._handle_request_error(e, "update email priority")
            return False

    def send_email(self, to: List[str], subject: str, body: str, 
                  attachments: Optional[List[Dict]] = None) -> bool:
        """Send a new email"""
        try:
            payload = {
                "to": to,
                "subject": subject,
                "body": body,
                "attachments": attachments
            }
            response = self.session.post(
                f"{self.base_url}/api/emails/send",
                json=payload
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self._handle_request_error(e, "send email")

    def delete_email(self, email_id: str) -> bool:
        """Delete an email"""
        try:
            response = self.session.delete(
                f"{self.base_url}/api/emails/{email_id}"
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self._handle_request_error(e, "delete email")

    def search_emails(self, query: str) -> List[EmailData]:
        """Search emails"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/emails/search",
                params={"q": query}
            )
            response.raise_for_status()
            return [EmailData(**email) for email in response.json()]
        except requests.RequestException as e:
            self._handle_request_error(e, "search emails")

    def update_email_preferences(
        self, 
        email_id: str, 
        preferences: Dict
    ) -> Dict:
        """
        Update user preferences for handling specific types of emails
        
        Args:
            email_id: Email identifier
            preferences: Dict containing preference updates
                - stress_level: Perceived stress level
                - handling_strategy: Preferred way to handle similar emails
                - reminders: Reminder settings
                - auto_categorize: Whether to auto-categorize similar emails
        """
        try:
            response = self.session.patch(
                f"{self.base_url}/api/emails/{email_id}/preferences",
                json=preferences
            )
            response.raise_for_status()
            return {"success": True, "message": "Preferences updated successfully"}
        except requests.RequestException as e:
            return self._handle_request_error(e, "update email preferences")

    def get_email_analytics(self, user_id: str) -> Dict:
        """
        Get analytics about email patterns and stress levels
        
        Returns information about:
        - Email volume trends
        - Common stress triggers
        - Peak email times
        - Successfully handled emails
        """
        try:
            response = self.session.get(
                f"{self.base_url}/api/analytics/emails",
                params={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return self._handle_request_error(e, "fetch email analytics")

    def batch_process_emails(
        self, 
        email_ids: List[str], 
        action: str,
        parameters: Optional[Dict] = None
    ) -> Dict:
        """
        Process multiple emails in a single operation
        
        Actions:
        - mark_read: Mark multiple emails as read
        - categorize: Apply categories to multiple emails
        - archive: Archive multiple emails
        - apply_label: Apply labels to multiple emails
        """
        try:
            payload = {
                "email_ids": email_ids,
                "action": action,
                "parameters": parameters or {}
            }
            
            response = self.session.post(
                f"{self.base_url}/api/emails/batch",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return self._handle_request_error(e, f"batch {action}")

class EmailAPIException(Exception):
    """Custom exception for Email API errors"""
    pass

# Mock data with enhanced structure
MOCK_EMAILS = [
    {
        "id": "1",
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "subject": "Important Meeting Tomorrow",
        "preview": "Please review the attached documents before our meeting tomorrow at 2 PM.",
        "timestamp": "2024-03-20T10:00:00Z",
        "priority": "HIGH",
        "is_read": False,
        "stress_level": "MEDIUM",
        "ai_summary": "Meeting preparation required for tomorrow at 2 PM",
        "action_items": ["Review documents", "Prepare meeting notes"],
        "due_date": "2024-03-21T14:00:00Z",
        "category": "Work"
    },
    # Add more mock emails here
]

def get_mock_api_response():
    return json.dumps(MOCK_EMAILS)