from typing import Dict, Any, List
import json
from openai import AsyncOpenAI
from backend.config import settings
from backend.models.email import StressLevel, Priority

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def analyze_content(content: str) -> Dict[str, Any]:
    """Analyze email content using OpenAI"""
    try:
        # Create system message for content analysis
        system_message = """
        Analyze the email content and provide:
        1. Stress level (LOW, MEDIUM, HIGH)
        2. Priority (LOW, MEDIUM, HIGH)
        3. Brief summary
        4. Action items (if any)
        5. Sentiment score (-1.0 to 1.0)
        
        Format the response as a JSON object with these keys:
        {
            "stress_level": "LOW/MEDIUM/HIGH",
            "priority": "LOW/MEDIUM/HIGH",
            "summary": "brief summary",
            "action_items": ["item1", "item2"],
            "sentiment_score": float
        }
        """
        
        # Call OpenAI API
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": content}
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        # Parse response - handle both string and mock responses
        content = response.choices[0].message.content
        if isinstance(content, str):
            analysis = json.loads(content)
        else:
            analysis = content
        
        # Convert string values to enums
        analysis["stress_level"] = StressLevel[analysis["stress_level"].upper()]
        analysis["priority"] = Priority[analysis["priority"].upper()]
        
        return analysis
    except Exception as e:
        # Return default values in case of API error
        return {
            "stress_level": StressLevel.LOW,
            "priority": Priority.LOW,
            "summary": "Error analyzing content",
            "action_items": [],
            "sentiment_score": 0.0
        }