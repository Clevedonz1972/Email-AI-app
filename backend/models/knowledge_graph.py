from typing import Dict, List, Union, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class NodeType(str, Enum):
    """Types of nodes in the knowledge graph"""
    USER_PROFILE = "user_profile"
    CALENDAR_EVENT = "calendar_event"
    EMAIL = "email"
    TASK = "task"
    EMOTION_STATE = "emotion_state"
    RELATIONSHIP = "relationship"
    PREFERENCE = "preference"
    HABIT = "habit"
    GOAL = "goal"
    STRESS_FACTOR = "stress_factor"
    WELLBEING_METRIC = "wellbeing_metric"


class EdgeType(str, Enum):
    """Types of relationships between nodes"""
    CAUSES = "causes"
    RELATED_TO = "related_to"
    PART_OF = "part_of"
    SCHEDULED_FOR = "scheduled_for"
    CREATED_BY = "created_by"
    SENT_TO = "sent_to"
    RESPONDED_TO = "responded_to"
    IMPROVES = "improves"
    WORSENS = "worsens"
    HAS_PREFERENCE = "has_preference"
    WORKING_ON = "working_on"
    RECURRING = "recurring"
    DEPENDS_ON = "depends_on"
    PRIORITY_OVER = "priority_over"


class Node(BaseModel):
    """Base class for all knowledge graph nodes"""
    id: str
    type: NodeType
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    properties: Dict[str, Any] = {}
    confidence: float = 1.0  # Confidence score (0-1)
    source: str = "system"  # Where this knowledge came from
    hidden: bool = False  # Whether node should be hidden from user


class Edge(BaseModel):
    """Relationship between two nodes in the knowledge graph"""
    id: str  
    type: EdgeType
    source_id: str  # ID of the source node
    target_id: str  # ID of the target node
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    properties: Dict[str, Any] = {}
    confidence: float = 1.0  # Confidence score (0-1)
    start_time: Optional[datetime] = None  # When the relationship begins (if applicable)
    end_time: Optional[datetime] = None  # When the relationship ends (if applicable)
    weight: float = 1.0  # Strength of relationship
    bidirectional: bool = False  # If the relationship goes both ways


class UserProfileNode(Node):
    """User profile information"""
    type: NodeType = NodeType.USER_PROFILE
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "name": "",
        "pronouns": "",
        "email": "",
        "diagnosis": [],  # List of diagnoses if any
        "communication_preferences": {
            "preferred_tone": "supportive",
            "preferred_detail_level": "medium",
            "preferred_contact_method": "email"
        },
        "work_hours": {
            "start": "09:00",
            "end": "17:00",
            "timezone": "UTC",
            "work_days": [0, 1, 2, 3, 4]  # 0 = Monday, 6 = Sunday
        },
        "focus_times": [],  # Times when user needs to focus
        "recovery_times": [],  # Times when user needs to recover
        "energy_pattern": "morning",  # When user has most energy
    })


class CalendarEventNode(Node):
    """Calendar event information"""
    type: NodeType = NodeType.CALENDAR_EVENT
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "title": "",
        "description": "",
        "start_time": None,
        "end_time": None,
        "location": "",
        "attendees": [],
        "recurring": False,
        "recurrence_pattern": None,
        "importance": 0,  # 0-10 scale
        "preparation_required": False,
        "preparation_time_minutes": 0,
        "recovery_time_minutes": 0,
        "stress_level": "LOW",  # LOW, MEDIUM, HIGH
        "energy_level": "LOW",  # LOW, MEDIUM, HIGH 
        "related_tasks": [],
        "social_energy_required": "LOW",  # LOW, MEDIUM, HIGH
        "cognitive_load": "LOW",  # LOW, MEDIUM, HIGH
    })


class EmailNode(Node):
    """Email information"""
    type: NodeType = NodeType.EMAIL
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "subject": "",
        "sender": "",
        "recipients": [],
        "content": "",
        "sent_at": None,
        "received_at": None,
        "response_required": False,
        "response_deadline": None,
        "priority": "MEDIUM",  # LOW, MEDIUM, HIGH
        "stress_level": "LOW",  # LOW, MEDIUM, HIGH
        "sentiment": 0,  # -1 to 1
        "action_items": [],
        "categories": [],
        "processed": False,
        "related_events": []
    })


class TaskNode(Node):
    """Task information"""
    type: NodeType = NodeType.TASK
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "title": "",
        "description": "",
        "status": "not_started",  # not_started, in_progress, completed, deferred, cancelled
        "priority": "MEDIUM",  # LOW, MEDIUM, HIGH
        "due_date": None,
        "estimated_duration_minutes": 30,
        "actual_duration_minutes": None,
        "completed_at": None,
        "energy_required": "MEDIUM",  # LOW, MEDIUM, HIGH
        "cognitive_load": "MEDIUM",  # LOW, MEDIUM, HIGH
        "procrastination_risk": "MEDIUM",  # LOW, MEDIUM, HIGH
        "stress_level": "MEDIUM",  # LOW, MEDIUM, HIGH
        "source": "",  # email, manual, calendar, etc.
        "tags": [],
        "subtasks": [],
        "notes": "",
    })


