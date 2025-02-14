import pytest
import openai
from backend.ai.handlers import AIHandler
from backend.models.email import Email, StressLevel, Priority
from unittest.mock import patch, MagicMock
from fastapi import HTTPException

@pytest.fixture
def ai_handler():
    return AIHandler(testing=True)

def test_analyze_email(ai_handler):
    """Test email analysis with proper mock response"""
    content = "Test email content"
    result = ai_handler.analyze_email(content)
    
    assert result.summary == "Test summary"
    assert result.stress_level == StressLevel.LOW
    assert result.priority == Priority.MEDIUM
    assert len(result.action_items) == 1
    assert result.action_items[0] == "Test action item"
    assert result.sentiment_score == 0.5

def test_generate_reply(ai_handler):
    """Test reply generation with proper mock response"""
    content = "Test content"
    result = ai_handler.generate_reply(content, "professional")
    
    assert isinstance(result, str)
    assert "test reply" in result.lower()

def test_error_handling(ai_handler):
    """Test error handling with failed API call"""
    with patch('openai.ChatCompletion.create', side_effect=Exception("API Error")):
        with pytest.raises(HTTPException) as exc_info:
            ai_handler.analyze_email("Test content")
        assert exc_info.value.status_code == 500

def test_simplify_content(ai_handler):
    """Test content simplification with proper mock response"""
    content = "Test content for simplification"
    result = ai_handler.simplify_content(content)
    
    assert isinstance(result, str)
    assert "simplified content" in result.lower()

@pytest.mark.asyncio
async def test_generate_response(ai_handler):
    response = await ai_handler.generate_response_suggestion(
        "Can we meet tomorrow to discuss the project?",
        {"ai_assistance": {"level": "balanced"}}
    )
    assert isinstance(response, str)
    assert len(response) > 0

@pytest.mark.asyncio
async def test_generate_reply(ai_handler):
    content = "Test content for reply"
    result = await ai_handler.generate_reply(content, "professional")
    assert isinstance(result, str)
    assert "test reply" in result.lower() 





    