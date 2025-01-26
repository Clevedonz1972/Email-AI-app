import requests
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EmailData:
    id: str
    sender_name: str
    sender_email: str
    subject: str
    preview: str
    timestamp: str
    priority: str
    is_read: bool
    body: Optional[str] = None
    attachments: Optional[List[Dict]] = None
    labels: Optional[List[str]] = None

class EmailAPIClient:
    def __init__(self, base_url: str = "http://localhost:8000", api_key: Optional[str] = None):
        self.base_url = base_url
        self.session = requests.Session()
        
        # Add retry mechanism
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Add API key if provided
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def _handle_request_error(self, e: requests.RequestException, operation: str) -> None:
        """Centralized error handling"""
        logger.error(f"Error during {operation}: {str(e)}")
        raise EmailAPIException(f"Failed to {operation}: {str(e)}")

    def get_emails(self, limit: int = 50, offset: int = 0, folder: str = "inbox") -> List[EmailData]:
        """Fetch emails with pagination and folder support"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/emails",
                params={"limit": limit, "offset": offset, "folder": folder}
            )
            response.raise_for_status()
            return [EmailData(**email) for email in response.json()]
        except requests.RequestException as e:
            self._handle_request_error(e, "fetch emails")

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

class EmailAPIException(Exception):
    """Custom exception for Email API errors"""
    pass

# Mock data for testing
MOCK_EMAILS = [
    {
        "id": "1",
        "sender_name": "John Doe",
        "sender_email": "john@example.com",
        "subject": "Important Meeting",
        "preview": "Please review the attached documents before our meeting tomorrow.",
        "timestamp": "2024-03-20T10:00:00Z",
        "priority": "HIGH",
        "is_read": False
    },
    # Add more mock emails here
]

def get_mock_api_response():
    return json.dumps(MOCK_EMAILS)