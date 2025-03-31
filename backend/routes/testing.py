from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models.user import User
from backend.models.testing import TestScenario, TestFeedback
from backend.auth.security import get_optional_current_user
from sqlalchemy import func
import uuid
import random
import json
import logging
from backend.services.openai_service import get_email_summary_and_suggestion

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/testing", tags=["testing"])

# Store mock email data in-memory since this is just for testing
MOCK_EMAILS = {}

# Mock email templates
MOCK_EMAIL_TEMPLATES = [
    {
        "subject": "Project deadline update - URGENT",
        "content": """
Dear {{name}},

I'm writing to inform you that our client has requested an earlier delivery date for the project. We now need to have all deliverables ready by next Friday instead of the end of the month.

This change will require us to reprioritize our tasks and possibly work some extra hours this week. I understand this is a significant shift in our timeline, and I apologize for the short notice.

Could you please review your assigned tasks and let me know by tomorrow if you foresee any blockers that would prevent you from meeting this new deadline? We'll have an emergency team meeting tomorrow at 2 PM to discuss the plan.

Thank you for your flexibility,
Project Manager
""",
        "sender": {"name": "Alex Morgan", "email": "alex.morgan@company.com"},
        "priority": "HIGH",
        "stress_level": "HIGH"
    },
    {
        "subject": "Team lunch next week",
        "content": """
Hi {{name}},

I hope you've been having a good week! I wanted to organize a team lunch for next Thursday to celebrate the successful launch of our new feature.

We're thinking of trying that new Italian place down the street. Would you be available to join us around 12:30 PM? It should be a nice break from our usual routine.

No pressure if you can't make it, but we'd love to have you there!

Best wishes,
Team Coordinator
""",
        "sender": {"name": "Sam Johnson", "email": "sam.johnson@company.com"},
        "priority": "LOW",
        "stress_level": "LOW"
    },
    {
        "subject": "Quarterly review feedback",
        "content": """
Hello {{name}},

I've completed your quarterly performance review based on our discussion last week and the team's feedback.

Overall, your performance has been good, with particularly strong results in customer satisfaction and problem-solving. There are a few areas for improvement, particularly around documentation and meeting deadlines.

I've attached the full review document for your reference. Please review it and let me know if you have any questions or concerns. We should schedule a follow-up meeting next week to discuss your goals for the next quarter.

Regards,
Your Manager
""",
        "sender": {"name": "Jordan Smith", "email": "jordan.smith@company.com"},
        "priority": "MEDIUM",
        "stress_level": "MEDIUM"
    },
    {
        "subject": "Request for presentation at client meeting",
        "content": """
{{name}},

We have an important client meeting next Tuesday with Acme Corp. They're interested in our new analytics solution, and I think you would be the perfect person to present the technical aspects.

The meeting is scheduled for 10 AM to 12 PM, and you would need about 20 minutes to cover your part. Can you prepare a brief overview of the system architecture and key features?

This client is potentially a big account for us, so we need to make a strong impression. Let me know if you need any resources or support for your presentation.

Thanks,
Sales Director
""",
        "sender": {"name": "Taylor Wilson", "email": "taylor.wilson@company.com"},
        "priority": "HIGH",
        "stress_level": "MEDIUM"
    },
    {
        "subject": "Invitation: Annual company retreat",
        "content": """
Dear {{name}},

I'm pleased to announce our annual company retreat will be held from September 15-17 at Mountain View Resort.

This is a great opportunity to connect with colleagues, participate in team-building activities, and enjoy some relaxation. The agenda includes workshops, outdoor activities, and evening social events.

Please complete the registration form by August 15th to confirm your attendance. If you have any dietary restrictions or special accommodations, please note them on the form.

Looking forward to seeing you there!

Best regards,
HR Team
""",
        "sender": {"name": "HR Department", "email": "hr@company.com"},
        "priority": "LOW",
        "stress_level": "LOW"
    }
]

