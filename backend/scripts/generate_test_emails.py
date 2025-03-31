#!/usr/bin/env python3
"""
Generate realistic test emails for ASTI to process.

This script creates a set of mock emails with different tones, urgency levels,
and complexity to test ASTI's AI analysis capabilities.
"""
import asyncio
import json
import sys
import uuid
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

from backend.services.openai_service import get_email_summary_and_suggestion, generate_embedding
from backend.services.vector_memory import add_memory
from backend.utils.logger import logger
from backend.models.email import Email, EmailAnalysis
from backend.database import get_db
from sqlalchemy.orm import Session

# Collection of realistic test emails
TEST_EMAILS = [
    {
        "subject": "Urgent: Project Deadline Moved Up",
        "content": """
Hi Team,

I've just been informed by the client that they need to move up our project delivery deadline by one week. This means we now need to complete everything by next Friday instead of the originally planned date.

I understand this puts additional pressure on everyone, but the client has cited market timing issues that make this change necessary. We'll need to accelerate our timeline and potentially reprioritize some tasks.

Can everyone please review their current assignments and let me know by EOD if you foresee any blockers that would prevent us from meeting this new deadline? We'll have an emergency team meeting tomorrow at 10 AM to discuss the revised plan.

If you need additional resources or support, please flag this immediately so we can address it.

Thanks for your understanding and flexibility,
Sarah Johnson
Project Manager
        """,
        "sender": {"email": "sarah.johnson@company.com", "name": "Sarah Johnson"},
        "recipients": [{"email": "team@company.com", "name": "Project Team"}],
        "timestamp": (datetime.now() - timedelta(hours=3)).isoformat()
    },
    {
        "subject": "Invitation: Annual Company Retreat",
        "content": """
Hello Everyone,

I'm excited to announce our annual company retreat, scheduled for September 15-17 at Mountain Lake Resort.

This year's theme is "Innovation & Connection," and we have a fantastic lineup of team-building activities, workshops, and relaxation time planned. This is a great opportunity to connect with colleagues from other departments and locations.

Details:
- Dates: September 15-17, 2023
- Location: Mountain Lake Resort (transportation will be provided)
- Accommodation: Shared cabins (please indicate any rooming preferences)
- Activities: Team building, strategic planning, outdoor adventures, and evening social events

Please RSVP by August 20th by filling out the form at the link below. Be sure to include any dietary restrictions or accessibility needs.

[RSVP Form Link]

Looking forward to seeing everyone there!

Best regards,
Michael Chen
HR Director
        """,
        "sender": {"email": "michael.chen@company.com", "name": "Michael Chen"},
        "recipients": [{"email": "all-staff@company.com", "name": "All Staff"}],
        "timestamp": (datetime.now() - timedelta(days=2)).isoformat()
    },
    {
        "subject": "Follow-up on Yesterday's Client Meeting",
        "content": """
Hi Alex,

Thank you for joining yesterday's meeting with XYZ Corp. I think it went well, but I wanted to get your thoughts on a few things:

1. The client seemed hesitant about our pricing structure. Do you think we should prepare alternative options?

2. They asked for case studies in similar industries. Could you pull together 2-3 examples by Friday?

3. I noticed some confusion around implementation timelines. Let's make sure our next presentation has a clearer roadmap.

On a positive note, they were very impressed with the technical demo you provided. Good job on that!

Can we schedule a quick 30-minute debrief this afternoon to align on next steps? I'm free between 2-4 PM.

Thanks,
Jennifer
        """,
        "sender": {"email": "jennifer.martinez@company.com", "name": "Jennifer Martinez"},
        "recipients": [{"email": "alex.taylor@company.com", "name": "Alex Taylor"}],
        "timestamp": (datetime.now() - timedelta(hours=20)).isoformat()
    },
    {
        "subject": "ACTION REQUIRED: Update your benefits selection by Friday",
        "content": """
IMPORTANT: This message requires action by Friday, July 15th.

Dear Employee,

Our annual benefits enrollment period is now open. You must review and confirm your benefits selections for the upcoming year, even if you don't wish to make changes.

Please complete the following by Friday, July 15th:
1. Log into the HR portal (https://hr.company.com)
2. Navigate to "Benefits Enrollment"
3. Review your current selections
4. Make any desired changes
5. Click "Confirm Selections"

Failure to complete this process by the deadline will result in your benefits reverting to the basic default plan.

NOTE: This year includes important changes to our healthcare providers and 401(k) matching program that may affect your selections.

If you have any questions or need assistance, please contact HR Support at hr-support@company.com.

Regards,
HR Benefits Team
        """,
        "sender": {"email": "benefits@company.com", "name": "Benefits Team"},
        "recipients": [{"email": "employee@company.com", "name": "Employee"}],
        "timestamp": (datetime.now() - timedelta(days=1)).isoformat()
    },
    {
        "subject": "Quick question about the meeting notes",
        "content": """
Hey Sam,

Hope you're doing well! I was looking through the notes from last week's brainstorming session, but I can't seem to find the list of potential vendors we discussed.

Would you happen to have that information? If you could share it when you get a chance, that would be super helpful.

No rush on this - whenever you have a moment is fine.

Thanks!
Jamie
        """,
        "sender": {"email": "jamie.wilson@company.com", "name": "Jamie Wilson"},
        "recipients": [{"email": "sam.rodriguez@company.com", "name": "Sam Rodriguez"}],
        "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()
    },
    {
        "subject": "URGENT SECURITY ALERT: Password Reset Required Immediately",
        "content": """
CRITICAL SECURITY NOTIFICATION

Our security team has detected unusual login attempts on your account. As a precautionary measure, you must reset your password IMMEDIATELY.

This is required to maintain access to company systems and protect sensitive information.

ACTION REQUIRED WITHIN 24 HOURS:
1. Click the link below to reset your password
2. Create a new password following our security guidelines
3. Verify your account with two-factor authentication

[RESET PASSWORD LINK]

Failure to complete this action will result in your account being temporarily suspended for security purposes.

If you have questions, contact the IT Security team at security@company.com or call our emergency hotline at 555-123-4567.

DO NOT IGNORE THIS MESSAGE.

IT Security Department
        """,
        "sender": {"email": "security-alerts@company.com", "name": "IT Security"},
        "recipients": [{"email": "employee@company.com", "name": "Employee"}],
        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat()
    },
    {
        "subject": "Weekly Team Update - Progress and Blockers",
        "content": """
Hi everyone,

Here's our weekly team update:

COMPLETED THIS WEEK:
- User authentication system refactoring (thanks to Priya and team)
- Q2 budget forecasting and adjustments
- Client presentations for Northwest region (3/4 positive responses)
- Initial design concepts for mobile app refresh

IN PROGRESS:
- Database migration (currently at 60%, on track)
- New hire onboarding (2 developers starting next Monday)
- Marketing campaign materials (waiting on legal review)

BLOCKERS:
- Still waiting on vendor API documentation - Mark following up
- Office renovation noise affecting west wing team - discussing temporary relocation options
- Resource allocation for the Phoenix project (need 1-2 more developers)

UPCOMING DEADLINES:
- July 15: Q3 Planning documents due
- July 18: Client demo for Ferguson account
- July 22: Team quarterly review

Please update your individual tasks in the project management system by EOD Friday.

Our team lunch is still on for Thursday at 12:30!

Best,
Raj
        """,
        "sender": {"email": "raj.patel@company.com", "name": "Raj Patel"},
        "recipients": [{"email": "dev-team@company.com", "name": "Development Team"}],
        "timestamp": (datetime.now() - timedelta(days=3)).isoformat()
    },
    {
        "subject": "Request for Proposal: Website Redesign Project",
        "content": """
To Whom It May Concern:

GreenSpace Solutions is seeking proposals for a complete redesign of our corporate website. We invite your company to submit a proposal for this project.

PROJECT OVERVIEW:
We require a modern, responsive website that better represents our brand and improves user experience. The current site has not been updated in 5+ years and no longer meets our needs.

KEY REQUIREMENTS:
- Complete visual redesign aligned with our updated brand guidelines
- Responsive design for mobile and tablet compatibility
- Improved content management system for non-technical users
- Integration with our CRM system
- Enhanced search functionality
- Blog/news section with social media integration
- Performance optimization for speed and SEO
- Accessibility compliance (WCAG 2.1 AA)

TIMELINE:
- Proposal Due: August 15, 2023
- Vendor Selection: September 1, 2023
- Project Kickoff: September 15, 2023
- Beta Launch: December 1, 2023
- Full Launch: January 15, 2024

SUBMISSION REQUIREMENTS:
Please include company background, relevant experience, proposed approach, timeline, team composition, and detailed cost breakdown.

Send proposals to proposals@greenspace.com with the subject line "Website Redesign Proposal."

Questions may be directed to emily.wong@greenspace.com prior to August 1.

Regards,
Emily Wong
Marketing Director
GreenSpace Solutions
        """,
        "sender": {"email": "emily.wong@greenspace.com", "name": "Emily Wong"},
        "recipients": [{"email": "proposals@designfirm.com", "name": "Design Firm"}],
        "timestamp": (datetime.now() - timedelta(days=5)).isoformat()
    }
]

