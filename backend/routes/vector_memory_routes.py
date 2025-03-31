"""
Vector Memory API Routes
Handles requests for ChromaDB vector operations
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import os
from enum import Enum

# Import services
from backend.services.vector_memory import VectorMemoryService
from backend.services.auth_service import get_current_user

# Create router
router = APIRouter(prefix="/api/vector", tags=["vector"])

# Initialize vector memory service
vector_service = VectorMemoryService()

# Models
class MemoryType(str, Enum):
    EMAIL = "email"
    TASK = "task"
    CONVERSATION = "conversation"
    KNOWLEDGE = "knowledge"

class Memory(BaseModel):
    id: str
    type: MemoryType
    content: str
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None
    embedding: Optional[List[float]] = None

class MemoryCreate(BaseModel):
    type: MemoryType
    content: str
    metadata: Optional[Dict[str, Any]] = None
    embedding: Optional[List[float]] = None

class MemoryQueryResult(BaseModel):
    memory: Memory
    score: float

class QueryOptions(BaseModel):
    type: Optional[MemoryType] = None
    limit: Optional[int] = 5
    threshold: Optional[float] = 0.1

class VectorQuery(BaseModel):
    query: str
    embedding: Optional[List[float]] = None
    options: Optional[QueryOptions] = None

# Routes
@router.post("/memory", response_model=Memory)
async def store_memory(memory: Memory, user = Depends(get_current_user)):
    """Store a memory with its vector embedding"""
    try:
        # Add user_id to metadata to support multi-tenant isolation
        if memory.metadata is None:
            memory.metadata = {}
        memory.metadata["user_id"] = user.id
        
        # Store memory in vector database
        result = await vector_service.store_memory(memory)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store memory: {str(e)}")

@router.post("/query", response_model=List[MemoryQueryResult])
async def query_memories(query: VectorQuery, user = Depends(get_current_user)):
    """Find memories related to a query using vector similarity"""
    try:
        # Set user_id filter to ensure tenant isolation
        user_filter = {"user_id": user.id}
        
        # Combine with type filter if provided
        where_filter = user_filter
        if query.options and query.options.type:
            where_filter["type"] = query.options.type
        
        # Get limit and threshold
        limit = query.options.limit if query.options and query.options.limit else 5
        threshold = query.options.threshold if query.options and query.options.threshold else 0.1
        
        # Query vector database
        results = await vector_service.query_memories(
            query.query,
            query.embedding,
            where=where_filter,
            limit=limit,
            threshold=threshold
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query memories: {str(e)}")

@router.get("/memories/{type}", response_model=List[Memory])
async def get_memories_by_type(type: MemoryType, user = Depends(get_current_user)):
    """Get all memories of a specific type"""
    try:
        # Set user_id filter to ensure tenant isolation
        where_filter = {
            "user_id": user.id,
            "type": type
        }
        
        # Query vector database
        results = await vector_service.get_memories(where=where_filter)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get memories: {str(e)}")

@router.delete("/memory/{memory_id}", response_model=bool)
async def delete_memory(memory_id: str, user = Depends(get_current_user)):
    """Delete a memory by ID"""
    try:
        # Get memory to check ownership
        memory = await vector_service.get_memory_by_id(memory_id)
        if not memory or memory.metadata.get("user_id") != user.id:
            raise HTTPException(status_code=404, detail="Memory not found")
        
        # Delete memory
        result = await vector_service.delete_memory(memory_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete memory: {str(e)}")

@router.delete("/memories", response_model=bool)
async def clear_memories(user = Depends(get_current_user)):
    """Clear all memories for a user"""
    try:
        # Set user_id filter to ensure tenant isolation
        where_filter = {"user_id": user.id}
        
        # Delete memories
        result = await vector_service.delete_memories(where=where_filter)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear memories: {str(e)}") 