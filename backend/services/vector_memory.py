from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel, Field

# For actual embedding, we would use a proper model like OpenAI's embeddings
# This is a simple mock for development purposes
try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

from backend.config import settings
from backend.utils.logger import logger


class MemoryItem(BaseModel):
    """A single memory item in the vector store"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    embedding: List[float] = []
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    type: str = "general"  # email, calendar, note, conversation
    user_id: str
    importance: float = 0.5  # 0-1 range for importance/relevance to user
    expiry: Optional[datetime] = None  # When this memory should expire (if applicable)
    last_accessed: Optional[datetime] = None  # When this memory was last accessed
    access_count: int = 0  # How many times this memory has been accessed


class VectorMemoryStore:
    """In-memory vector store implementation for development
    
    In production, this would be replaced by a proper vector database
    like Pinecone, Weaviate, or Chroma.
    """
    def __init__(self, embedding_dim: int = 1536, persist_dir: Optional[str] = None):
        self.items: Dict[str, MemoryItem] = {}
        self.embedding_dim = embedding_dim
        self.persist_dir = persist_dir
        self.embeddings_map: Dict[str, List[float]] = {}  # id -> embedding
        
        # Create OpenAI client if available
        self.client = None
        if HAS_OPENAI and hasattr(settings, "OPENAI_API_KEY"):
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Load persisted data if available
        if persist_dir:
            self._load_persisted_data()
    
    async def add_item(self, text: str, metadata: Dict[str, Any], 
                       user_id: str, item_type: str = "general", 
                       importance: float = 0.5) -> str:
        """Add a new item to the vector store"""
        # Generate embedding
        embedding = await self.generate_embedding(text)
        
        # Create memory item
        item = MemoryItem(
            text=text,
            embedding=embedding,
            metadata=metadata,
            user_id=user_id,
            type=item_type,
            importance=importance
        )
        
        # Store item
        self.items[item.id] = item
        self.embeddings_map[item.id] = embedding
        
        # Persist data if configured
        if self.persist_dir:
            self._persist_data()
            
        return item.id
    
    async def search(self, query: str, user_id: str, limit: int = 5, 
                     filters: Optional[Dict[str, Any]] = None) -> List[Tuple[MemoryItem, float]]:
        """Search for similar items in the vector store"""
        # Generate embedding for query
        query_embedding = await self.generate_embedding(query)
        
        # Filter items by user_id and any additional filters
        filtered_items = self._apply_filters(user_id, filters)
        
        # If no items match, return empty list
        if not filtered_items:
            return []
        
        # Calculate similarity scores
        similarities = []
        for item_id, item in filtered_items.items():
            if not item.embedding:
                continue
                
            similarity = self._calculate_similarity(query_embedding, item.embedding)
            similarities.append((item, similarity))
        
        # Sort by similarity (highest first)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Update access information for retrieved items
        now = datetime.utcnow()
        for item, _ in similarities[:limit]:
            item.last_accessed = now
            item.access_count += 1
            self.items[item.id] = item
        
        # Persist changes if configured
        if self.persist_dir:
            self._persist_data()
            
        return similarities[:limit]
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate an embedding for the given text"""
        if self.client:
            try:
                # Use OpenAI to generate embeddings
                response = await self.client.embeddings.create(
                    input=text,
                    model="text-embedding-ada-002"  # or the latest model
                )
                return response.data[0].embedding
            except Exception as e:
                logger.error(f"Error generating embedding: {str(e)}")
                # Fall back to mock embeddings
        
        # For development/testing: create a mock embedding of the right dimensionality
        # In a real system, this would use a proper embedding model
        np.random.seed(hash(text) % 2**32)
        return list(np.random.randn(self.embedding_dim).astype(float))
    
    def get_item(self, item_id: str) -> Optional[MemoryItem]:
        """Get a specific item by ID"""
        item = self.items.get(item_id)
        if item:
            # Update access information
            item.last_accessed = datetime.utcnow()
            item.access_count += 1
            self.items[item_id] = item
            
            # Persist changes if configured
            if self.persist_dir:
                self._persist_data()
        
        return item
    
    def delete_item(self, item_id: str) -> bool:
        """Delete an item from the store"""
        if item_id in self.items:
            del self.items[item_id]
            if item_id in self.embeddings_map:
                del self.embeddings_map[item_id]
            
            # Persist changes if configured
            if self.persist_dir:
                self._persist_data()
                
            return True
        
        return False
    
    def get_items_by_type(self, user_id: str, item_type: str, 
                          limit: int = 100) -> List[MemoryItem]:
        """Get items of a specific type"""
        items = [
            item for item in self.items.values() 
            if item.user_id == user_id and item.type == item_type
        ]
        
        # Sort by recency (newest first)
        items.sort(key=lambda x: x.created_at, reverse=True)
        
        return items[:limit]
    
    def update_item_metadata(self, item_id: str, metadata: Dict[str, Any]) -> bool:
        """Update an item's metadata"""
        if item_id in self.items:
            item = self.items[item_id]
            # Update metadata, preserving existing keys that aren't being updated
            item.metadata = {**item.metadata, **metadata}
            self.items[item_id] = item
            
            # Persist changes if configured
            if self.persist_dir:
                self._persist_data()
                
            return True
        
        return False
    
    def _apply_filters(self, user_id: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, MemoryItem]:
        """Apply filters to the items"""
        # Always filter by user_id
        result = {
            item_id: item for item_id, item in self.items.items() 
            if item.user_id == user_id
        }
        
        # Apply additional filters if provided
        if filters:
            for key, value in filters.items():
                if key == "type":
                    result = {
                        item_id: item for item_id, item in result.items() 
                        if item.type == value
                    }
                elif key == "min_importance":
                    result = {
                        item_id: item for item_id, item in result.items() 
                        if item.importance >= value
                    }
                elif key == "created_after":
                    result = {
                        item_id: item for item_id, item in result.items() 
                        if item.created_at >= value
                    }
                elif key == "created_before":
                    result = {
                        item_id: item for item_id, item in result.items() 
                        if item.created_at <= value
                    }
                elif key.startswith("metadata."):
                    metadata_key = key[9:]  # Remove "metadata." prefix
                    result = {
                        item_id: item for item_id, item in result.items() 
                        if metadata_key in item.metadata and item.metadata[metadata_key] == value
                    }
        
        return result
    
    def _calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        if not embedding1 or not embedding2:
            return 0.0
            
        # Convert to numpy arrays for easier calculation
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Compute cosine similarity
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return np.dot(vec1, vec2) / (norm1 * norm2)
    
    def _persist_data(self):
        """Persist the vector store data to disk"""
        if not self.persist_dir:
            return
            
        # Create directory if it doesn't exist
        os.makedirs(self.persist_dir, exist_ok=True)
        
        # Save items
        items_path = Path(self.persist_dir) / "memory_items.json"
        with open(items_path, "w") as f:
            # Convert items to dictionaries
            items_dict = {
                item_id: item.dict() for item_id, item in self.items.items()
            }
            json.dump(items_dict, f)
    
    def _load_persisted_data(self):
        """Load persisted data from disk"""
        if not self.persist_dir:
            return
            
        items_path = Path(self.persist_dir) / "memory_items.json"
        if items_path.exists():
            try:
                with open(items_path, "r") as f:
                    items_dict = json.load(f)
                    
                # Convert dictionaries back to MemoryItem objects
                for item_id, item_data in items_dict.items():
                    self.items[item_id] = MemoryItem(**item_data)
                    if "embedding" in item_data:
                        self.embeddings_map[item_id] = item_data["embedding"]
            except Exception as e:
                logger.error(f"Error loading persisted data: {str(e)}")


# Create a global instance for easy access
vector_memory = VectorMemoryStore(
    persist_dir=os.path.join(os.path.dirname(__file__), "..", "data", "vector_memory")
)

async def recall_relevant_context(query: str, user_id: str, limit: int = 5, 
                                 filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Find memories relevant to the given query"""
    try:
        results = await vector_memory.search(query, user_id, limit, filters)
        
        # Convert to a more useful format
        context = []
        for item, score in results:
            context.append({
                "id": item.id,
                "text": item.text,
                "metadata": item.metadata,
                "type": item.type,
                "created_at": item.created_at.isoformat(),
                "relevance_score": score
            })
            
        return context
    except Exception as e:
        logger.error(f"Error recalling context: {str(e)}")
        return []


async def add_memory(text: str, metadata: Dict[str, Any], user_id: str, 
                    item_type: str = "general", importance: float = 0.5) -> str:
    """Add a new memory to the vector store"""
    try:
        return await vector_memory.add_item(text, metadata, user_id, item_type, importance)
    except Exception as e:
        logger.error(f"Error adding memory: {str(e)}")
        return "" 