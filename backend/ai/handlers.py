from typing import List, Dict, Optional, Union
import openai
from functools import lru_cache
import os
from tenacity import retry, stop_after_attempt, wait_exponential
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError
from backend.models.email import Email, StressLevel, Priority
import json
from backend.utils.logger import logger

class EmailAnalysis(BaseModel):
    summary: str
    stress_level: StressLevel
    priority: Priority
    action_items: list[str]
    sentiment_score: float

    class Config:
        extra = "allow"

class AIResponse(BaseModel):
    stress_level: StressLevel
    priority: Priority
    summary: str
    action_items: List[str]
    sentiment_score: float

    @classmethod
    def parse_ai_response(cls, response: str) -> "AIResponse":
        try:
            data = json.loads(response)
            return cls(**data)
        except Exception as e:
            logger.error(f"AI response parsing failed: {str(e)}")
            return cls(
                stress_level=StressLevel.MEDIUM,
                priority=Priority.MEDIUM
            )

class ReplyResponse(BaseModel):
    content: str
    tone: str
    formality_level: int

    class Config:
        extra = "allow"

SYSTEM_PROMPT = """You are an AI assistant that always responds with valid JSON.
Your responses must be parseable JSON objects with no additional text or explanations.
Use lowercase for all field values and ensure they match the expected formats."""

class AIHandler:
    def __init__(self, testing: bool = False):
        self.testing = testing
        if testing:
            openai.api_key = "sk-testdummyapikey"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    @lru_cache(maxsize=100)
    def summarize_email(self, content: str) -> Dict[str, Union[str, List[str], float]]:
        """Analyze email content and return structured summary."""
        prompt = {
            "role": "system",
            "content": f"{SYSTEM_PROMPT} Return JSON with fields: summary, stress_level (low/medium/high), "
                      "priority (low/medium/high), action_items (array), and sentiment_score (0-1)"
        }
        
        user_message = {
            "role": "user",
            "content": f"Analyze this email and return JSON only:\n\n{content}"
        }

        response_text = self._create_chat_completion([prompt, user_message])
        return self._parse_json_response(response_text, AIResponse)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def analyze_priority(self, content: str) -> Dict[str, str]:
        """Analyze email priority and stress level."""
        prompt = {
            "role": "system",
            "content": f"{SYSTEM_PROMPT} Return JSON with fields: priority (low/medium/high) "
                      "and stress_level (low/medium/high)"
        }
        
        user_message = {
            "role": "user",
            "content": f"Analyze the priority of this email and return JSON only:\n\n{content}"
        }

        response_text = self._create_chat_completion([prompt, user_message])
        return self._parse_json_response(response_text, AIResponse)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def generate_reply(self, content: str, tone: Optional[str] = "professional") -> ReplyResponse:
        """Generate email reply with specified tone asynchronously."""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"Generate a {tone} reply and return JSON"},
                    {"role": "user", "content": content}
                ],
                temperature=0.7,
                max_tokens=500
            )
            result = json.loads(response.choices[0].message.content)
            return ReplyResponse(**result)
        except Exception as e:
            logger.error(f"Reply generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate reply")

    async def analyze_email(self, content: str) -> EmailAnalysis:
        """Analyze email content and return structured analysis."""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Analyze this email and return JSON"},
                    {"role": "user", "content": content}
                ]
            )
            result = json.loads(response.choices[0].message.content)
            # Convert enum fields to lowercase to match the expectation
            if "stress_level" in result and isinstance(result["stress_level"], str):
                result["stress_level"] = result["stress_level"].lower()
            if "priority" in result and isinstance(result["priority"], str):
                result["priority"] = result["priority"].lower()
            # Filter only the fields needed by EmailAnalysis
            keys = {"summary", "stress_level", "priority", "action_items", "sentiment_score"}
            filtered = {k: v for k, v in result.items() if k in keys}
            return EmailAnalysis(**filtered)
        except Exception as e:
            logger.error(f"Email analysis failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to analyze email")

    async def generate_response_suggestion(
        self, 
        email_content: str,
        user_preferences: Dict
    ) -> str:
        """Generate a response suggestion based on the email content and user preferences."""
        try:
            assistance_level = user_preferences.get("ai_assistance", {}).get("level", "balanced")
            
            prompt = f"""Generate a response to this email:
{email_content}

Style guidelines:
- Assistance level: {assistance_level}
- Clear and direct language
- Professional but friendly tone
- Break down complex points
- Include necessary context

Response should be:
1. Clear and unambiguous
2. Structured with paragraphs
3. Include any relevant questions
4. Address all key points
"""

            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant helping to draft email responses with clarity and consideration for neurodiversity."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating response: {str(e)}"
            )

    async def simplify_content(self, content: str) -> str:
        """Simplify email content."""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Simplify this email"},
                    {"role": "user", "content": content}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Content simplification failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to simplify content")

    def _parse_analysis(self, response: str) -> Dict:
        """Parse the AI response into structured data."""
        try:
            # Implement parsing logic based on the response format
            # This is a simplified version - you might want to use regex or more sophisticated parsing
            lines = response.split('\n')
            
            analysis = {
                "stress_level": StressLevel.MEDIUM,
                "priority": Priority.MEDIUM,
                "summary": "",
                "action_items": [],
                "sentiment_score": 0.0
            }

            for line in lines:
                line = line.lower().strip()
                if "stress level:" in line:
                    level = line.split(":")[-1].strip()
                    analysis["stress_level"] = StressLevel(level)
                elif "priority:" in line:
                    level = line.split(":")[-1].strip()
                    analysis["priority"] = Priority(level)
                elif "summary:" in line:
                    analysis["summary"] = line.split(":")[-1].strip()
                elif "action item:" in line or "- " in line:
                    item = line.replace("action item:", "").replace("- ", "").strip()
                    if item:
                        analysis["action_items"].append(item)
                elif "sentiment score:" in line:
                    score = float(line.split(":")[-1].strip())
                    analysis["sentiment_score"] = max(-1.0, min(1.0, score))

            return analysis

        except Exception as e:
            raise ValueError(f"Error parsing AI response: {str(e)}")

    def _create_chat_completion(self, messages: List[Dict[str, str]], max_retries: int = 2) -> str:
        """Helper function to handle OpenAI API calls with retries."""
        for attempt in range(max_retries + 1):
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content
            except openai.error.OpenAIError as e:
                if attempt == max_retries:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to get AI response after {max_retries} attempts"
                    )
                continue

    def _parse_json_response(self, json_str: str, model: BaseModel) -> Dict:
        """Parse and validate JSON response against a Pydantic model."""
        try:
            data = json.loads(json_str)
            validated_data = model.parse_obj(data)
            return validated_data.dict()
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Invalid JSON response from AI service"
            )
        except ValidationError as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI response missing required fields: {str(e)}"
            )

    async def _call_openai(self, content: str) -> str:
        """We need to implement this method to handle the actual OpenAI calls"""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyze this email:\n\n{content}"}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            raise 