"""
Knowledge Graph API Routes
Handles requests for Neo4j graph operations
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import os
from enum import Enum

# Import services
from backend.services.knowledge_graph import Neo4jService
from backend.services.auth_service import get_current_user

# Create router
router = APIRouter(prefix="/api/graph", tags=["graph"])

# Initialize knowledge graph service
graph_service = Neo4jService()

# Models
class MemoryType(str, Enum):
    EMAIL = "email"
    TASK = "task"
    CONVERSATION = "conversation"
    KNOWLEDGE = "knowledge"

class RelationshipProperties(BaseModel):
    strength: Optional[float] = None
    timestamp: Optional[int] = None
    relevance: Optional[float] = None
    context: Optional[str] = None
    frequency: Optional[int] = None
    recency: Optional[float] = None
    tone: Optional[str] = None

class Relationship(BaseModel):
    type: str
    properties: Optional[RelationshipProperties] = None

class Memory(BaseModel):
    id: str
    type: MemoryType
    content: str
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None

class GraphNode(BaseModel):
    id: str
    type: MemoryType
    content: str
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None
    relationships: Optional[List[Dict[str, Any]]] = None

class TemporalEvent(BaseModel):
    id: str
    event_type: str
    timestamp: int
    description: str
    intensity: float
    duration: Optional[float] = None
    related_entities: List[str]

class ReasoningPath(BaseModel):
    path: List[GraphNode]
    relationships: List[Relationship]
    score: float
    explanation: str

class RelationshipCreate(BaseModel):
    sourceId: str
    targetId: str
    relationship: Relationship

# Routes
@router.post("/node", response_model=Dict[str, Any])
async def upsert_node(memory: Memory, user = Depends(get_current_user)):
    """Create or update a node in the knowledge graph"""
    try:
        # Add user_id to metadata to support multi-tenant isolation
        if memory.metadata is None:
            memory.metadata = {}
        memory.metadata["user_id"] = user.id
        
        # Upsert node in graph
        result = await graph_service.create_node(memory)
        return {"success": True, "id": memory.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upsert node: {str(e)}")

@router.post("/temporal-event", response_model=Dict[str, Any])
async def create_temporal_event(event: TemporalEvent, user = Depends(get_current_user)):
    """Create a temporal reasoning node in the knowledge graph"""
    try:
        # Store temporal event node
        result = await graph_service.create_temporal_event(event, user_id=user.id)
        return {"success": True, "id": event.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create temporal event: {str(e)}")

@router.post("/relationship", response_model=Dict[str, Any])
async def create_relationship(relationship_data: RelationshipCreate, user = Depends(get_current_user)):
    """Create a relationship between two nodes in the knowledge graph"""
    try:
        # Verify both nodes belong to user
        source_node = await graph_service.get_node(relationship_data.sourceId)
        target_node = await graph_service.get_node(relationship_data.targetId)
        
        if not source_node or not target_node:
            raise HTTPException(status_code=404, detail="One or both nodes not found")
            
        if (source_node.metadata.get("user_id") != user.id or 
            target_node.metadata.get("user_id") != user.id):
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Create relationship
        result = await graph_service.create_edge(
            relationship_data.sourceId,
            relationship_data.targetId,
            relationship_data.relationship.type,
            relationship_data.relationship.properties.dict() if relationship_data.relationship.properties else {}
        )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create relationship: {str(e)}")

@router.get("/related-memories/{memory_id}", response_model=List[GraphNode])
async def find_related_memories(
    memory_id: str, 
    relationship_types: Optional[List[str]] = None,
    limit: Optional[int] = 10,
    min_strength: Optional[float] = 0.0,
    user = Depends(get_current_user)
):
    """Find related memories for a given memory"""
    try:
        # Verify node belongs to user
        node = await graph_service.get_node(memory_id)
        if not node or node.metadata.get("user_id") != user.id:
            raise HTTPException(status_code=404, detail="Memory not found")
        
        # Find related memories
        results = await graph_service.get_related_nodes(
            memory_id,
            relationship_types=relationship_types,
            limit=limit,
            min_strength=min_strength
        )
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find related memories: {str(e)}")

@router.get("/path", response_model=List[GraphNode])
async def find_path(
    sourceId: str,
    targetId: str,
    relationship_types: Optional[List[str]] = None,
    max_length: Optional[int] = 5,
    user = Depends(get_current_user)
):
    """Find the shortest path between two memories"""
    try:
        # Verify both nodes belong to user
        source_node = await graph_service.get_node(sourceId)
        target_node = await graph_service.get_node(targetId)
        
        if not source_node or not target_node:
            raise HTTPException(status_code=404, detail="One or both nodes not found")
            
        if (source_node.metadata.get("user_id") != user.id or 
            target_node.metadata.get("user_id") != user.id):
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Find path
        results = await graph_service.get_path(
            sourceId,
            targetId,
            relationship_types=relationship_types,
            max_length=max_length
        )
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find path: {str(e)}")

@router.get("/relevance-score", response_model=Dict[str, float])
async def calculate_relevance_score(
    entityId: str,
    targetType: str,
    relationship_types: Optional[List[str]] = None,
    max_depth: Optional[int] = 3,
    user = Depends(get_current_user)
):
    """Calculate relevance score for an entity based on its connections"""
    try:
        # Verify node belongs to user
        node = await graph_service.get_node(entityId)
        if not node or node.metadata.get("user_id") != user.id:
            raise HTTPException(status_code=404, detail="Entity not found")
        
        # Calculate relevance score
        score = await graph_service.calculate_relevance_score(
            entityId,
            targetType,
            relationship_types=relationship_types,
            max_depth=max_depth
        )
        return {"score": score}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate relevance score: {str(e)}")

@router.get("/reasoning", response_model=ReasoningPath)
async def perform_reasoning(
    sourceId: str,
    targetId: str,
    max_length: Optional[int] = 5,
    min_strength: Optional[float] = 0.2,
    user = Depends(get_current_user)
):
    """Perform reasoning by finding paths between entities and explaining the connections"""
    try:
        # Verify both nodes belong to user
        source_node = await graph_service.get_node(sourceId)
        target_node = await graph_service.get_node(targetId)
        
        if not source_node or not target_node:
            raise HTTPException(status_code=404, detail="One or both nodes not found")
            
        if (source_node.metadata.get("user_id") != user.id or 
            target_node.metadata.get("user_id") != user.id):
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Perform reasoning
        result = await graph_service.perform_reasoning(
            sourceId,
            targetId,
            max_length=max_length,
            min_strength=min_strength
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform reasoning: {str(e)}")

@router.delete("/node/{memory_id}", response_model=Dict[str, bool])
async def delete_node(memory_id: str, user = Depends(get_current_user)):
    """Delete a node and its relationships"""
    try:
        # Verify node belongs to user
        node = await graph_service.get_node(memory_id)
        if not node or node.metadata.get("user_id") != user.id:
            raise HTTPException(status_code=404, detail="Node not found")
        
        # Delete node
        result = await graph_service.delete_node(memory_id)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete node: {str(e)}") 