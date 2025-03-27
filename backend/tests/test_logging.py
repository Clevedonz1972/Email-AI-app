import pytest
import json
import logging
from pathlib import Path
from backend.utils.logger import (
    setup_logger,
    log_error,
    log_accessibility_event,
    CustomFormatter
)

@pytest.fixture
def temp_log_dir(tmp_path):
    """Create temporary log directory"""
    log_dir = tmp_path / "logs"
    log_dir.mkdir()
    return log_dir

@pytest.fixture
def test_logger(temp_log_dir):
    """Set up test logger with temporary log files"""
    # Configure log files in temporary directory
    error_log = temp_log_dir / "error.log"
    accessibility_log = temp_log_dir / "accessibility.log"
    
    # Create logger
    logger = setup_logger()
    
    # Update handlers to use temporary files
    for handler in logger.handlers:
        if isinstance(handler, logging.FileHandler):
            if handler.baseFilename.endswith("error.log"):
                handler.baseFilename = str(error_log)
            elif handler.baseFilename.endswith("accessibility.log"):
                handler.baseFilename = str(accessibility_log)
    
    return logger, error_log, accessibility_log

def test_custom_formatter():
    """Test custom log formatter"""
    formatter = CustomFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="Test message",
        args=(),
        exc_info=None
    )
    
    formatted = formatter.format(record)
    log_entry = json.loads(formatted)
    
    assert "timestamp" in log_entry
    assert log_entry["level"] == "INFO"
    assert log_entry["message"] == "Test message"
    assert log_entry["module"] == "test"
    assert log_entry["line"] == 1

def test_error_logging(test_logger):
    """Test error logging with context"""
    logger, error_log, _ = test_logger
    test_error = ValueError("Test error")
    test_context = {"user_id": 123, "action": "test"}
    
    log_error(test_error, test_context)
    
    # Read error log
    log_content = error_log.read_text()
    log_entry = json.loads(log_content.strip())
    
    assert log_entry["level"] == "ERROR"
    assert "Test error" in log_entry["message"]
    assert log_entry["extra"]["error_type"] == "ValueError"
    assert log_entry["extra"]["user_id"] == 123
    assert log_entry["extra"]["action"] == "test"
    assert "exception" in log_entry

def test_accessibility_event_logging(test_logger):
    """Test accessibility event logging"""
    logger, _, accessibility_log = test_logger
    
    event_details = {
        "stress_level": "HIGH",
        "triggers": ["deadline", "urgent"],
        "has_anxiety_triggers": True
    }
    
    log_accessibility_event(
        event_type="high_stress_email_detected",
        user_id=123,
        details=event_details
    )
    
    # Read accessibility log
    log_content = accessibility_log.read_text()
    log_entry = json.loads(log_content.strip())
    
    assert log_entry["level"] == "INFO"
    assert "high_stress_email_detected" in log_entry["message"]
    assert log_entry["extra"]["event_type"] == "high_stress_email_detected"
    assert log_entry["extra"]["user_id"] == 123
    assert log_entry["extra"]["details"] == event_details

def test_multiple_log_entries(test_logger):
    """Test handling of multiple log entries"""
    logger, error_log, accessibility_log = test_logger
    
    # Generate multiple log entries
    for i in range(3):
        log_error(ValueError(f"Error {i}"))
        log_accessibility_event(
            event_type=f"event_{i}",
            user_id=i,
            details={"test": i}
        )
    
    # Check error log
    error_logs = error_log.read_text().strip().split("\n")
    assert len(error_logs) == 3
    for i, log in enumerate(error_logs):
        entry = json.loads(log)
        assert f"Error {i}" in entry["message"]
    
    # Check accessibility log
    accessibility_logs = accessibility_log.read_text().strip().split("\n")
    assert len(accessibility_logs) == 3
    for i, log in enumerate(accessibility_logs):
        entry = json.loads(log)
        assert entry["extra"]["event_type"] == f"event_{i}"

def test_logger_configuration():
    """Test logger configuration and handlers"""
    logger = setup_logger()
    
    # Check logger level
    assert logger.level == logging.INFO
    
    # Check handlers
    handler_types = [type(h) for h in logger.handlers]
    assert logging.StreamHandler in handler_types
    assert len([h for h in logger.handlers if isinstance(h, logging.FileHandler)]) == 2
    
    # Check formatters
    for handler in logger.handlers:
        assert isinstance(handler.formatter, CustomFormatter) 