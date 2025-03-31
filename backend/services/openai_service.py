import logging
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI
from backend.config import settings
from backend.utils.logger import logger, log_error
from backend.models.email import StressLevel, Priority
from tenacity import retry, stop_after_attempt, wait_exponential
import json
import time

_client = None

def get_client() -> AsyncOpenAI:
    """Get or create OpenAI client instance."""
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

# Define the OpenAI models to use
GPT_4_MODEL = "gpt-4-turbo"  # Latest GPT-4 model
GPT_3_5_MODEL = "gpt-3.5-turbo"  # Faster and cheaper model for simpler tasks
EMBEDDING_MODEL = "text-embedding-3-small"  # For vector embeddings

@retry(stop_after_attempt(3), wait_exponential(multiplier=1, min=1, max=10))
async def analyze_content(content: str, context: Optional[Dict] = None) -> Dict:
    """
    Analyze content using OpenAI API with accessibility considerations for
    neurodiverse users with various cognitive needs.
    """
    try:
        # Track start time for performance monitoring
        start_time = time.time()
        
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
        
        # Use GPT-3.5 for faster and cheaper analysis where appropriate
        model = GPT_3_5_MODEL
        if context and context.get("use_advanced_model", False):
            model = GPT_4_MODEL
            
        response = await client.chat.completions.create(
            model=model, 
            messages=messages,
            max_tokens=700,
            temperature=0.5,
        )
        
        # Calculate elapsed time for performance monitoring
        elapsed_time = time.time() - start_time
        logger.info(f"Content analysis completed in {elapsed_time:.2f} seconds")
        
        # Log token usage
        log_token_usage(response, "analyze_content")
        
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

def log_token_usage(response: Any, function_name: str) -> None:
    """Log token usage to monitor OpenAI API costs."""
    try:
        if hasattr(response, 'usage'):
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens
            
            logger.info(
                f"Token usage for {function_name}: "
                f"prompt={prompt_tokens}, "
                f"completion={completion_tokens}, "
                f"total={total_tokens}"
            )
    except Exception as e:
        logger.error(f"Error logging token usage: {str(e)}")

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
        
        # Log token usage
        log_token_usage(response, "generate_simplified_version")
        
        return response.choices[0].message.content
    except Exception as e:
        log_error(f"Error generating simplified version: {str(e)}")
        return "Could not generate simplified version."

