from typing import List, Dict, Optional
import openai
from functools import lru_cache
import os
from tenacity import retry, stop_after_attempt, wait_exponential
from fastapi import HTTPException
from pydantic import BaseModel
from models.email import Email, StressLevel, Priority

class EmailAnalysis(BaseModel):
    stress_level: StressLevel
    priority: Priority
    summary: str
    action_items: List[str]
    sentiment_score: float

class AIHandler:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        openai.api_key = self.api_key

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    @lru_cache(maxsize=100)
    def summarize_email(self, content: str) -> Dict:
        """
        Summarizes email content with a focus on clarity and actionable items.
        Uses a neurodiversity-friendly format with clear structure and bullet points.
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an AI assistant helping neurodivergent users understand their emails.
                        Format your response in a clear, structured way:
                        - Main Point: [One sentence summary]
                        - Key Details: [2-3 bullet points]
                        - Action Needed?: [Yes/No, followed by clear action items if any]
                        - Urgency: [High/Medium/Low with brief explanation]"""
                    },
                    {"role": "user", "content": f"Summarize this email clearly:\n\n{content}"}
                ],
                max_tokens=200,
                temperature=0.5
            )
            return {
                "success": True,
                "summary": response.choices[0].message['content']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def analyze_priority(self, content: str, user_preferences: Optional[Dict] = None) -> Dict:
        """
        Analyzes email priority considering user preferences and neurodivergent needs.
        Includes explanation for transparency in decision-making.
        """
        try:
            context = "Consider urgency, importance, and potential stress factors for neurodivergent users."
            if user_preferences:
                context += f"\nUser preferences: {user_preferences}"

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You analyze email priority with focus on neurodivergent users' needs. {context}
                        Provide:
                        1. Priority level (HIGH/MEDIUM/LOW)
                        2. Brief explanation of why
                        3. Any potential stress triggers to be aware of"""
                    },
                    {"role": "user", "content": f"Analyze this email's priority:\n\n{content}"}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            # Parse the response to extract priority and explanation
            analysis = response.choices[0].message['content'].strip()
            return {
                "success": True,
                "analysis": analysis
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def generate_reply(self, content: str, user_preferences: Optional[Dict] = None) -> Dict:
        """
        Generates clear, concise email replies with optional templates based on user preferences.
        """
        try:
            style_guide = "Keep language clear and direct. Avoid idioms or ambiguous phrases."
            if user_preferences:
                style_guide += f"\nUser preferences: {user_preferences}"

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": f"""Generate a clear, direct email reply. {style_guide}
                        Format:
                        1. Greeting
                        2. Main response (2-3 sentences max)
                        3. Clear next steps (if any)
                        4. Professional closing"""
                    },
                    {"role": "user", "content": f"Generate a reply to this email:\n\n{content}"}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return {
                "success": True,
                "reply": response.choices[0].message['content']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def analyze_email(self, content: str, subject: str) -> EmailAnalysis:
        """Analyze email content for stress level, priority, and action items."""
        try:
            # Create a prompt that includes guidelines for neurodiversity-friendly analysis
            prompt = f"""Analyze this email with focus on stress impact and clarity.
Subject: {subject}
Content: {content}

Provide a structured analysis including:
1. Stress level (low/medium/high)
2. Priority level (low/medium/high)
3. Brief summary (clear and concise)
4. Action items (if any)
5. Overall sentiment score (-1 to 1)

Consider:
- Urgent language
- Emotional tone
- Deadline pressure
- Clarity of requests
- Social demands
"""

            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in analyzing emails with consideration for neurodiversity."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            # Parse the response
            analysis = self._parse_analysis(response.choices[0].message.content)
            
            return EmailAnalysis(
                stress_level=analysis["stress_level"],
                priority=analysis["priority"],
                summary=analysis["summary"],
                action_items=analysis["action_items"],
                sentiment_score=analysis["sentiment_score"]
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing email: {str(e)}"
            )

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
        """Simplify complex email content while maintaining key information."""
        try:
            prompt = f"""Simplify this email content while keeping all important information:
{content}

Guidelines:
1. Use clear, direct language
2. Break down complex sentences
3. Maintain all key points
4. Organize information logically
5. Highlight important dates or deadlines
"""

            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in simplifying text while maintaining meaning."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            return response.choices[0].message.content

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error simplifying content: {str(e)}"
            )

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