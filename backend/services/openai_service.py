from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from backend.config import settings
from backend.utils.logger import logger, log_error
from backend.models.email import StressLevel, Priority
from tenacity import retry, stop_after_attempt, wait_exponential
import json

_client = None

def get_client() -> AsyncOpenAI:
    """Get or create OpenAI client instance."""
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    reraise=True
)
async def analyze_content(
    content: str,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Analyze email content using OpenAI API.
    
    Args:
        content: The email content to analyze
        context: Additional context for analysis
        
    Returns:
        Dict containing analysis results
    """
    try:
        client = get_client()
        
        # Log content length and context presence
        logger.info(
            "Sending content for analysis",
            extra={
                "content_length": len(content),
                "has_context": context is not None
            }
        )
        
        # Create system prompt
        system_prompt = """
        Analyze the email content and provide:
        1. Stress level (LOW/MEDIUM/HIGH)
        2. Priority (LOW/MEDIUM/HIGH)
        3. Brief summary (max 200 characters)
        4. Action items (if any)
        5. Sentiment score (-1.0 to 1.0)
        
        Consider any provided context about user preferences and sensitivity.
        Format response as JSON with fields: stress_level, priority, summary, action_items, sentiment_score
        """
        if context:
            system_prompt += f"\nUser Context: {json.dumps(context)}"
        
        # Make API request
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ],
            model="gpt-3.5-turbo",
            max_tokens=500,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        try:
            result = json.loads(response.choices[0].message.content)
            required_fields = ["stress_level", "priority", "summary", "action_items", "sentiment_score"]
            
            if not all(field in result for field in required_fields):
                raise ValueError("Missing required fields in API response")
                
            return result
            
        except (json.JSONDecodeError, ValueError) as e:
            log_error(e, {
                "error_type": "response_parsing",
                "response": response.choices[0].message.content
            })
            raise
            
    except Exception as e:
        log_error(e, {
            "error_type": "api_request",
            "content_length": len(content),
            "has_context": context is not None
        })
        raise 