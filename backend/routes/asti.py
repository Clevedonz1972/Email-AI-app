from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from pydantic import BaseModel, Field
import uuid
from datetime import datetime
from enum import Enum

from backend.auth.auth import get_current_user
from backend.models.user import User
from backend.services.asti_brain import get_asti_brain, ASTIBrain
from backend.services.vector_memory import recall_relevant_context, add_memory
from backend.utils.logger import logger

router = APIRouter(prefix="/asti", tags=["ASTI AI System"])


class EmailInput(BaseModel):
    subject: str
    content: str
    sender: Dict[str, str]
    recipients: List[Dict[str, str]] = []
    sent_at: Optional[str] = None
    received_at: Optional[str] = None


class CalendarEventInput(BaseModel):
    title: str
    description: str = ""
    start_time: str
    end_time: str
    location: str = ""
    attendees: List[Dict[str, str]] = []
    recurring: bool = False
    recurrence_pattern: Optional[str] = None
    importance: int = 5  # 1-10 scale


class MemoryInput(BaseModel):
    text: str
    metadata: Dict[str, Any] = {}
    type: str = "general"
    importance: float = Field(0.5, ge=0.0, le=1.0)


class SupportQuery(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


# Task-related models
class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    DEFERRED = "deferred"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskCategory(str, Enum):
    EMAIL = "email"
    CALENDAR = "calendar"
    HEALTH = "health"
    WORK = "work"
    PERSONAL = "personal"
    FINANCE = "finance"
    HOME = "home"
    ERRANDS = "errands"
    SOCIAL = "social"
    LEARNING = "learning"
    OTHER = "other"


class TaskAssignedBy(str, Enum):
    USER = "USER"
    AI = "AI"
    EMAIL = "EMAIL"
    CALENDAR = "CALENDAR"


class TaskInput(BaseModel):
    title: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[str] = None
    category: TaskCategory = TaskCategory.OTHER
    associated_email: Optional[str] = None
    associated_emotion: Optional[str] = None
    assigned_by: TaskAssignedBy = TaskAssignedBy.USER
    context_reasoning: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[str] = None
    category: Optional[TaskCategory] = None
    associated_email: Optional[str] = None
    associated_emotion: Optional[str] = None
    context_reasoning: Optional[str] = None
    description: Optional[str] = None
    completed_at: Optional[str] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[str]
    created_at: str
    category: TaskCategory
    associated_email: Optional[str]
    associated_emotion: Optional[str]
    assigned_by: TaskAssignedBy
    context_reasoning: Optional[str]
    description: Optional[str]
    completed_at: Optional[str]
    tags: List[str]


@router.get("/daily-brief")
async def get_daily_brief(current_user: User = Depends(get_current_user)):
    """Generate a daily brief for the user"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        brief = await asti_brain.generate_daily_brief()
        return brief
    except Exception as e:
        logger.error(f"Error generating daily brief: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-email")
async def analyze_email(
    email: EmailInput, 
    current_user: User = Depends(get_current_user)
):
    """Analyze an email and store it in the user's knowledge graph"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Set default received_at if not provided
        if not email.received_at:
            email.received_at = datetime.utcnow().isoformat()
            
        # Process the email
        result = await asti_brain.process_email(email.dict())
        return result
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-calendar-event")
async def analyze_calendar_event(
    event: CalendarEventInput,
    current_user: User = Depends(get_current_user)
):
    """Analyze a calendar event and store it in the user's knowledge graph"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        result = await asti_brain.process_calendar_event(event.dict())
        return result
    except Exception as e:
        logger.error(f"Error analyzing calendar event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memories")
async def add_user_memory(
    memory: MemoryInput,
    current_user: User = Depends(get_current_user)
):
    """Add a new memory to the user's vector store"""
    try:
        memory_id = await add_memory(
            memory.text,
            memory.metadata,
            str(current_user.id),
            memory.type,
            memory.importance
        )
        
        if not memory_id:
            raise HTTPException(status_code=500, detail="Failed to add memory")
            
        return {"memory_id": memory_id}
    except Exception as e:
        logger.error(f"Error adding memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memories")
async def recall_memories(
    query: str,
    limit: int = Query(5, ge=1, le=20),
    memory_type: Optional[str] = None,
    min_importance: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    """Recall memories relevant to the query"""
    try:
        # Build filters
        filters = {}
        if memory_type:
            filters["type"] = memory_type
        if min_importance is not None:
            filters["min_importance"] = min_importance
            
        # Retrieve memories
        memories = await recall_relevant_context(
            query, 
            str(current_user.id), 
            limit, 
            filters
        )
        
        return {"memories": memories}
    except Exception as e:
        logger.error(f"Error recalling memories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/support")
async def get_context_aware_support(
    query: SupportQuery,
    current_user: User = Depends(get_current_user)
):
    """Get context-aware support for the user"""
    try:
        # First, get relevant memories
        memories = await recall_relevant_context(
            query.query,
            str(current_user.id),
            limit=5
        )
        
        # Get access to ASTI brain
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # TODO: This would call a GPT endpoint to generate a personalized response
        # based on the user's query and relevant memories
        # For now, we'll return a placeholder
        
        return {
            "response": f"I'll help you with: {query.query}",
            "relevant_context": memories,
            "support_type": "general_assistance"
        }
    except Exception as e:
        logger.error(f"Error providing support: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wellbeing/suggestions")
async def get_wellbeing_suggestions(
    current_user: User = Depends(get_current_user)
):
    """Get personalized wellbeing suggestions based on the user's current state"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Generate daily brief (which contains wellbeing suggestions)
        brief = await asti_brain.generate_daily_brief()
        
        return {
            "suggestions": brief.get("wellbeing_suggestions", []),
            "stress_level": brief.get("overall_status", {}).get("stress_level", "MEDIUM"),
            "energy_level": brief.get("overall_status", {}).get("energy_level", "MEDIUM")
        }
    except Exception as e:
        logger.error(f"Error getting wellbeing suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Task Management Endpoints

@router.get("/tasks", response_model=List[TaskResponse])
async def get_all_tasks(
    status: Optional[TaskStatus] = None,
    category: Optional[TaskCategory] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for the user, optionally filtered by status or category"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Build filter parameters
        filters = {}
        if status:
            filters["status"] = status
        if category:
            filters["category"] = category
            
        # Get tasks from the knowledge graph
        tasks = await asti_brain.get_user_tasks(filters)
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/prioritized", response_model=List[TaskResponse])
async def get_prioritized_tasks(
    limit: int = Query(3, ge=1, le=10),
    current_user: User = Depends(get_current_user)
):
    """Get the user's prioritized tasks based on ASTI's prioritization logic"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Get prioritized tasks from the knowledge graph
        tasks = await asti_brain.get_prioritized_tasks(limit)
        return tasks
    except Exception as e:
        logger.error(f"Error fetching prioritized tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/category/{category}", response_model=List[TaskResponse])
async def get_tasks_by_category(
    category: TaskCategory,
    current_user: User = Depends(get_current_user)
):
    """Get tasks for a specific category"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Get tasks for the specified category
        tasks = await asti_brain.get_user_tasks({"category": category})
        return tasks
    except Exception as e:
        logger.error(f"Error fetching tasks for category {category}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskInput,
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Create task in the knowledge graph
        task_dict = task.dict()
        task_dict["created_at"] = datetime.utcnow().isoformat()
        task_dict["id"] = f"task-{uuid.uuid4()}"
        
        # Store the task in the knowledge graph
        created_task = await asti_brain.create_task(task_dict)
        return created_task
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str = Path(..., description="The ID of the task to retrieve"),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Get the task from the knowledge graph
        task = await asti_brain.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
            
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_update: TaskUpdate,
    task_id: str = Path(..., description="The ID of the task to update"),
    current_user: User = Depends(get_current_user)
):
    """Update a specific task"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Get the existing task
        existing_task = await asti_brain.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
        
        # If marking as complete, add completed_at if not provided
        if task_update.status == TaskStatus.COMPLETE and not task_update.completed_at:
            task_update.completed_at = datetime.utcnow().isoformat()
        
        # Update the task in the knowledge graph
        updated_task = await asti_brain.update_task(task_id, task_update.dict(exclude_unset=True))
        return updated_task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tasks/{task_id}", response_model=Dict[str, bool])
async def delete_task(
    task_id: str = Path(..., description="The ID of the task to delete"),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific task"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Delete the task from the knowledge graph
        success = await asti_brain.delete_task(task_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
            
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memories/{memory_id}/convert", response_model=TaskResponse)
async def convert_memory_to_task(
    memory_id: str = Path(..., description="The ID of the memory to convert to a task"),
    task_details: Optional[TaskInput] = None,
    current_user: User = Depends(get_current_user)
):
    """Convert a memory to a task"""
    try:
        asti_brain = await get_asti_brain(str(current_user.id))
        
        # Retrieve the memory
        memory = await asti_brain.get_memory_by_id(memory_id)
        
        if not memory:
            raise HTTPException(status_code=404, detail=f"Memory with ID {memory_id} not found")
        
        # Create a task from the memory
        task_dict = {
            "id": f"task-{uuid.uuid4()}",
            "title": memory.get("text", "")[:100] if len(memory.get("text", "")) > 100 else memory.get("text", ""),
            "status": TaskStatus.PENDING,
            "priority": TaskPriority.MEDIUM,
            "created_at": datetime.utcnow().isoformat(),
            "category": TaskCategory.OTHER,
            "assigned_by": TaskAssignedBy.USER,
            "description": memory.get("text", ""),
            "tags": ["from_memory"]
        }
        
        # Apply any provided task details
        if task_details:
            task_dict.update(task_details.dict(exclude_unset=True))
        
        # Create the task in the knowledge graph
        task = await asti_brain.create_task(task_dict)
        
        # Mark the memory as converted to a task
        await asti_brain.update_memory(memory_id, {"converted_to_task": True, "task_id": task["id"]})
        
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting memory {memory_id} to task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 