from typing import Dict, List, Optional, Any, Union
import json
import uuid
from datetime import datetime, timedelta

from backend.models.knowledge_graph import (
    Node, 
    Edge, 
    NodeType, 
    EdgeType,
    UserProfileNode,
    EmailNode,
    CalendarEventNode,
    TaskNode,
    EmotionStateNode,
    RelationshipNode
)
from backend.services.vector_memory import vector_memory, recall_relevant_context, add_memory
from backend.services.knowledge_graph import knowledge_graph_service
from backend.utils.logger import logger
from backend.services.openai_service import analyze_content


class ASTIBrain:
    """
    ASTI's brain - integrates knowledge graph and vector memory for context-aware reasoning.
    This is the core intelligence of the system that powers all context-aware assistance.
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    async def process_email(self, email_content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process a new email and integrate it into ASTI's knowledge"""
        try:
            # 1. Analyze email content
            analysis = await analyze_content(email_content)
            
            # 2. Create email node
            email_node = EmailNode(
                id=f"email-{str(uuid.uuid4())}",
                properties={
                    "content": email_content,
                    "subject": metadata.get("subject", ""),
                    "sender": metadata.get("sender", {}),
                    "recipients": metadata.get("recipients", []),
                    "timestamp": metadata.get("timestamp", datetime.utcnow().isoformat()),
                    "stress_level": analysis.get("stress_level", "MEDIUM"),
                    "priority": analysis.get("priority", "MEDIUM"),
                    "sentiment_score": analysis.get("sentiment_score", 0.5),
                    "summary": analysis.get("summary", ""),
                    "action_items": analysis.get("action_items", [])
                }
            )
            
            # 3. Store in knowledge graph
            await knowledge_graph_service.create_node(email_node)
            
            # 4. Connect to related entities
            await self._connect_email_to_entities(email_node, analysis)
            
            # 5. Store in vector memory
            await add_memory(
                content=email_content,
                metadata={
                    "type": "email",
                    "id": email_node.id,
                    "subject": metadata.get("subject", ""),
                    "sender": metadata.get("sender", {}),
                    "stress_level": analysis.get("stress_level", "MEDIUM"),
                    "priority": analysis.get("priority", "MEDIUM")
                }
            )
            
            return {
                "email_id": email_node.id,
                "analysis": analysis,
                "status": "processed"
            }
            
        except Exception as e:
            logger.error(f"Failed to process email: {str(e)}")
            raise
    
    async def _connect_email_to_entities(self, email_node: EmailNode, analysis: Dict[str, Any]) -> None:
        """Connect email to relevant entities in the knowledge graph"""
        try:
            # 1. Connect to sender
            sender_email = email_node.properties.get("sender", {}).get("email", "")
            if sender_email:
                # Find or create relationship node for sender
                sender_node = await self._get_or_create_relationship_node(sender_email)
                if sender_node:
                    edge = Edge(
                        id=f"edge-{str(uuid.uuid4())}",
                        type=EdgeType.SENT_BY,
                        source_id=email_node.id,
                        target_id=sender_node.id,
                        properties={
                            "timestamp": email_node.properties.get("timestamp", datetime.utcnow().isoformat())
                        }
                    )
                    await knowledge_graph_service.create_edge(edge)
            
            # 2. Create and connect task nodes for action items
            action_items = analysis.get("action_items", [])
            for action in action_items:
                task_node = TaskNode(
                    id=f"task-{str(uuid.uuid4())}",
                    properties={
                        "title": action,
                        "description": f"Task from email: {email_node.properties.get('subject')}",
                        "status": "not_started",
                        "priority": analysis.get("priority", "MEDIUM"),
                        "source": "email",
                        "source_id": email_node.id
                    }
                )
                await knowledge_graph_service.create_node(task_node)
                
                # Connect task to email
                edge = Edge(
                    id=f"edge-{str(uuid.uuid4())}",
                    type=EdgeType.PART_OF,
                    source_id=task_node.id,
                    target_id=email_node.id,
                    properties={
                        "created_at": datetime.utcnow().isoformat()
                    }
                )
                await knowledge_graph_service.create_edge(edge)
            
            # 3. Update emotion state based on email
            await self._update_emotion_state([email_node])
            
        except Exception as e:
            logger.error(f"Failed to connect email to entities: {str(e)}")
            raise
    
    async def _get_or_create_relationship_node(self, email: str) -> Optional[Node]:
        """Find or create a relationship node for an email address"""
        try:
            # Try to find existing relationship node
            query = """
            MATCH (n:RELATIONSHIP)
            WHERE n.properties.email = $email
            RETURN n
            """
            
            result = await knowledge_graph_service.get_related_nodes(
                node_id="",  # Empty to search all nodes
                relationship_types=["RELATIONSHIP"]
            )
            
            for node in result:
                if node.properties.get("email") == email:
                    return node
            
            # Create new relationship node if not found
            relationship_node = RelationshipNode(
                id=f"rel-{str(uuid.uuid4())}",
                properties={
                    "email": email,
                    "type": "email_contact",
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            
            await knowledge_graph_service.create_node(relationship_node)
            return relationship_node
            
        except Exception as e:
            logger.error(f"Failed to get/create relationship node: {str(e)}")
            return None
    
    async def _update_emotion_state(self, new_nodes: List[Node]) -> None:
        """Update the user's emotional state based on new information"""
        try:
            # Get or create emotion state node
            emotion_states = await knowledge_graph_service.get_related_nodes(
                node_id="",  # Empty to search all nodes
                relationship_types=["EMOTION_STATE"]
            )
            
            emotion_node = None
            if emotion_states:
                # Use the most recent emotion state
                emotion_node = max(emotion_states, key=lambda n: n.updated_at)
            else:
                # Create a new emotion state
                emotion_node = EmotionStateNode(
                    id=f"emotion-{str(uuid.uuid4())}",
                    properties={
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                await knowledge_graph_service.create_node(emotion_node)
            
            # Update emotion state based on new nodes
            stress_count = 0
            for node in new_nodes:
                if node.type == NodeType.EMAIL and node.properties.get("stress_level") == "HIGH":
                    stress_count += 1
                    
                    # Connect stress-inducing email to emotion
                    edge = Edge(
                        id=f"edge-{str(uuid.uuid4())}",
                        type=EdgeType.CAUSES,
                        source_id=node.id,
                        target_id=emotion_node.id,
                        properties={
                            "factor": "email_stress",
                            "weight": 0.8 if node.properties.get("priority") == "HIGH" else 0.5
                        }
                    )
                    await knowledge_graph_service.create_edge(edge)
            
            # Update overall stress level
            if stress_count > 2:
                emotion_node.properties["overall_stress"] = "HIGH"
                emotion_node.properties["needs_support"] = True
            elif stress_count > 0:
                emotion_node.properties["overall_stress"] = "MEDIUM"
            
            await knowledge_graph_service.update_node(emotion_node)
            
        except Exception as e:
            logger.error(f"Failed to update emotion state: {str(e)}")
            raise
    
    async def get_email_context(self, email_id: str) -> Dict[str, Any]:
        """Get context for an email including related entities and emotional state"""
        try:
            # 1. Get the email node
            email_node = await knowledge_graph_service.get_node(email_id)
            if not email_node:
                raise ValueError(f"Email node not found: {email_id}")
            
            # 2. Get related entities
            related_nodes = await knowledge_graph_service.get_related_nodes(email_id)
            
            # 3. Get current emotion state
            emotion_states = await knowledge_graph_service.get_related_nodes(
                node_id="",  # Empty to search all nodes
                relationship_types=["EMOTION_STATE"]
            )
            current_emotion = max(emotion_states, key=lambda n: n.updated_at) if emotion_states else None
            
            # 4. Get vector memory context
            vector_context = await recall_relevant_context(email_node.properties.get("content", ""))
            
            return {
                "email": email_node.properties,
                "related_entities": [node.properties for node in related_nodes],
                "emotion_state": current_emotion.properties if current_emotion else None,
                "vector_context": vector_context
            }
            
        except Exception as e:
            logger.error(f"Failed to get email context: {str(e)}")
            raise
    
    async def generate_reply_options(self, email_id: str) -> Dict[str, Any]:
        """Generate reply options for an email"""
        try:
            # 1. Get email context
            context = await self.get_email_context(email_id)
            
            # 2. Generate reply options using OpenAI
            reply_options = await analyze_content(
                context["email"]["content"],
                context={
                    "type": "generate_reply",
                    "context": context,
                    "tone_options": ["authentic", "masked", "simple"]
                }
            )
            
            return {
                "options": reply_options.get("reply_options", []),
                "context": context
            }
            
        except Exception as e:
            logger.error(f"Failed to generate reply options: {str(e)}")
            raise
    
    async def close(self):
        """Clean up resources"""
        try:
            await knowledge_graph_service.close()
        except Exception as e:
            logger.error(f"Failed to close ASTI Brain: {str(e)}")
            raise
    
    async def get_user_preferences(self) -> Dict[str, Any]:
        """Get the user's preferences"""
        # In a real implementation, this would fetch from a database
        # For now, return default preferences
        return {
            "stress_sensitivity": "MEDIUM",
            "communication_preferences": "CLEAR",
            "action_item_detail": "HIGH",
            "daily_brief_format": "STRUCTURED",
            "notification_frequency": "MODERATE"
        }
    
    async def get_important_emails(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get the user's important emails"""
        # In a real implementation, this would fetch from the knowledge graph
        # For now, return mock emails
        return [
            {
                "id": f"email-{uuid.uuid4()}",
                "subject": "Important Project Update",
                "sender": {"name": "Project Manager", "email": "manager@example.com"},
                "content": "The deadline for the project has been moved up. Please adjust your schedule accordingly.",
                "priority": "HIGH",
                "received_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                "action_items": ["Update project timeline", "Notify team members"]
            },
            {
                "id": f"email-{uuid.uuid4()}",
                "subject": "Meeting Reminder",
                "sender": {"name": "Calendar System", "email": "calendar@example.com"},
                "content": "Reminder: You have a team meeting tomorrow at 10:00 AM.",
                "priority": "MEDIUM",
                "received_at": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                "action_items": ["Prepare meeting notes", "Review agenda"]
            }
        ][:limit]
    
    async def get_upcoming_events(self, days: int = 1) -> List[Dict[str, Any]]:
        """Get the user's upcoming calendar events"""
        # In a real implementation, this would fetch from the knowledge graph
        # For now, return mock events
        return [
            {
                "id": f"event-{uuid.uuid4()}",
                "title": "Team Meeting",
                "start_time": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                "end_time": (datetime.utcnow() + timedelta(hours=2)).isoformat(),
                "location": "Conference Room A",
                "attendees": [
                    {"name": "Team Member 1", "email": "member1@example.com"},
                    {"name": "Team Member 2", "email": "member2@example.com"}
                ],
                "importance": 8
            },
            {
                "id": f"event-{uuid.uuid4()}",
                "title": "Project Deadline",
                "start_time": (datetime.utcnow() + timedelta(hours=8)).isoformat(),
                "end_time": (datetime.utcnow() + timedelta(hours=8)).isoformat(),
                "location": "",
                "attendees": [],
                "importance": 10
            }
        ]

# Cache of brain instances by user_id
_brain_instances = {}

async def get_asti_brain(user_id: str) -> ASTIBrain:
    """
    Get or create an ASTIBrain instance for a user
    """
    if user_id not in _brain_instances:
        _brain_instances[user_id] = ASTIBrain(user_id)
    
    return _brain_instances[user_id] 