async def generate_and_analyze_test_emails(db: Session):
    """Generate and analyze test emails, storing results in the database."""
    print(f"Generating and analyzing {len(TEST_EMAILS)} test emails...")
    
    for i, email_data in enumerate(TEST_EMAILS):
        print(f"\nProcessing email {i+1}/{len(TEST_EMAILS)}: {email_data['subject']}")
        
        # Create email instance
        email = Email(
            id=i+1,  # Simple sequential ID for tests
            user_id=1,  # Assuming user ID 1 for testing
            subject=email_data["subject"],
            content=email_data["content"],
            sender=email_data["sender"],
            recipient=email_data["recipients"][0] if email_data["recipients"] else {"email": "me@example.com", "name": "Me"},
            timestamp=datetime.fromisoformat(email_data["timestamp"]),
            is_read=False,
            is_processed=False,
            is_archived=False,
            is_deleted=False
        )
        
        # Build full email text
        full_email_text = f"Subject: {email_data['subject']}\n\n{email_data['content']}"
        
        try:
            # Get AI analysis using ASTI
            print(f"  Analyzing with OpenAI...")
            ai_analysis = await get_email_summary_and_suggestion(full_email_text)
            
            # Generate embedding
            print(f"  Generating embedding...")
            embedding = await generate_embedding(full_email_text)
            
            # Create memory ID for vector storage
            memory_id = str(uuid.uuid4())
            
            # Store in vector memory
            print(f"  Storing in vector memory...")
            memory_metadata = {
                "email_id": f"test-email-{i+1}",
                "subject": email_data["subject"],
                "sender": email_data["sender"],
                "received_at": email_data["timestamp"],
                "emotional_tone": ai_analysis.get("emotional_tone", "unknown"),
                "stress_level": ai_analysis.get("stress_level", "MEDIUM"),
                "needs_immediate_attention": ai_analysis.get("needs_immediate_attention", False),
                "summary": ai_analysis.get("summary", "")
            }
            
            await add_memory(
                full_email_text,
                memory_metadata,
                "test-user-1",  # Use a consistent test user ID
                "email",
                0.7  # Default importance
            )
            
            # Update email with AI analysis
            email.is_processed = True
            email.ai_summary = ai_analysis.get("summary")
            email.ai_emotional_tone = ai_analysis.get("emotional_tone")
            email.ai_suggested_action = ai_analysis.get("suggested_actions")
            email.embedding_id = memory_id
            email.stress_level = ai_analysis.get("stress_level")
            email.priority = "HIGH" if "URGENT" in email_data["subject"].upper() else "MEDIUM"
            email.summary = ai_analysis.get("summary")
            
            # Create detailed email analysis
            analysis = EmailAnalysis(
                email_id=email.id,
                stress_level=ai_analysis.get("stress_level", "MEDIUM"),
                priority=email.priority,
                sentiment_score=random.uniform(-0.8, 0.8),  # Random sentiment for testing
                summary=ai_analysis.get("summary", ""),
                action_items=ai_analysis.get("suggested_actions", []),
                action_required=len(ai_analysis.get("suggested_actions", [])) > 0,
                explanation="AI-generated analysis",
                timestamp=datetime.now(),
                emotional_tone=ai_analysis.get("emotional_tone"),
                explicit_expectations=ai_analysis.get("explicit_expectations", []),
                implicit_expectations=ai_analysis.get("implicit_expectations", []),
                suggested_actions=ai_analysis.get("suggested_actions", []),
                suggested_response=ai_analysis.get("suggested_response"),
                needs_immediate_attention=ai_analysis.get("needs_immediate_attention", False),
                embedding_vector_id=memory_id
            )
            
            # Add to database
            db.add(email)
            db.add(analysis)
            db.commit()
            
            print(f"  Successfully processed and stored email: {email_data['subject']}")
            print(f"  Summary: {ai_analysis.get('summary')[:100]}...")
            print(f"  Emotional tone: {ai_analysis.get('emotional_tone')}")
            print(f"  Stress level: {ai_analysis.get('stress_level')}")
            
        except Exception as e:
            db.rollback()
            print(f"  ERROR processing email {i+1}: {str(e)}")
            logger.error(f"Error processing test email {i+1}: {str(e)}")
    
    print("\nTest email generation complete!")
    print(f"Generated {len(TEST_EMAILS)} emails with AI analysis")

async def main():
    """Main function to generate test emails."""
    print("=== ASTI Test Email Generator ===\n")
    
    # Check for OpenAI API key
    from backend.config import settings
    if not hasattr(settings, "OPENAI_API_KEY") or not settings.OPENAI_API_KEY:
        print("ERROR: OPENAI_API_KEY is not set in the .env file")
        return
    
    print(f"OpenAI API Key found: {settings.OPENAI_API_KEY[:5]}***{settings.OPENAI_API_KEY[-4:]}")
    
    # Get database session
    db = next(get_db())
    try:
        await generate_and_analyze_test_emails(db)
    finally:
        db.close()
    
    print("\n=== Test Email Generation Completed ===")

if __name__ == "__main__":
    asyncio.run(main()) 