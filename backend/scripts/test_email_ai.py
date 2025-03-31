#!/usr/bin/env python3
"""
Simple test script for email AI analysis without database dependency.

This script tests the OpenAI integration with sample emails and displays the results,
without requiring a database connection.
"""
import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

# Sample test emails with different tones and content
TEST_EMAILS = [
    {
        "subject": "Urgent: Project Deadline Change",
        "content": """
Hi Team,

I need to inform you that our project deadline has been moved up. We now have only 5 days to complete everything that was originally scheduled for the next two weeks.

The client called this morning and said their board requires the deliverables by next Monday for an important investor presentation. This is non-negotiable.

Please adjust your schedules accordingly and let me know if you foresee any major blockers. We'll need to prioritize the critical features and potentially drop some secondary elements.

I'll schedule an emergency team meeting for tomorrow morning at 9 AM to discuss our revised strategy.

Regards,
Project Manager
        """
    },
    {
        "subject": "Quick question about yesterday's presentation",
        "content": """
Hey there,

Hope your day is going well! I was reviewing my notes from yesterday's presentation, and I realized I might have missed something about the new reporting workflow.

Could you clarify how the approval process works when a manager is out of office? Is there an automatic delegation, or should we manually reassign?

No rush on this - whenever you have a moment to respond is fine.

Thanks!
Jamie
        """
    },
    {
        "subject": "Your feedback requested: Product roadmap survey",
        "content": """
Hello valued customer,

As we plan our product developments for the coming year, we would love to hear your thoughts and priorities.

We've created a short 5-minute survey to gather feedback on which features would be most valuable to you. Your input directly influences our roadmap decisions.

Please complete the survey by Friday, June 10th using the link below:
[SURVEY LINK]

As a thank you for your time, all participants will receive a $10 gift card and be entered into a drawing for one of three $100 Amazon gift cards.

We appreciate your partnership and look forward to building the tools you need.

Best regards,
The Product Team
        """
    }
]

def check_env_file():
    """Check if .env file exists and contains OPENAI_API_KEY."""
    env_path = os.path.join(backend_dir, '.env')
    
    if not os.path.exists(env_path):
        print("ERROR: .env file not found at:", env_path)
        print("Please create this file with your OpenAI API key.")
        return None
    
    api_key = None
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('OPENAI_API_KEY='):
                api_key = line.strip().split('=', 1)[1].strip()
                # Remove quotes if present
                if (api_key.startswith('"') and api_key.endswith('"')) or \
                   (api_key.startswith("'") and api_key.endswith("'")):
                    api_key = api_key[1:-1]
                break
    
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in .env file")
        print("Please add your OpenAI API key to the .env file with the format:")
        print("OPENAI_API_KEY=your-api-key-here")
        return None
    
    return api_key

async def analyze_email(email, api_key):
    """Analyze an email using OpenAI API."""
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(api_key=api_key)
    
    # Build the full email text
    full_email = f"Subject: {email['subject']}\n\n{email['content']}"
    
    # Create the system prompt
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
    """
    
    # Create the request
    messages = [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": f"Email:\n\n{full_email}"}
    ]
    
    # Send the request
    try:
        print(f"Analyzing email: {email['subject']}")
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using 3.5 for faster response and lower cost
            messages=messages,
            max_tokens=800,
            temperature=0.4,
        )
        
        # Log token usage
        if hasattr(response, 'usage'):
            print(f"Token usage: prompt={response.usage.prompt_tokens}, completion={response.usage.completion_tokens}, total={response.usage.total_tokens}")
        
        # Parse the response
        result = response.choices[0].message.content
        
        try:
            # Try to parse as JSON
            analysis = json.loads(result)
            return analysis
        except json.JSONDecodeError:
            print("Error: Could not parse response as JSON")
            print("Raw response:", result)
            return {"error": "Failed to parse JSON response", "raw_response": result}
        
    except Exception as e:
        print(f"Error analyzing email: {str(e)}")
        return {"error": str(e)}

def display_analysis(email, analysis):
    """Display the email analysis in a readable format."""
    print("\n" + "="*80)
    print(f"EMAIL: {email['subject']}")
    print("="*80)
    
    # Display an excerpt of the email content
    content_preview = email['content'].strip()
    if len(content_preview) > 150:
        content_preview = content_preview[:150] + "..."
    print(f"Content: {content_preview}")
    
    # Check for errors
    if "error" in analysis:
        print("\nERROR:", analysis["error"])
        if "raw_response" in analysis:
            print("Raw response:", analysis["raw_response"][:100] + "...")
        return
    
    # AI Summary
    print("\n" + "-"*40)
    print("AI SUMMARY")
    print("-"*40)
    print(analysis.get("summary", "No summary available"))
    
    # Emotional context
    print("\n" + "-"*40)
    print("EMOTIONAL CONTEXT")
    print("-"*40)
    print(f"Tone: {analysis.get('emotional_tone', 'Unknown')}")
    print(f"Stress Level: {analysis.get('stress_level', 'MEDIUM')}")
    print(f"Needs Immediate Attention: {'Yes' if analysis.get('needs_immediate_attention', False) else 'No'}")
    
    # Expectations
    if analysis.get("explicit_expectations") or analysis.get("implicit_expectations"):
        print("\n" + "-"*40)
        print("SENDER EXPECTATIONS")
        print("-"*40)
        
        if analysis.get("explicit_expectations"):
            print("Explicit expectations:")
            for i, exp in enumerate(analysis.get("explicit_expectations", []), 1):
                print(f"  {i}. {exp}")
        
        if analysis.get("implicit_expectations"):
            print("\nImplicit expectations:")
            for i, exp in enumerate(analysis.get("implicit_expectations", []), 1):
                print(f"  {i}. {exp}")
    
    # Suggested actions
    if analysis.get("suggested_actions"):
        print("\n" + "-"*40)
        print("SUGGESTED ACTIONS")
        print("-"*40)
        
        for i, action in enumerate(analysis.get("suggested_actions", []), 1):
            print(f"{i}. {action.get('action', 'Unknown action')}")
            
            if action.get('deadline'):
                print(f"   Deadline: {action.get('deadline')}")
            
            if action.get('effort_level'):
                print(f"   Effort: {action.get('effort_level')}")
            
            if action.get('steps'):
                print("   Steps:")
                for j, step in enumerate(action.get('steps'), 1):
                    print(f"     {j}. {step}")
            print()
    
    # Suggested response
    if analysis.get("suggested_response"):
        print("\n" + "-"*40)
        print("SUGGESTED RESPONSE")
        print("-"*40)
        print(analysis.get("suggested_response"))
    
    print("\n" + "="*80)

async def test_enhanced_email_analysis():
    """Test the enhanced email analysis features with emotional tone and expectations."""
    api_key = check_env_file()
    if not api_key:
        print("ERROR: OpenAI API key not found. Skipping enhanced analysis test.")
        return

    print("\n=== Testing Enhanced Email Analysis ===")
    
    # Sample email with complex emotional context
    test_email = """
