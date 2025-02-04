import pytest
from ai.handlers import AIHandler
from models.email import StressLevel, Priority

@pytest.fixture
def ai_handler():
    return AIHandler()

@pytest.mark.asyncio
async def test_analyze_email():
    handler = AIHandler()
    analysis = await handler.analyze_email(
        content="Urgent: Project deadline tomorrow! Need your input ASAP.",
        subject="Project Deadline"
    )
    
    assert isinstance(analysis.stress_level, StressLevel)
    assert isinstance(analysis.priority, Priority)
    assert len(analysis.action_items) > 0
    assert -1 <= analysis.sentiment_score <= 1

@pytest.mark.asyncio
async def test_generate_response():
    handler = AIHandler()
    response = await handler.generate_response_suggestion(
        "Can we meet tomorrow to discuss the project?",
        {"ai_assistance": {"level": "balanced"}}
    )
    
    assert isinstance(response, str)
    assert len(response) > 0

@pytest.mark.asyncio
async def test_simplify_content():
    handler = AIHandler()
    simplified = await handler.simplify_content(
        "Despite the numerous challenges we encountered during the implementation phase, "
        "we managed to successfully complete the project ahead of schedule."
    )
    
    assert isinstance(simplified, str)
    assert len(simplified) > 0 