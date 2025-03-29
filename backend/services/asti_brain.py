from typing import Dict, List, Optional, Any, Union
import json
import uuid
from datetime import datetime, timedelta

from backend.models.knowledge_graph import (
    KnowledgeGraph, 
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
from backend.utils.logger import logger
from backend.services.openai_service import analyze_content


class ASTIBrain:
    """
    ASTI's brain - integrates knowledge graph and vector memory for context-aware reasoning.
    This is the core intelligence of the system that powers all context-aware assistance.
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.knowledge_graph = KnowledgeGraph(user_id=user_id)

    async def process_email(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process an email to extract insights and update memory"""
        try:
            # Analyze email content using AI
            email_content = email_data.get("content", "")
            email_subject = email_data.get("subject", "")
            
            # Full email text for semantic memory
            full_text = f"Subject: {email_subject}\n\n{email_content}"
            
            # Analyze the email content
            analysis = await analyze_content(full_text)
            
            # Store email in knowledge graph
            email_id = f"email-{str(uuid.uuid4())}"
            email_node = EmailNode(
                id=email_id,
                properties={
                    "subject": email_subject,
                    "sender": email_data.get("sender", {}).get("email", ""),
                    "recipients": email_data.get("recipients", []),
                    "content": email_content,
                    "sent_at": email_data.get("sent_at"),
                    "received_at": email_data.get("received_at", datetime.utcnow().isoformat()),
                    "priority": analysis.get("priority", "MEDIUM"),
                    "stress_level": analysis.get("stress_level", "LOW"),
                    "sentiment": analysis.get("sentiment_score", 0),
                    "action_items": analysis.get("action_items", []),
                    "categories": [],
                    "processed": True
                }
            )
            self.knowledge_graph.add_node(email_node)
            
            # Store in vector memory for semantic search
            memory_metadata = {
                "email_id": email_id,
                "subject": email_subject,
                "sender": email_data.get("sender", {}).get("email", ""),
                "priority": analysis.get("priority", "MEDIUM"),
                "stress_level": analysis.get("stress_level", "LOW"),
                "action_required": len(analysis.get("action_items", [])) > 0,
                "processed_date": datetime.utcnow().isoformat()
            }
            await add_memory(full_text, memory_metadata, self.user_id, "email")
            
            # Connect to relevant entities in knowledge graph
            await self._connect_email_to_entities(email_node, analysis)
            
            # Update user's emotional state based on this email
            await self._update_emotion_state([email_node])
            
            return {
                "email_id": email_id,
                "analysis": analysis,
                "action_items": analysis.get("action_items", []),
                "priority": analysis.get("priority", "MEDIUM"),
                "stress_level": analysis.get("stress_level", "LOW")
            }
            
        except Exception as e:
            logger.error(f"Error processing email: {str(e)}")
            return {
                "error": "Failed to process email",
                "details": str(e)
            }

    async def process_calendar_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a calendar event to extract insights and update memory"""
        try:
            # Extract event details
            event_title = event_data.get("title", "")
            event_description = event_data.get("description", "")
            
            # Full event text for semantic memory
            full_text = f"Event: {event_title}\n\nDescription: {event_description}"
            
            # Generate a unique ID for this event
            event_id = f"event-{str(uuid.uuid4())}"
            
            # Create event node in knowledge graph
            event_node = CalendarEventNode(
                id=event_id,
                properties={
                    "title": event_title,
                    "description": event_description,
                    "start_time": event_data.get("start_time"),
                    "end_time": event_data.get("end_time"),
                    "location": event_data.get("location", ""),
                    "attendees": event_data.get("attendees", []),
                    "recurring": event_data.get("recurring", False),
                    "recurrence_pattern": event_data.get("recurrence_pattern"),
                    "importance": event_data.get("importance", 5)
                }
            )
            self.knowledge_graph.add_node(event_node)
            
            # Analyze event for stress factors, preparation needs, etc.
            analysis = await analyze_content(full_text)
            
            # Update event properties based on analysis
            stress_level = analysis.get("stress_level", "MEDIUM")
            event_node.properties["stress_level"] = stress_level
            event_node.properties["social_energy_required"] = "HIGH" if len(event_data.get("attendees", [])) > 3 else "MEDIUM"
            
            # Add to vector memory
            memory_metadata = {
                "event_id": event_id,
                "title": event_title,
                "start_time": event_data.get("start_time"),
                "end_time": event_data.get("end_time"),
                "location": event_data.get("location", ""),
                "stress_level": stress_level
            }
            await add_memory(full_text, memory_metadata, self.user_id, "calendar")
            
            # Look for conflicts and update stress factors
            conflicts = await self._detect_calendar_conflicts(event_node)
            
            # Connect to related entities
            await self._connect_event_to_entities(event_node)
            
            return {
                "event_id": event_id,
                "analysis": {
                    "stress_level": stress_level,
                    "preparation_needed": analysis.get("action_items", []),
                    "conflicts": conflicts,
                    "recovery_time_needed": "HIGH" if stress_level == "HIGH" else "MEDIUM"
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing calendar event: {str(e)}")
            return {
                "error": "Failed to process calendar event",
                "details": str(e)
            }

    async def generate_daily_brief(self) -> Dict[str, Any]:
        """Generate a personalized daily brief based on user's context"""
        try:
            # Get recent emails (last 48 hours)
            two_days_ago = datetime.utcnow() - timedelta(days=2)
            recent_email_nodes = [
                node for node in self.knowledge_graph.get_nodes_by_type(NodeType.EMAIL)
                if datetime.fromisoformat(node.properties.get("received_at", two_days_ago.isoformat())) >= two_days_ago
            ]
            
            # Get upcoming calendar events (next 24 hours)
            tomorrow = datetime.utcnow() + timedelta(days=1)
            upcoming_events = [
                node for node in self.knowledge_graph.get_nodes_by_type(NodeType.CALENDAR_EVENT)
                if node.properties.get("start_time") and datetime.fromisoformat(node.properties.get("start_time")) <= tomorrow
            ]
            
            # Get current emotion state
            emotion_states = self.knowledge_graph.get_nodes_by_type(NodeType.EMOTION_STATE)
            current_emotion = emotion_states[0] if emotion_states else None
            
            # Get tasks requiring attention
            tasks = [
                node for node in self.knowledge_graph.get_nodes_by_type(NodeType.TASK)
                if node.properties.get("status") != "completed"
            ]
            urgent_tasks = [task for task in tasks if task.properties.get("priority") == "HIGH"]
            
            # Calculate stress factors
            stress_factors = []
            if current_emotion and current_emotion.properties.get("overall_stress") == "HIGH":
                # Find what's causing stress
                stress_edges = [
                    edge for edge in self.knowledge_graph.get_node_relationships(current_emotion.id)
                    if edge.type == EdgeType.CAUSES and edge.source_id != current_emotion.id
                ]
                for edge in stress_edges:
                    source_node = self.knowledge_graph.get_node(edge.source_id)
                    if source_node:
                        stress_factors.append({
                            "type": source_node.type,
                            "description": source_node.properties.get("title", source_node.properties.get("subject", "Unknown")),
                            "impact": edge.properties.get("weight", 1.0)
                        })
            
            # Get memory insights
            memory_insights = await recall_relevant_context(
                "What's important for me to know today?", 
                self.user_id, 
                limit=5
            )
            
            # Construct the daily brief
            brief = {
                "greeting": self._generate_greeting(),
                "overall_status": {
                    "stress_level": current_emotion.properties.get("overall_stress", "MEDIUM") if current_emotion else "MEDIUM",
                    "energy_level": current_emotion.properties.get("energy_level", "MEDIUM") if current_emotion else "MEDIUM",
                    "focus_ability": current_emotion.properties.get("focus_ability", "MEDIUM") if current_emotion else "MEDIUM"
                },
                "email_summary": {
                    "unread_count": len([e for e in recent_email_nodes if not e.properties.get("is_read", False)]),
                    "action_required_count": len([e for e in recent_email_nodes if e.properties.get("action_required", False)]),
                    "high_priority_count": len([e for e in recent_email_nodes if e.properties.get("priority") == "HIGH"]),
                    "urgent_emails": [
                        {
                            "id": e.id,
                            "subject": e.properties.get("subject", "No subject"),
                            "sender": e.properties.get("sender", "Unknown"),
                            "priority": e.properties.get("priority", "HIGH")
                        } for e in recent_email_nodes if e.properties.get("priority") == "HIGH"
                    ][:3]  # Top 3 urgent emails
                },
                "calendar_summary": {
                    "events_today": len(upcoming_events),
                    "next_event": {
                        "title": upcoming_events[0].properties.get("title", "No title") if upcoming_events else "No upcoming events",
                        "start_time": upcoming_events[0].properties.get("start_time") if upcoming_events else None,
                        "location": upcoming_events[0].properties.get("location", "") if upcoming_events else ""
                    } if upcoming_events else None,
                    "high_stress_events": [
                        {
                            "id": e.id,
                            "title": e.properties.get("title", "No title"),
                            "start_time": e.properties.get("start_time")
                        } for e in upcoming_events if e.properties.get("stress_level") == "HIGH"
                    ]
                },
                "task_summary": {
                    "total_tasks": len(tasks),
                    "urgent_tasks": len(urgent_tasks),
                    "upcoming_deadlines": [
                        {
                            "id": t.id,
                            "title": t.properties.get("title", "Untitled task"),
                            "due_date": t.properties.get("due_date")
                        } for t in tasks if t.properties.get("due_date") and datetime.fromisoformat(t.properties.get("due_date")) <= tomorrow
                    ][:3]  # Top 3 upcoming deadlines
                },
                "stress_factors": stress_factors,
                "wellbeing_suggestions": self._generate_wellbeing_suggestions(current_emotion) if current_emotion else [],
                "memory_insights": memory_insights
            }
            
            return brief
            
        except Exception as e:
            logger.error(f"Error generating daily brief: {str(e)}")
            return {
                "error": "Failed to generate daily brief",
                "details": str(e),
                "greeting": self._generate_greeting(),
                "fallback_message": "I'm sorry, I couldn't gather all your information right now. Please check back later."
            }

    async def _connect_email_to_entities(self, email_node: EmailNode, analysis: Dict[str, Any]) -> None:
        """Connect email to relevant entities in the knowledge graph"""
        # Connect to sender if they exist as a relationship node
        sender_email = email_node.properties.get("sender", "")
        if sender_email:
            relationship_nodes = self.knowledge_graph.get_nodes_by_type(NodeType.RELATIONSHIP)
            for rel_node in relationship_nodes:
                if rel_node.properties.get("email") == sender_email:
                    # Create edge between email and relationship
                    edge_id = f"edge-{str(uuid.uuid4())}"
                    edge = Edge(
                        id=edge_id,
                        type=EdgeType.CREATED_BY,
                        source_id=email_node.id,
                        target_id=rel_node.id
                    )
                    self.knowledge_graph.add_edge(edge)
                    break
        
        # Create task nodes for action items
        action_items = analysis.get("action_items", [])
        for i, action in enumerate(action_items):
            task_id = f"task-{str(uuid.uuid4())}"
            task_node = TaskNode(
                id=task_id,
                properties={
                    "title": action,
                    "description": f"Task from email: {email_node.properties.get('subject')}",
                    "status": "not_started",
                    "priority": analysis.get("priority", "MEDIUM"),
                    "source": "email",
                    "source_id": email_node.id
                }
            )
            self.knowledge_graph.add_node(task_node)
            
            # Connect task to email
            edge_id = f"edge-{str(uuid.uuid4())}"
            edge = Edge(
                id=edge_id,
                type=EdgeType.PART_OF,
                source_id=task_id,
                target_id=email_node.id
            )
            self.knowledge_graph.add_edge(edge)

    async def _connect_event_to_entities(self, event_node: CalendarEventNode) -> None:
        """Connect calendar event to relevant entities in the knowledge graph"""
        # Connect to attendees if they exist as relationship nodes
        attendees = event_node.properties.get("attendees", [])
        for attendee in attendees:
            relationship_nodes = self.knowledge_graph.get_nodes_by_type(NodeType.RELATIONSHIP)
            for rel_node in relationship_nodes:
                if rel_node.properties.get("email") == attendee.get("email", ""):
                    # Create edge between event and relationship
                    edge_id = f"edge-{str(uuid.uuid4())}"
                    edge = Edge(
                        id=edge_id,
                        type=EdgeType.PART_OF,
                        source_id=rel_node.id,
                        target_id=event_node.id
                    )
                    self.knowledge_graph.add_edge(edge)
                    break

    async def _detect_calendar_conflicts(self, event_node: CalendarEventNode) -> List[Dict[str, Any]]:
        """Detect conflicts with other calendar events"""
        conflicts = []
        event_start = datetime.fromisoformat(event_node.properties.get("start_time")) if event_node.properties.get("start_time") else None
        event_end = datetime.fromisoformat(event_node.properties.get("end_time")) if event_node.properties.get("end_time") else None
        
        if not event_start or not event_end:
            return conflicts
            
        # Check all other calendar events
        calendar_nodes = self.knowledge_graph.get_nodes_by_type(NodeType.CALENDAR_EVENT)
        for other_event in calendar_nodes:
            if other_event.id == event_node.id:
                continue  # Skip the same event
                
            other_start = datetime.fromisoformat(other_event.properties.get("start_time")) if other_event.properties.get("start_time") else None
            other_end = datetime.fromisoformat(other_event.properties.get("end_time")) if other_event.properties.get("end_time") else None
            
            if not other_start or not other_end:
                continue
                
            # Check for overlap
            if (event_start <= other_end and event_end >= other_start):
                conflicts.append({
                    "event_id": other_event.id,
                    "title": other_event.properties.get("title", "Untitled event"),
                    "start_time": other_event.properties.get("start_time"),
                    "end_time": other_event.properties.get("end_time")
                })
                
                # Create edge between conflicting events
                edge_id = f"edge-{str(uuid.uuid4())}"
                edge = Edge(
                    id=edge_id,
                    type=EdgeType.RELATED_TO,
                    source_id=event_node.id,
                    target_id=other_event.id,
                    properties={
                        "relationship": "conflicts_with",
                        "conflict_type": "time_overlap"
                    }
                )
                self.knowledge_graph.add_edge(edge)
                
        return conflicts

    async def _update_emotion_state(self, new_nodes: List[Node]) -> None:
        """Update the user's emotional state based on new information"""
        # Get or create emotion state node
        emotion_states = self.knowledge_graph.get_nodes_by_type(NodeType.EMOTION_STATE)
        emotion_node = None
        
        if emotion_states:
            # Use the most recent emotion state
            emotion_node = max(emotion_states, key=lambda n: n.updated_at)
        else:
            # Create a new emotion state
            emotion_id = f"emotion-{str(uuid.uuid4())}"
            emotion_node = EmotionStateNode(
                id=emotion_id,
                properties={
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            self.knowledge_graph.add_node(emotion_node)
            
        # Update emotion state based on new nodes
        stress_count = 0
        for node in new_nodes:
            if node.type == NodeType.EMAIL and node.properties.get("stress_level") == "HIGH":
                stress_count += 1
                
                # Connect stress-inducing email to emotion
                edge_id = f"edge-{str(uuid.uuid4())}"
                edge = Edge(
                    id=edge_id,
                    type=EdgeType.CAUSES,
                    source_id=node.id,
                    target_id=emotion_node.id,
                    properties={
                        "factor": "email_stress",
                        "weight": 0.8 if node.properties.get("priority") == "HIGH" else 0.5
                    }
                )
                self.knowledge_graph.add_edge(edge)
        
        # Update overall stress level
        if stress_count > 2:
            emotion_node.properties["overall_stress"] = "HIGH"
            emotion_node.properties["needs_support"] = True
        elif stress_count > 0:
            emotion_node.properties["overall_stress"] = "MEDIUM"
        
        # Update node
        emotion_node.updated_at = datetime.utcnow()
        self.knowledge_graph.nodes[emotion_node.id] = emotion_node

    def _generate_greeting(self) -> str:
        """Generate a time-appropriate greeting"""
        hour = datetime.utcnow().hour
        
        if hour < 12:
            return "Good morning!"
        elif hour < 18:
            return "Good afternoon!"
        else:
            return "Good evening!"

    def _generate_wellbeing_suggestions(self, emotion_node: EmotionStateNode) -> List[str]:
        """Generate wellbeing suggestions based on emotional state"""
        suggestions = []
        
        # Check stress level
        if emotion_node.properties.get("overall_stress") == "HIGH":
            suggestions.append("Take short breaks between tasks today to reset your mind")
            suggestions.append("Consider a 5-minute breathing exercise before your next meeting")
            
        # Check burnout risk
        if emotion_node.properties.get("burnout_risk") == "HIGH":
            suggestions.append("You may be approaching burnout - consider scheduling time off soon")
            suggestions.append("Try to delegate some non-essential tasks this week")
            
        # Check energy level
        if emotion_node.properties.get("energy_level") == "LOW":
            suggestions.append("Your energy seems low - focus on high-priority tasks first")
            suggestions.append("Consider a short walk to boost your energy")
            
        # If no specific suggestions, provide general wellbeing tip
        if not suggestions:
            suggestions = [
                "Remember to stay hydrated throughout your day",
                "Taking regular screen breaks can help maintain focus",
                "Consider a few minutes of stretching between tasks"
            ]
            
        return suggestions

# Factory function to create ASTI brain for a user
async def get_asti_brain(user_id: str) -> ASTIBrain:
    """Get an ASTI brain instance for a specific user"""
    return ASTIBrain(user_id=user_id) 