Subject: Performance Review Feedback - ACTION REQUIRED

Hello [Name],

I've completed your preliminary performance review based on the last quarter's results. While there were some strengths in your reporting accuracy, I'm concerned about missed deadlines on the Johnson project and Henderson account.

We need to schedule a one-on-one meeting next week to discuss these issues and create an improvement plan. Please suggest 3 time slots that work for you by end of day tomorrow.

Your overall performance score is currently at 6.5/10, which is below our department's target of 8.0. I believe you can improve this score with some focused efforts in the coming quarter.

Regards,
Manager
    """
    
    # Import the enhanced analysis function
    from backend.services.openai_service import get_email_summary_and_suggestion
    
    # Create context to use the more advanced model
    context = {
        "stress_sensitivity": "MEDIUM",
        "communication_preferences": "CLEAR",
        "action_item_detail": "HIGH",
        "use_advanced_model": True
    }
    
    # Test the enhanced analysis
    try:
        print(f"Analyzing email with enhanced features...")
        analysis = await get_email_summary_and_suggestion(test_email, context)
        
        # Display the results
        print("\n" + "="*80)
        print("ENHANCED EMAIL ANALYSIS RESULTS")
        print("="*80)
        
        print(f"\nSummary: {analysis.get('summary', 'No summary available')}")
        print(f"\nEmotional Tone: {analysis.get('emotional_tone', 'Unknown')}")
        print(f"\nStress Level: {analysis.get('stress_level', 'Unknown')}")
        
        if 'explicit_expectations' in analysis and analysis['explicit_expectations']:
            print("\nExplicit Expectations:")
            for i, exp in enumerate(analysis['explicit_expectations'], 1):
                print(f"  {i}. {exp}")
        
        if 'implicit_expectations' in analysis and analysis['implicit_expectations']:
            print("\nImplicit Expectations:")
            for i, exp in enumerate(analysis['implicit_expectations'], 1):
                print(f"  {i}. {exp}")
        
        if 'suggested_actions' in analysis and analysis['suggested_actions']:
            print("\nSuggested Actions:")
            for i, action in enumerate(analysis['suggested_actions'], 1):
                print(f"  {i}. {action.get('action', 'Unknown action')}")
                if 'steps' in action and action['steps']:
                    print("     Steps:")
                    for j, step in enumerate(action['steps'], 1):
                        print(f"       {j}. {step}")
                if 'deadline' in action and action['deadline']:
                    print(f"     Deadline: {action['deadline']}")
                if 'effort_level' in action and action['effort_level']:
                    print(f"     Effort: {action['effort_level']}")
        
        if 'suggested_response' in analysis and analysis['suggested_response']:
            print("\nSuggested Response:")
            print(f"{analysis['suggested_response']}")
            
        print("\n=== Enhanced Analysis Test Completed ===")
        
    except Exception as e:
        print(f"Error in enhanced analysis: {str(e)}")

async def main():
    """Run test email analysis."""
    api_key = check_env_file()
    if not api_key:
        print("Failed to get OpenAI API key. Please set up your .env file first.")
        return
    
    print(f"Using API key: {api_key[:5]}...{api_key[-4:]}")
    print(f"Testing {len(TEST_EMAILS)} emails...")
    
    # Test basic email analysis
    for i, email in enumerate(TEST_EMAILS, 1):
        print(f"\nEmail {i}/{len(TEST_EMAILS)}:")
        try:
            analysis = await analyze_email(email, api_key)
            display_analysis(email, analysis)
        except Exception as e:
            print(f"Error analyzing email: {str(e)}")
            display_analysis(email, {"error": str(e)})
    
    # Test enhanced email analysis
    await test_enhanced_email_analysis()
    
    print("\n=== Test Completed ===")

if __name__ == "__main__":
    asyncio.run(main()) 