@router.get("/progress")
async def get_testing_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Dict:
    """Get user testing progress and metrics"""
    # Get completed scenarios
    completed_scenarios = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id,
        TestScenario.completed == True
    ).count()

    # Get feedback metrics
    feedback = db.query(TestFeedback).filter(
        TestFeedback.user_id == current_user.id
    ).all()

    # Calculate metrics
    total_feedback = len(feedback)
    issues_reported = len([f for f in feedback if f.is_issue])
    ratings = [f.rating for f in feedback if f.rating is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return {
        "totalScenarios": 6,  # Total number of test scenarios
        "completedScenarios": completed_scenarios,
        "feedbackCount": total_feedback,
        "issuesReported": issues_reported,
        "averageRating": avg_rating
    }

@router.post("/complete")
async def mark_scenario_complete(
    scenario_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    """Mark a test scenario as completed"""
    scenario = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id,
        TestScenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        scenario = TestScenario(
            user_id=current_user.id,
            scenario_id=scenario_id,
            completed=True,
            completion_date=datetime.utcnow()
        )
        db.add(scenario)
    else:
        scenario.completed = True
        scenario.completion_date = datetime.utcnow()

    db.commit()
    return {"status": "success", "message": "Scenario marked as complete"}

@router.post("/feedback")
async def submit_test_feedback(
    feedback_data: Dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    """Submit feedback for a test scenario"""
    feedback = TestFeedback(
        user_id=current_user.id,
        scenario_id=feedback_data["scenarioId"],
        feedback_text=feedback_data["feedback"],
        is_issue="issue" in feedback_data["feedback"].lower(),
        submission_date=datetime.utcnow()
    )
    
    db.add(feedback)
    db.commit()
    
    return {"status": "success", "message": "Feedback submitted successfully"}

@router.get("/summary")
async def get_testing_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Dict:
    """Get summary of all testing data"""
    # Get scenario completion stats
    scenarios = db.query(TestScenario).filter(
        TestScenario.user_id == current_user.id
    ).all()
    
    # Get feedback stats
    feedback = db.query(TestFeedback).filter(
        TestFeedback.user_id == current_user.id
    ).all()
    
    # Organize feedback by scenario
    feedback_by_scenario = {}
    for f in feedback:
        if f.scenario_id not in feedback_by_scenario:
            feedback_by_scenario[f.scenario_id] = []
        feedback_by_scenario[f.scenario_id].append({
            "text": f.feedback_text,
            "is_issue": f.is_issue,
            "date": f.submission_date.isoformat()
        })
    
    return {
        "scenarios": [
            {
                "id": s.scenario_id,
                "completed": s.completed,
                "completion_date": s.completion_date.isoformat() if s.completion_date else None,
                "feedback": feedback_by_scenario.get(s.scenario_id, [])
            }
            for s in scenarios
        ],
        "total_feedback": len(feedback),
        "completion_rate": len([s for s in scenarios if s.completed]) / 6 * 100
    }

@router.get("/mock-emails", response_model=List[Dict])
async def get_mock_emails(
    user_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get all mock emails for testing the AI email analysis.
    
    This endpoint returns previously processed mock emails stored in memory,
    simulating a user's inbox with AI-analyzed content.
    """
    # For testing purposes, use a default user ID if no user is authenticated
    user_id = str(current_user.id) if current_user else "test_user_id"
    
    if user_id not in MOCK_EMAILS:
        MOCK_EMAILS[user_id] = []
        
    return MOCK_EMAILS[user_id]

@router.post("/simulate-new-emails")
async def simulate_new_emails(
    background_tasks: BackgroundTasks,
    count: int = 1,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Simulate receiving new emails and process them with AI.
    
    This endpoint generates random mock emails, processes them with the
    OpenAI API, and adds them to the user's mock inbox. It simulates
    the real-world flow of receiving and analyzing new emails.
    """
    # For testing purposes, use a default user ID if no user is authenticated
    user_id = str(current_user.id) if current_user else "test_user_id"
    user_name = current_user.full_name if current_user and hasattr(current_user, "full_name") else "Test User"
    
    if user_id not in MOCK_EMAILS:
        MOCK_EMAILS[user_id] = []
    
    # Generate random emails in the background to avoid blocking the request
    background_tasks.add_task(
        generate_and_process_emails, 
        user_id, 
        count, 
        user_name
    )
    
    return {
        "status": "processing", 
        "message": f"Generating {count} new mock emails. Check /testing/mock-emails in a few seconds."
    }

@router.post("/respond-to-email")
async def respond_to_email(
    email_id: str,
    action: str,  # "reply", "defer", "delete", "mark_read"
    response_content: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Respond to a mock email using one of the available actions.
    
    This endpoint allows the user to interact with mock emails by
    replying, deferring, deleting, or marking them as read.
    """
    # For testing purposes, use a default user ID if no user is authenticated
    user_id = str(current_user.id) if current_user else "test_user_id"
    
    if user_id not in MOCK_EMAILS:
        raise HTTPException(status_code=404, detail="No mock emails found for this user")
    
    # Find the email by ID
    email_index = None
    for i, email in enumerate(MOCK_EMAILS[user_id]):
        if email.get("id") == email_id:
            email_index = i
            break
    
    if email_index is None:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Process the action
    email = MOCK_EMAILS[user_id][email_index]
    
    if action == "reply":
        # Simulate sending a reply
        if not response_content:
            raise HTTPException(status_code=400, detail="Response content is required for replies")
        
        email["replied"] = True
        email["reply_content"] = response_content
        email["reply_time"] = datetime.utcnow().isoformat()
        
    elif action == "defer":
        # Defer the email for later
        email["deferred"] = True
        email["defer_time"] = datetime.utcnow().isoformat()
        
    elif action == "delete":
        # Delete the email
        MOCK_EMAILS[user_id].pop(email_index)
        return {"status": "success", "message": "Email deleted"}
        
    elif action == "mark_read":
        # Mark the email as read
        email["is_read"] = True
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
    
    # Update the email in the list
    MOCK_EMAILS[user_id][email_index] = email
    
    return {
        "status": "success", 
        "message": f"Email {action} successfully", 
        "email": email
    }

@router.post("/clear-mock-emails")
async def clear_mock_emails(current_user: Optional[User] = Depends(get_optional_current_user)):
    """Clear all mock emails for the current user"""
    # For testing purposes, use a default user ID if no user is authenticated
    user_id = str(current_user.id) if current_user else "test_user_id"
    
    if user_id in MOCK_EMAILS:
        MOCK_EMAILS[user_id] = []
    
    return {"status": "success", "message": "All mock emails cleared"}

async def generate_and_process_emails(user_id: str, count: int, user_name: str):
    """
    Generate and process mock emails with AI analysis.
    
    This function creates random emails from templates, processes them
    with the OpenAI API, and adds them to the user's mock inbox.
    """
    for _ in range(count):
        # Select a random email template
        template = random.choice(MOCK_EMAIL_TEMPLATES)
        
        # Generate a unique ID for this email
        email_id = str(uuid.uuid4())
        
        # Personalize the content
        content = template["content"].replace("{{name}}", user_name)
        
        # Create the email object
        email = {
            "id": email_id,
            "subject": template["subject"],
            "content": content,
            "sender": template["sender"],
            "recipient": {"name": user_name, "email": f"{user_name.lower().replace(' ', '.')}@example.com"},
            "timestamp": datetime.utcnow().isoformat(),
            "is_read": False,
            "category": "inbox",
            "stress_level": template["stress_level"],
            "priority": template["priority"],
        }
        
        # Process with OpenAI
        try:
            # Create context for AI analysis
            context = {
                "stress_sensitivity": "MEDIUM",
                "communication_preferences": "CLEAR",
                "action_item_detail": "HIGH",
                "use_advanced_model": True
            }
            
            # Build the full email text
            full_email_text = f"Subject: {email['subject']}\n\n{email['content']}"
            
            # Get AI analysis
            analysis = await get_email_summary_and_suggestion(full_email_text, context)
            
            # Add the AI analysis to the email
            email["ai_summary"] = analysis.get("summary")
            email["ai_emotional_tone"] = analysis.get("emotional_tone")
            email["ai_suggested_action"] = analysis.get("suggested_actions", [])
            email["explicit_expectations"] = analysis.get("explicit_expectations", [])
            email["implicit_expectations"] = analysis.get("implicit_expectations", [])
            email["needs_immediate_attention"] = analysis.get("needs_immediate_attention", False)
            email["suggested_response"] = analysis.get("suggested_response")
            
        except Exception as e:
            # If AI analysis fails, add basic metadata
            print(f"Error processing email with AI: {str(e)}")
            email["ai_summary"] = "AI analysis unavailable"
            email["ai_emotional_tone"] = "unknown"
            email["ai_suggested_action"] = []
        
        # Add the email to the user's inbox
        MOCK_EMAILS[user_id].append(email) 

@router.get("/test-route")
async def test_route():
    """Simple test route to check if API is accessible"""
    try:
        # Add more detailed info for debugging
        return {
            "message": "Testing API is working", 
            "status": "OK",
            "timestamp": datetime.now().isoformat(),
            "route": "/api/testing/test-route"
        }
    except Exception as e:
        logger.error(f"Error in test route: {str(e)}")
        raise HTTPException(status_code=500, detail=f"API test route error: {str(e)}")

# Brain Viewer API Routes
@router.get("/brain/vector-entries")
async def get_vector_memory_entries(
    limit: int = 20,
    email_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get vector memory entries for visualization
    
    Returns recent vector embeddings from ChromaDB with metadata and similarity scores
    """
    try:
        # For demo, return mock data - in production would connect to ChromaDB
        user_id = str(current_user.id) if current_user else "test_user_id"
        
        # Make sure MOCK_EMAILS is initialized for this user
        if user_id not in MOCK_EMAILS:
            MOCK_EMAILS[user_id] = []
        
        # If email_id provided, return vectors related to that email
        if email_id:
            # Filter mock emails for this email
            target_email = None
            for email in MOCK_EMAILS.get(user_id, []):
                if str(email["id"]) == email_id:
                    target_email = email
                    break
            
            if not target_email:
                return {"entries": [], "count": 0, "message": "Email not found"}
                
            # Create mock vector entries for this email
            vector_entries = [
                {
                    "id": f"{email_id}_subject",
                    "text": target_email["subject"],
                    "type": "email_subject",
                    "embedding_model": "text-embedding-3-small",
                    "timestamp": target_email["timestamp"],
                    "metadata": {
                        "email_id": email_id,
                        "source": "subject",
                        "importance": "high"
                    },
                    "similarity_score": 0.92
                },
                {
                    "id": f"{email_id}_content",
                    "text": target_email["content"][:100] + "...",
                    "type": "email_content",
                    "embedding_model": "text-embedding-3-small",
                    "timestamp": target_email["timestamp"],
                    "metadata": {
                        "email_id": email_id,
                        "source": "content",
                        "importance": "medium"
                    },
                    "similarity_score": 0.85
                },
                {
                    "id": f"{email_id}_summary",
                    "text": target_email.get("ai_summary", "No summary available"),
                    "type": "email_summary",
                    "embedding_model": "text-embedding-3-small",
                    "timestamp": target_email["timestamp"],
                    "metadata": {
                        "email_id": email_id,
                        "source": "ai_summary",
                        "importance": "high"
                    },
                    "similarity_score": 0.95
                }
            ]
            
            return {"entries": vector_entries, "count": len(vector_entries)}
            
        # Otherwise return general vectors for all recent emails
        all_entries = []
        
        # Generate fallback entries if no emails exist
        if not MOCK_EMAILS.get(user_id, []):
            all_entries = [
                {
                    "id": f"demo_entry_{i}",
                    "text": f"Example vector entry #{i+1}",
                    "type": "email_summary",
                    "embedding_model": "text-embedding-3-small",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "source": "demo_data",
                        "importance": "medium"
                    },
                    "similarity_score": random.uniform(0.8, 0.99)
                } for i in range(3)
            ]
            return {"entries": all_entries, "count": len(all_entries)}
        
        # Process real emails if they exist
        for email in MOCK_EMAILS.get(user_id, [])[:limit]:
            all_entries.append({
                "id": f"{email['id']}_summary",
                "text": email.get("ai_summary", "No summary available"),
                "type": "email_summary",
                "embedding_model": "text-embedding-3-small",
                "timestamp": email["timestamp"],
                "metadata": {
                    "email_id": str(email["id"]),
                    "source": "ai_summary"
                },
                "similarity_score": random.uniform(0.8, 0.99)
            })
        
        return {"entries": all_entries, "count": len(all_entries)}
    except Exception as e:
        logger.error(f"Error fetching vector entries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching vector entries: {str(e)}")

@router.get("/brain/graph-data")
async def get_knowledge_graph_data(
    email_id: Optional[str] = None,
    node_type: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get knowledge graph nodes and relationships for visualization
    
    Returns nodes and edges that can be visualized in a graph UI
    """
    try:
        user_id = str(current_user.id) if current_user else "test_user_id"
        
        # Make sure MOCK_EMAILS is initialized for this user
        if user_id not in MOCK_EMAILS:
            MOCK_EMAILS[user_id] = []
            
        # Generate mock graph data based on available emails
        nodes = []
        edges = []
        
        # Create user node as central hub
        user_node = {
            "id": "user_node",
            "label": "Current User",
            "type": "USER",
            "properties": {
                "name": "Test User",
                "email": "test@example.com"
            }
        }
        nodes.append(user_node)
        
        # If specific email is requested, create detailed graph for just that email
        if email_id:
            target_email = None
            for email in MOCK_EMAILS.get(user_id, []):
                if str(email["id"]) == email_id:
                    target_email = email
                    break
                    
            if not target_email:
                # Return empty data with user node only
                return {"nodes": nodes, "edges": [], "count": {"nodes": 1, "edges": 0}, "message": "Email not found"}
            
            # Create email node
            email_node = {
                "id": email_id,
                "label": target_email["subject"],
                "type": "EMAIL",
                "properties": {
                    "subject": target_email["subject"],
                    "sender": target_email["sender"]["email"],
                    "timestamp": target_email["timestamp"],
                    "priority": target_email["priority"]
                }
            }
            nodes.append(email_node)
            
            # Create sender node
            sender_id = f"person_{target_email['sender']['email'].replace('@', '_').replace('.', '_')}"
            sender_node = {
                "id": sender_id,
                "label": target_email["sender"]["name"],
                "type": "PERSON",
                "properties": {
                    "name": target_email["sender"]["name"],
                    "email": target_email["sender"]["email"],
                    "interaction_count": random.randint(1, 10)
                }
            }
            nodes.append(sender_node)
            
            # Create edges
            edges.append({
                "id": f"sent_{email_id}",
                "source": sender_id,
                "target": email_id,
                "label": "SENT",
                "properties": {
                    "timestamp": target_email["timestamp"]
                }
            })
            
            edges.append({
                "id": f"received_{email_id}",
                "source": email_id,
                "target": "user_node",
                "label": "RECEIVED_BY",
                "properties": {
                    "timestamp": target_email["timestamp"]
                }
            })
            
            # If we have action items, create task nodes
            if target_email.get("action_items"):
                for i, action in enumerate(target_email["action_items"]):
                    task_id = f"task_{email_id}_{i}"
                    task_node = {
                        "id": task_id,
                        "label": action.get('description', 'Task') if isinstance(action, dict) else action,
                        "type": "TASK",
                        "properties": {
                            "description": action.get('description', 'Task') if isinstance(action, dict) else action,
                            "status": "pending",
                            "created_at": target_email["timestamp"]
                        }
                    }
                    nodes.append(task_node)
                    
                    edges.append({
                        "id": f"has_task_{email_id}_{i}",
                        "source": email_id,
                        "target": task_id,
                        "label": "HAS_TASK",
                        "properties": {
                            "extracted_by": "ASTI_AI"
                        }
                    })
        else:
            # If no emails are available, add demo nodes
            if not MOCK_EMAILS.get(user_id, []):
                # Add example nodes for demonstration
                nodes.append({
                    "id": "demo_email_1",
                    "label": "Example Project Update",
                    "type": "EMAIL",
                    "properties": {
                        "subject": "Example Project Update",
                        "sender": "colleague@example.com",
                        "timestamp": datetime.now().isoformat(),
                        "priority": "MEDIUM"
                    }
                })
                
                nodes.append({
                    "id": "demo_person_1",
                    "label": "Example Colleague",
                    "type": "PERSON",
                    "properties": {
                        "name": "Example Colleague",
                        "email": "colleague@example.com"
                    }
                })
                
                # Add example edges
                edges.append({
                    "id": "demo_sent_1",
                    "source": "demo_person_1",
                    "target": "demo_email_1",
                    "label": "SENT",
                    "properties": {
                        "timestamp": datetime.now().isoformat()
                    }
                })
                
                edges.append({
                    "id": "demo_received_1",
                    "source": "demo_email_1",
                    "target": "user_node",
                    "label": "RECEIVED_BY",
                    "properties": {
                        "timestamp": datetime.now().isoformat()
                    }
                })
                
                return {
                    "nodes": nodes,
                    "edges": edges,
                    "count": {
                        "nodes": len(nodes),
                        "edges": len(edges)
                    }
                }
            
            # Create simplified graph with all emails
            for email in MOCK_EMAILS.get(user_id, [])[:10]:  # Limit to 10 most recent
                # Create email node
                email_node = {
                    "id": str(email["id"]),
                    "label": email["subject"],
                    "type": "EMAIL",
                    "properties": {
                        "subject": email["subject"],
                        "sender": email["sender"]["email"],
                        "timestamp": email["timestamp"],
                        "priority": email["priority"]
                    }
                }
                nodes.append(email_node)
                
                # Create edge to user
                edges.append({
                    "id": f"received_{email['id']}",
                    "source": str(email["id"]),
                    "target": "user_node",
                    "label": "RECEIVED_BY",
                    "properties": {
                        "timestamp": email["timestamp"]
                    }
                })
                
                # If node_type filter is applied, only return that type
                if node_type and email_node["type"] != node_type:
                    nodes.pop()
                    edges.pop()
        
        return {
            "nodes": nodes,
            "edges": edges,
            "count": {
                "nodes": len(nodes),
                "edges": len(edges)
            }
        }
    except Exception as e:
        logger.error(f"Error fetching graph data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching graph data: {str(e)}")

@router.get("/brain/ai-process/{email_id}")
async def get_ai_process_data(
    email_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get the AI processing steps for a specific email
    
    Returns the full chain of AI logic, prompts, and outputs for transparency
    """
    try:
        user_id = str(current_user.id) if current_user else "test_user_id"
        
        # Make sure MOCK_EMAILS is initialized for this user
        if user_id not in MOCK_EMAILS:
            MOCK_EMAILS[user_id] = []
            
        # Find the target email
        target_email = None
        for email in MOCK_EMAILS.get(user_id, []):
            if str(email["id"]) == email_id:
                target_email = email
                break
                
        if not target_email:
            # If email not found, create a demo response
            if not MOCK_EMAILS.get(user_id, []):
                # Generate a demo process
                steps = [
                    {
                        "step": 1,
                        "name": "Initial Analysis (Demo)",
                        "description": "This is a demo of the AI processing pipeline",
                        "input": "Example email content",
                        "output": "Extracted key information including priority and expectations",
                        "tokens_used": 75,
                        "model": "gpt-4-0125-preview"
                    },
                    {
                        "step": 2,
                        "name": "Summarization (Demo)",
                        "description": "Creating a concise summary of the email",
                        "input": "Summarize the demo email content",
                        "output": "This is a demo email showing how AI analyzes content.",
                        "tokens_used": 160,
                        "model": "gpt-4-0125-preview"
                    },
                ]
                total_tokens = sum(step["tokens_used"] for step in steps)
                
                return {
                    "email_id": "demo",
                    "process_id": f"process_demo_{int(datetime.now().timestamp())}",
                    "timestamp": datetime.now().isoformat(),
                    "steps": steps,
                    "metrics": {
                        "total_tokens": total_tokens,
                        "total_steps": len(steps),
                        "estimated_cost": round(total_tokens * 0.00001, 5),
                        "processing_time_ms": 850
                    },
                    "is_demo": True
                }
            else:
                raise HTTPException(status_code=404, detail=f"Email with ID {email_id} not found")
        
        # Mock AI processing steps based on actual email
        ai_steps = [
            {
                "step": 1,
                "name": "Initial Analysis",
                "description": "Analyzing email content and extracting key information",
                "input": target_email["content"],
                "output": "Extracted key information including priority, sentiment, and expectations",
                "tokens_used": random.randint(50, 150),
                "model": "gpt-4-0125-preview"
            },
            {
                "step": 2,
                "name": "Summarization",
                "description": "Creating a concise summary of the email",
                "input": "Summarize the following email content",
                "output": target_email.get("ai_summary", "Email summary not available"),
                "tokens_used": random.randint(150, 300),
                "model": "gpt-4-0125-preview"
            },
            {
                "step": 3,
                "name": "Action Item Extraction",
                "description": "Identifying actionable items from the email",
                "input": "Extract action items from the email",
                "output": ", ".join([item.get('description', str(item)) if isinstance(item, dict) else str(item) 
                                   for item in target_email.get("action_items", ["No action items found"])]),
                "tokens_used": random.randint(100, 200),
                "model": "gpt-4-0125-preview"
            },
            {
                "step": 4,
                "name": "Vector Embedding",
                "description": "Creating vector embeddings for semantic search",
                "input": f"{target_email['subject']}: {target_email['content'][:100]}...",
                "output": "1536-dimensional vector created successfully",
                "tokens_used": random.randint(50, 100),
                "model": "text-embedding-3-small"
            },
            {
                "step": 5,
                "name": "Response Generation",
                "description": "Generating suggested response options",
                "input": "Generate a response to this email",
                "output": target_email.get("suggested_response", "No suggested response available"),
                "tokens_used": random.randint(200, 400),
                "model": "gpt-4-0125-preview"
            }
        ]
        
        # Calculate totals
        total_tokens = sum(step["tokens_used"] for step in ai_steps)
        estimated_cost = round(total_tokens * 0.00001, 5)  # Approximate cost calculation
        
        return {
            "email_id": email_id,
            "process_id": f"process_{email_id}_{int(datetime.now().timestamp())}",
            "timestamp": datetime.now().isoformat(),
            "steps": ai_steps,
            "metrics": {
                "total_tokens": total_tokens,
                "total_steps": len(ai_steps),
                "estimated_cost": estimated_cost,
                "processing_time_ms": random.randint(500, 2000)
            }
        }
    except Exception as e:
        logger.error(f"Error fetching AI process data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching AI process data: {str(e)}") 