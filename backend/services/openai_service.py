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

@retry(stop_after_attempt(3), wait_exponential(multiplier=1, min=1, max=10))
async def analyze_content(content: str, context: Optional[Dict] = None) -> Dict:
    """
    Analyze content using OpenAI API with accessibility considerations for
    neurodiverse users with various cognitive needs.
    """
    try:
        client = get_client()
        
        content_length = len(content)
        has_context = context is not None
        
        logger.info(
            f"Analyzing content with length {content_length}, context provided: {has_context}"
        )
        
        # Specific accommodations for neurodiverse users
        simplify_language = context.get("simplify_language", False) if context else False
        stress_sensitivity = context.get("stress_sensitive", "MEDIUM") if context else "MEDIUM"
        neurodiverse_focus = context.get("neurodiverse_focus", True) if context else True
        
        system_prompt = """
        Analyze the following content and provide a detailed analysis including:
        1. Stress level: Determine if the content has LOW, MEDIUM, or HIGH stress indicators
        2. Priority: Assign a priority level of LOW, MEDIUM, or HIGH
        3. Summary: Provide a clear and concise summary of the content (3-5 sentences)
        4. Action items: Extract any clear action items or tasks
        5. Sentiment score: Rate sentiment from -5 (very negative) to 5 (very positive)
        
        Return your analysis as a structured JSON with the following fields:
        {
            "stress_level": "LOW|MEDIUM|HIGH",
            "priority": "LOW|MEDIUM|HIGH",
            "summary": "Concise summary here",
            "action_items": ["Item 1", "Item 2"],
            "sentiment_score": -5 to 5,
            "tone_analysis": "Brief analysis of tone",
            "suggestions": ["Suggestion 1", "Suggestion 2"]
        }
        """
        
        # Add special instructions for neurodiverse users
        if neurodiverse_focus:
            system_prompt += """
            This content is being analyzed for a neurodiverse user who may have:
            - ADHD (difficulty with attention regulation, executive function, and prioritization)
            - Autism (challenges with social cues and complex language)
            - Dyslexia (difficulty with text processing)
            
            Please adapt your analysis to:
            1. Identify overwhelming language, time pressures, or anxiety triggers
            2. Flag urgent deadlines that might cause stress
            3. Provide extra clear action items with specific next steps
            4. Suggest ways to break complex tasks into smaller, manageable steps
            5. Identify social cues or implicit expectations that might be unclear
            """
            
        # Add simplification instructions for cognitive load reduction
        if simplify_language:
            system_prompt += """
            Additionally, provide a simplified version of any response that:
            1. Uses shorter sentences and simpler vocabulary
            2. Eliminates unnecessary jargon and idioms
            3. Uses bullet points for key information
            4. Clearly marks deadlines, requests, and expectations
            5. Provides a readability score for the original content
            """
            
        # Adjust stress detection based on user sensitivity
        if stress_sensitivity == "HIGH":
            system_prompt += """
            Use heightened sensitivity when detecting stress triggers. Flag even mild urgency indicators
            or subtle pressure language as potential stress factors.
            """
        elif stress_sensitivity == "LOW":
            system_prompt += """
            Use reduced sensitivity when detecting stress triggers. Only flag explicit urgency or 
            high-pressure language as stress factors.
            """
        
        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": content}
        ]
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo", 
            messages=messages,
            max_tokens=700,
            temperature=0.5,
        )
        
        analysis = response.choices[0].message.content

        try:
            # Try to parse the analysis as valid JSON
            analysis_dict = json.loads(analysis)
            
            # Ensure all required fields are present
            required_fields = ["stress_level", "priority", "summary", "action_items", "sentiment_score"]
            for field in required_fields:
                if field not in analysis_dict:
                    analysis_dict[field] = "Not provided" if field in ["stress_level", "priority", "summary"] else []
            
            # Add simplified version if requested
            if simplify_language and "simplified_version" not in analysis_dict:
                analysis_dict["simplified_version"] = await generate_simplified_version(content)
                
            return analysis_dict
        except Exception as e:
            log_error(f"Error parsing analysis JSON: {str(e)}")
            # Return a structured response even if JSON parsing fails
            return {
                "stress_level": "MEDIUM",
                "priority": "MEDIUM",
                "summary": "Unable to parse analysis. The content may require manual review.",
                "action_items": [],
                "sentiment_score": 0,
                "error": "Failed to parse analysis response"
            }
            
    except Exception as e:
        log_error(f"Error analyzing content: {str(e)}")
        raise

async def generate_simplified_version(content: str) -> str:
    """Generate a simplified version of content for cognitive accessibility."""
    try:
        client = get_client()
        
        system_prompt = """
        You are an accessibility specialist focused on cognitive accessibility.
        Rewrite the following content to be more accessible for people with:
        - ADHD
        - Autism
        - Dyslexia
        - Cognitive processing difficulties
        
        Make these specific changes:
        1. Use shorter sentences (15 words or less when possible)
        2. Replace complex words with simpler alternatives
        3. Use bullet points for lists and steps
        4. Highlight key information with **bold text**
        5. Remove unnecessary information
        6. Make action items and deadlines extremely clear
        7. Remove idioms, metaphors and ambiguous language
        
        The goal is maximum clarity and reduced cognitive load.
        """
        
        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": content}
        ]
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo", 
            messages=messages,
            max_tokens=500,
            temperature=0.3,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        log_error(f"Error generating simplified version: {str(e)}")
        return "Could not generate simplified version." 