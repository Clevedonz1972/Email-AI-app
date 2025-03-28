"""
Email parsing utilities for processing email files and extracting data.
"""
import os
import re
import email
from email import policy
from email.parser import BytesParser
from typing import Dict, List, Any, Optional, Tuple
from backend.utils.logger import logger, log_error

def parse_email_file(file_path: str) -> Dict[str, Any]:
    """
    Parse an email file and extract relevant information.
    
    Args:
        file_path: Path to the email file
        
    Returns:
        Dictionary containing parsed email data
    """
    # This is a placeholder implementation
    # In a real implementation, this would parse the email file
    # and extract relevant information like sender, subject, body, etc.
    
    return {
        "subject": "Sample Email",
        "sender": "example@example.com",
        "content": "This is a sample email content.",
        "timestamp": "2023-01-01T00:00:00Z",
    }

def extract_body(msg: email.message.EmailMessage) -> str:
    """Extract the text body from an email message"""
    body = ""
    
    if msg.is_multipart():
        for part in msg.get_payload():
            if part.get_content_type() == "text/plain":
                body += part.get_payload(decode=True).decode(detect_encoding(part))
    else:
        if msg.get_content_type() == "text/plain":
            body = msg.get_payload(decode=True).decode(detect_encoding(msg))
            
    # Clean up the body
    body = re.sub(r'\r\n', '\n', body).strip()
    return body

def extract_attachments(msg: email.message.EmailMessage) -> List[Dict[str, Any]]:
    """Extract attachments from an email message"""
    attachments = []
    
    for part in msg.walk():
        content_disposition = part.get("Content-Disposition", "")
        if "attachment" in content_disposition:
            filename = part.get_filename()
            payload = part.get_payload(decode=True)
            if filename and payload:
                attachments.append({
                    "filename": filename,
                    "size": len(payload)
                    # You can store the raw data or save it to a file if needed
                })
    return attachments

def detect_encoding(part: email.message.EmailMessage) -> str:
    """Detect the character encoding of an email part"""
    charset = part.get_content_charset()
    return charset if charset else "utf-8"