import pytest
from backend.ai.handlers import AIHandler, EmailAnalysis, ReplyResponse
from backend.models.email import StressLevel, Priority
from unittest.mock import patch
from fastapi import HTTPException
import json

@pytest.fixture
def ai_handler():
    return AIHandler(testing=True)

@pytest.fixture(autouse=True)
def patch_openai_acreate_global():
    async def async_mock_acreate(*args, **kwargs):
        return type('MockResponse', (), {
            "choices": [
                type('Choice', (), {
                    "message": type('Message', (), {
                        "content": json.dumps({
                            "summary": "Test summary",
                            "stress_level": "LOW",
                            "priority": "MEDIUM",
                            "action_items": ["Test action item"],
                            "sentiment_score": 0.5,
                            "content": "Test reply content",
                            "tone": "professional",
                            "formality_level": 2
                        })
                    })
                })
            ]
        })
    with patch("openai.ChatCompletion.acreate", side_effect=async_mock_acreate):
        yield

@pytest.mark.asyncio
async def test_analyze_email(ai_handler):
    """Test email analysis"""
    content = "Test email content"
    result = await ai_handler.analyze_email(content)
    
    assert isinstance(result, EmailAnalysis)
    assert result.summary == "Test summary"
    assert result.stress_level == StressLevel.LOW
    assert result.priority == Priority.MEDIUM
    assert len(result.action_items) == 1
    assert result.sentiment_score == 0.5

@pytest.mark.asyncio
async def test_generate_reply(ai_handler):
    """Test reply generation"""
    content = "Test content"
    result = await ai_handler.generate_reply(content, "professional")
    
    assert isinstance(result, ReplyResponse)
    assert result.content == "Test reply content"
    assert result.tone == "professional"
    assert result.formality_level == 2

@pytest.mark.asyncio
async def test_error_handling(ai_handler):
    """Test error handling"""
    with patch('openai.ChatCompletion.acreate', side_effect=Exception("API Error")):
        with pytest.raises(HTTPException) as exc_info:
            await ai_handler.analyze_email("Test content")
        assert exc_info.value.status_code == 500

@pytest.mark.asyncio
async def test_simplify_content(ai_handler):
    """Test content simplification"""
    content = "Test content"
    result = await ai_handler.simplify_content(content)
    assert isinstance(result, str)

@pytest.mark.asyncio
async def test_generate_response(ai_handler):
    response = await ai_handler.generate_response_suggestion(
        "Can we meet tomorrow to discuss the project?",
        {"ai_assistance": {"level": "balanced"}}
    )
    assert isinstance(response, str)
    assert len(response) > 0





    