class EmotionStateNode(Node):
    """Emotional state information"""
    type: NodeType = NodeType.EMOTION_STATE
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "overall_stress": "MEDIUM",  # LOW, MEDIUM, HIGH
        "burnout_risk": "LOW",  # LOW, MEDIUM, HIGH
        "mood": "neutral",  # sad, anxious, happy, neutral, etc.
        "energy_level": "MEDIUM",  # LOW, MEDIUM, HIGH
        "overwhelm_level": "LOW",  # LOW, MEDIUM, HIGH
        "focus_ability": "MEDIUM",  # LOW, MEDIUM, HIGH
        "timestamp": None,
        "contributing_factors": [],
        "detection_source": "system",  # user_reported, system_inferred
        "needs_break": False,
        "needs_support": False,
    })


class RelationshipNode(Node):
    """Relationship with another person"""
    type: NodeType = NodeType.RELATIONSHIP
    properties: Dict[str, Any] = Field(default_factory=lambda: {
        "person_name": "",
        "email": "",
        "relationship_type": "",  # colleague, friend, family, manager, etc.
        "communication_frequency": "occasional",  # daily, weekly, monthly, occasional
        "preferred_communication_method": "email",
        "preferred_response_time": "normal",  # immediate, same_day, within_week
        "stress_impact": "neutral",  # positive, negative, neutral
        "interaction_history": [],
        "common_topics": [],
        "response_tone": "professional",  # professional, casual, formal
        "priority_level": "MEDIUM",  # LOW, MEDIUM, HIGH
    })


class KnowledgeGraph(BaseModel):
    """ASTI's knowledge graph of the user's life and context"""
    nodes: Dict[str, Node] = {}
    edges: Dict[str, Edge] = {}
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    user_id: str

    def add_node(self, node: Node) -> str:
        """Add a node to the graph"""
        self.nodes[node.id] = node
        self.last_updated = datetime.utcnow()
        return node.id

    def add_edge(self, edge: Edge) -> str:
        """Add an edge to the graph"""
        self.edges[edge.id] = edge
        self.last_updated = datetime.utcnow()
        return edge.id

    def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID"""
        return self.nodes.get(node_id)

    def get_edge(self, edge_id: str) -> Optional[Edge]:
        """Get an edge by ID"""
        return self.edges.get(edge_id)

    def get_nodes_by_type(self, node_type: NodeType) -> List[Node]:
        """Get all nodes of a specific type"""
        return [node for node in self.nodes.values() if node.type == node_type]

    def get_edges_by_type(self, edge_type: EdgeType) -> List[Edge]:
        """Get all edges of a specific type"""
        return [edge for edge in self.edges.values() if edge.type == edge_type]

    def get_connected_nodes(self, node_id: str) -> List[Node]:
        """Get all nodes connected to a specific node"""
        connected_node_ids = set()
        
        # Find edges where this node is the source
        for edge in self.edges.values():
            if edge.source_id == node_id:
                connected_node_ids.add(edge.target_id)
            elif edge.target_id == node_id and edge.bidirectional:
                connected_node_ids.add(edge.source_id)
                
        # Find edges where this node is the target
        for edge in self.edges.values():
            if edge.target_id == node_id:
                connected_node_ids.add(edge.source_id)
            elif edge.source_id == node_id and edge.bidirectional:
                connected_node_ids.add(edge.target_id)
                
        # Get the actual node objects
        return [self.nodes[node_id] for node_id in connected_node_ids if node_id in self.nodes]

    def get_node_relationships(self, node_id: str) -> List[Edge]:
        """Get all relationships involving a specific node"""
        return [
            edge for edge in self.edges.values() 
            if edge.source_id == node_id or edge.target_id == node_id
        ]

    def to_dict(self) -> Dict:
        """Convert the knowledge graph to a dictionary"""
        return {
            "nodes": {k: v.dict() for k, v in self.nodes.items()},
            "edges": {k: v.dict() for k, v in self.edges.items()},
            "last_updated": self.last_updated.isoformat(),
            "user_id": self.user_id
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "KnowledgeGraph":
        """Create a knowledge graph from a dictionary"""
        kg = cls(user_id=data["user_id"])
        
        # Convert nodes back to Node objects
        for node_id, node_data in data["nodes"].items():
            node_type = NodeType(node_data["type"])
            
            # Create the appropriate node type
            if node_type == NodeType.USER_PROFILE:
                node = UserProfileNode(**node_data)
            elif node_type == NodeType.CALENDAR_EVENT:
                node = CalendarEventNode(**node_data)
            elif node_type == NodeType.EMAIL:
                node = EmailNode(**node_data)
            elif node_type == NodeType.TASK:
                node = TaskNode(**node_data)
            elif node_type == NodeType.EMOTION_STATE:
                node = EmotionStateNode(**node_data)
            elif node_type == NodeType.RELATIONSHIP:
                node = RelationshipNode(**node_data)
            else:
                node = Node(**node_data)
                
            kg.nodes[node_id] = node
            
        # Convert edges back to Edge objects
        for edge_id, edge_data in data["edges"].items():
            kg.edges[edge_id] = Edge(**edge_data)
            
        return kg 