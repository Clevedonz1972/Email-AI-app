import os
import re
import email
from email import policy
from email.parser import BytesParser
from typing import Dict, List, Any, Optional, Tuple
from backend.utils.logger import logger, log_error

def parse_email_file(file_path: str) -> Dict[str, Any]:
    """
    Parse an email file into a dictionary with its components
    
    Args:
        file_path: Path to the email file
        
    Returns:
        Dictionary with email components (subject, sender, recipients, body, etc.)
    """
    try:
        if not os.path.exists(file_path):
            return {
                "error": f"File not found: {file_path}",
                "success": False
            }
            
        with open(file_path, 'rb') as f:
            msg = BytesParser(policy=policy.default).parse(f)
            
        result = {
            "subject": msg.get("subject", ""),
            "from": msg.get("from", ""),
            "to": msg.get("to", ""),
            "cc": msg.get("cc", ""),
            "date": msg.get("date", ""),
            "body": extract_body(msg),
            "attachments": extract_attachments(msg),
            "success": True
        }
        
        return result
    except Exception as e:
        log_error(e, f"Error parsing email file: {file_path}")
        return {
            "error": str(e),
            "success": False
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
    body = re.sub(r'\r\n', '\n', body)
    
    return body

def extract_attachments(msg: email.message.EmailMessage) -> List[Dict[str, Any]]:
    """Extract attachment information from an email message"""
    attachments = []
    
    if msg.is_multipart():
        for part in msg.get_payload():
            if part.get_filename():
                attachments.append({
                    "filename": part.get_filename(),
                    "content_type": part.get_content_type(),
                    "size": len(part.get_payload(decode=True))
                })
                
    return attachments

def detect_encoding(part: email.message.EmailMessage) -> str:
    """Detect the character encoding of an email part"""
    charset = part.get_content_charset()
    if charset:
        return charset
    return 'utf-8'  # Default to UTF-8 if not specified

def extract_recipients(email_str: str) -> List[Dict[str, str]]:
    """
    Extract recipient information from an email string
    
    Args:
        email_str: String containing email addresses (e.g. "John Doe <john@example.com>, jane@example.com")
        
    Returns:
        List of dictionaries with name and email for each recipient
    """
    if not email_str:
        return []
        
    recipients = []
    # Split by commas not inside angle brackets
    addresses = re.findall(r'[^,<]+(?:<[^>]*>)?', email_str)
    
    for addr in addresses:
        addr = addr.strip()
        if not addr:
            continue
            
        # Try to extract name and email
        match = re.match(r'^(.*?)<([^>]+)>$', addr)
        if match:
            name = match.group(1).strip()
            email = match.group(2).strip()
            recipients.append({"name": name, "email": email})
        else:
            # Just an email address without a name
            recipients.append({"name": "", "email": addr})
            
    return recipients

def simplify_email_content(content: str) -> str:
    """
    Simplify email content by removing excess whitespace, quotes, signatures, etc.
    
    Args:
        content: Raw email content
        
    Returns:
        Simplified email content
    """
    if not content:
        return ""
        
    # Remove quoted text (lines starting with >)
    content = re.sub(r'^>.*$', '', content, flags=re.MULTILINE)
    
    # Remove email signatures (common patterns)
    content = re.sub(r'--\s*\n.*', '', content, flags=re.DOTALL)
    
    # Remove excess whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = content.strip()
    
    return content 