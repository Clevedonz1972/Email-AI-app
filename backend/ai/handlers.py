from typing import Dict, Optional
import openai
from functools import lru_cache
import os

class AIHandler:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        openai.api_key = self.api_key

    @lru_cache(maxsize=100)
    def summarize_email(self, content: str) -> Dict:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant that summarizes emails concisely and identifies key action items. Format your response as: Summary: [2-3 sentences] Actions: [bullet points if any]"},
                    {"role": "user", "content": f"Summarize this email:\n\n{content}"}
                ],
                max_tokens=150,
                temperature=0.7
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

    def analyze_priority(self, content: str) -> Dict:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant that analyzes email priority. Consider urgency, sender importance, and content. Respond with only: HIGH, MEDIUM, or LOW"},
                    {"role": "user", "content": f"Analyze this email's priority:\n\n{content}"}
                ],
                max_tokens=10,
                temperature=0.3
            )
            return {
                "success": True,
                "priority": response.choices[0].message['content'].strip()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def generate_reply(self, content: str) -> Dict:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant that helps draft professional email replies. Keep the tone professional but friendly."
                    },
                    {
                        "role": "user",
                        "content": f"Generate a reply to this email:\n\n{content}"
                    }
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