@retry(stop_after_attempt(3), wait_exponential(multiplier=1, min=1, max=10))
async def get_email_summary_and_suggestion(email_text: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Analyze an email for ASTI to provide a summary, emotional context, and suggested actions.
    Specifically designed to help neurodivergent users manage email overload.
    
    Args:
        email_text: The full text of the email
        user_context: Optional dictionary of user context (preferences, stress sensitivity, etc.)
        
    Returns:
        Dictionary containing analysis results including summary, emotional tone, and suggested actions
    """
    try:
        start_time = time.time()
        client = get_client()
        
        # Default user preferences if not provided
        if user_context is None:
            user_context = {
                "stress_sensitivity": "MEDIUM",
                "communication_preferences": "CLEAR",
                "action_item_detail": "HIGH"
            }
        
        # Build system prompt based on ASTI's purpose
        system_prompt = """
        You are ASTI, a supportive AI assistant for neurodivergent users. Your role is to help reduce 
        email overwhelm by providing clear summaries and actionable next steps.
        
        Analyze the following email and provide:
        1. A clear, concise summary (2-3 sentences)
        2. The emotional tone of the email (formal, friendly, urgent, angry, etc.)
        3. Any explicit or implicit expectations from the sender
        4. Specific action items the user should take, broken into simple steps
        5. A suggested response template if a reply is needed
        
        Format your response as structured JSON with these keys:
        {
            "summary": "Brief summary of the email content",
            "emotional_tone": "The emotional tone of the email",
            "stress_level": "LOW", "MEDIUM", or "HIGH",
            "explicit_expectations": ["List of clear expectations"],
            "implicit_expectations": ["List of unstated but implied expectations"],
            "suggested_actions": [{
                "action": "What to do",
                "steps": ["Step 1", "Step 2"],
                "deadline": "When it needs to be done by (if applicable)",
                "effort_level": "LOW", "MEDIUM", or "HIGH"
            }],
            "suggested_response": "Template for a response if needed",
            "needs_immediate_attention": true/false
        }
        
        If the email doesn't require any action, include "no_action_needed": true in your response.
        
        Always be supportive, reduce cognitive load, and provide clarity for neurodivergent users.
        """
        
        # Add user-specific customizations
        if "communication_preferences" in user_context:
            if user_context["communication_preferences"] == "SIMPLIFIED":
                system_prompt += """
                Use simplified language in all responses. Avoid complex sentences, idioms, and jargon.
                Break down all steps into smaller sub-steps when possible.
                """
            elif user_context["communication_preferences"] == "DETAILED":
                system_prompt += """
                Provide more detailed explanations and clear context for all suggestions.
                Include 'why' explanations for each action item.
                """
                
        # Adjust stress sensitivity
        stress_sensitivity = user_context.get("stress_sensitivity", "MEDIUM")
        if stress_sensitivity == "HIGH":
            system_prompt += """
            Be extra cautious about flagging potential stressors in communications.
            Even mild time pressures or subtle expectations should be highlighted.
            """
        elif stress_sensitivity == "LOW":
            system_prompt += """
            Focus only on clear and direct stressors in communications.
            Don't flag mild time pressure or standard work expectations as stressors.
            """
            
        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": f"Email:\n\n{email_text}"}
        ]
        
        # Choose model based on complexity and importance
        # For most emails, use GPT-4 for its more nuanced understanding of social context
        model = GPT_4_MODEL
        
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=800,
                temperature=0.4,
            )
            
            # Log token usage and performance
            log_token_usage(response, "get_email_summary_and_suggestion")
            elapsed_time = time.time() - start_time
            logger.info(f"Email analysis completed in {elapsed_time:.2f} seconds using {model}")
            
            # Parse the response
            result = response.choices[0].message.content
            
            try:
                # Try to parse as JSON
                analysis = json.loads(result)
                return analysis
            except json.JSONDecodeError:
                logger.error("Error: Could not parse response as JSON")
                logger.debug(f"Raw response: {result}")
                
                # Fallback - try again with explicit structure request
                fallback_response = await client.chat.completions.create(
                    model=model,
                    messages=messages + [
                        {"role": "assistant", "content": result},
                        {"role": "user", "content": "Please reformat your response as valid JSON only."}
                    ],
                    max_tokens=800,
                    temperature=0.2,
                )
                
                fallback_result = fallback_response.choices[0].message.content
                
                try:
                    return json.loads(fallback_result)
                except json.JSONDecodeError:
                    # If still failing, return structured error with partial information
                    logger.error("Fallback parsing also failed")
                    return {
                        "error": "Failed to parse JSON response",
                        "summary": "The email content could not be automatically analyzed.",
                        "emotional_tone": "unknown",
                        "stress_level": "MEDIUM",
                        "suggested_actions": [
                            {
                                "action": "Review email manually",
                                "steps": ["Check email content", "Determine if action is needed"],
                                "effort_level": "MEDIUM"
                            }
                        ],
                        "needs_immediate_attention": False
                    }
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
            
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        return {"error": str(e)}

@retry(stop_after_attempt(3), wait_exponential(multiplier=1, min=1, max=10))
async def generate_embedding(text: str) -> List[float]:
    """
    Generate vector embedding for text using OpenAI's embedding model.
    
    Args:
        text: Text to create embedding for
        
    Returns:
        List of float values representing the embedding vector
    """
    try:
        client = get_client()
        
        # Trim text if longer than token limit (roughly ~8000 tokens for embedding-3)
        # This is a rough approximation - around 4 characters per token
        max_chars = 32000
        if len(text) > max_chars:
            logger.warning(f"Text too long for embedding ({len(text)} chars), truncating to {max_chars} chars")
            text = text[:max_chars]
        
        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text,
            encoding_format="float"
        )
        
        # Log token usage
        if hasattr(response, 'usage'):
            logger.info(f"Embedding token usage: {response.usage.prompt_tokens} tokens")
            
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise

async def generate_daily_brief(user_context: Dict, emails: List[Dict], events: List[Dict]) -> Dict:
    """
    Generate a daily brief for the user based on their emails, calendar events, and personal context.
    
    Args:
        user_context: User preferences and context
        emails: Recent important emails
        events: Upcoming calendar events
        
    Returns:
        Dictionary containing personalized daily brief
    """
    try:
        client = get_client()
        
        # Prepare the prompt with user context and data
        email_summaries = "\n".join([
            f"- {email.get('subject', 'No subject')}: {email.get('summary', 'No summary available')}"
            for email in emails[:5]  # Limit to 5 most important emails
        ])
        
        event_summaries = "\n".join([
            f"- {event.get('title', 'Untitled event')}: {event.get('start_time', 'No time')} - {event.get('description', 'No description')}"
            for event in events[:5]  # Limit to 5 upcoming events
        ])
        
        system_prompt = """
        You are ASTI, a supportive AI assistant for neurodivergent users. Your role is to create
        a clear, concise, and helpful daily brief that reduces overwhelm and helps with executive function.
        
        The brief should include:
        1. A supportive greeting appropriate for the time of day
        2. A summary of the most important emails and their required actions
        3. A summary of upcoming calendar events
        4. Suggestions for prioritizing tasks
        5. A wellbeing tip relevant to the user's context
        
        Format your response as JSON with these keys:
        {
            "greeting": "Personalized greeting",
            "summary": "Brief overview of the day",
            "email_highlights": [
                {"subject": "Email subject", "summary": "Brief description", "priority": "HIGH/MEDIUM/LOW"}
            ],
            "upcoming_events": [
                {"title": "Event title", "time": "Time of event", "preparation_needed": "Any prep needed"}
            ],
            "suggested_priorities": [
                {"task": "Task description", "reason": "Why this is important"}
            ],
            "wellbeing_suggestion": "A supportive wellbeing tip",
            "focus_tip": "A tip for maintaining focus today"
        }
        """
        
        # Add user-specific customizations
        user_name = user_context.get("name", "")
        if user_name:
            system_prompt += f"\nAddress the user as {user_name} in your greeting."
        
        # Adjust for stress sensitivity
        stress_sensitivity = user_context.get("stress_sensitivity", "MEDIUM")
        if stress_sensitivity == "HIGH":
            system_prompt += """
            Be extra supportive and calming in your tone.
            Emphasize that tasks can be broken down and offer more structure.
            """
        
        content = f"""
        User context:
        - Stress sensitivity: {user_context.get('stress_sensitivity', 'MEDIUM')}
        - Communication preference: {user_context.get('communication_preferences', 'CLEAR')}
        
        Recent important emails:
        {email_summaries if email_summaries else "No important emails"}
        
        Upcoming events:
        {event_summaries if event_summaries else "No upcoming events"}
        
        Current time: {time.strftime("%A, %B %d, %Y %H:%M")}
        """
        
        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": content.strip()}
        ]
        
        response = await client.chat.completions.create(
            model=GPT_4_MODEL,  # Always use GPT-4 for daily brief for highest quality
            messages=messages,
            max_tokens=1000,
            temperature=0.7,  # Slightly higher temperature for personalization
        )
        
        # Log token usage
        log_token_usage(response, "generate_daily_brief")
        
        result = response.choices[0].message.content
        
        try:
            # Parse JSON response
            brief = json.loads(result)
            return brief
        except json.JSONDecodeError:
            logger.error("Failed to parse daily brief JSON")
            # Create a simplified fallback response
            return {
                "greeting": f"Good {get_time_of_day()}!",
                "summary": "Here's a summary of your day.",
                "email_highlights": [],
                "upcoming_events": [],
                "suggested_priorities": [],
                "wellbeing_suggestion": "Take regular breaks throughout your day.",
                "focus_tip": "Consider using the Pomodoro technique to maintain focus today."
            }
    except Exception as e:
        logger.error(f"Error generating daily brief: {str(e)}")
        raise

def get_time_of_day() -> str:
    """Helper function to get appropriate greeting based on time of day."""
    hour = int(time.strftime("%H"))
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    else:
        return "evening" 