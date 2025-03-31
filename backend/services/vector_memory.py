"""
Vector Memory Service
Handles interaction with ChromaDB for vector storage and retrieval
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
import os
import json
import logging
from datetime import datetime
import asyncio
from enum import Enum
import uuid

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

class MemoryQueryResult(BaseModel):
    memory: Memory
    score: float

class VectorMemoryService:
    """Service for handling vector memory operations with ChromaDB"""
    
    def __init__(self):
        """Initialize the vector memory service"""
        self.client = None
        self.collection = None
        self.collection_name = "asti_memory"
        self.embedding_function = None
        self.initialized = False
        
        # Initialize async
        asyncio.create_task(self.initialize())
    
    async def initialize(self):
        """Initialize the ChromaDB client and collection"""
        try:
            # Check for environment settings
            persistent_dir = os.environ.get("CHROMADB_PERSISTENT_DIR", "./data/chromadb")
            host = os.environ.get("CHROMADB_HOST")
            port = os.environ.get("CHROMADB_PORT")
            
            # Use OpenAI embedding function
            self.embedding_function = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.environ.get("OPENAI_API_KEY"),
                model_name="text-embedding-3-small"
            )
            
            # Initialize client (either persistent or in-memory)
            if host and port:
                # Connect to running ChromaDB instance
                logger.info(f"Connecting to ChromaDB at {host}:{port}")
                self.client = chromadb.HttpClient(host=host, port=port)
            else:
                # Use persistent local storage
                os.makedirs(persistent_dir, exist_ok=True)
                logger.info(f"Using persistent ChromaDB at {persistent_dir}")
                self.client = chromadb.PersistentClient(path=persistent_dir)
            
            # Get or create collection
            try:
                self.collection = self.client.get_collection(
                    name=self.collection_name,
                    embedding_function=self.embedding_function
                )
                logger.info(f"Using existing collection: {self.collection_name}")
            except Exception as e:
                logger.info(f"Creating new collection: {self.collection_name}")
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    embedding_function=self.embedding_function
                )
            
            self.initialized = True
            logger.info("Vector memory service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing vector memory service: {e}")
            # Fall back to in-memory client if persistent fails
            if not self.client:
                logger.info("Falling back to in-memory ChromaDB")
                self.client = chromadb.EphemeralClient()
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    embedding_function=self.embedding_function
                )
                self.initialized = True
    
    async def _ensure_initialized(self):
        """Ensure the service is initialized before use"""
        if not self.initialized:
            await self.initialize()
            # Wait for initialization with timeout
            for _ in range(10):
                if self.initialized:
                    break
                await asyncio.sleep(0.5)
            
            if not self.initialized:
                raise Exception("Vector memory service failed to initialize")
    
    async def store_memory(self, memory: Memory) -> Memory:
        """Store a memory with its vector embedding"""
        await self._ensure_initialized()
        
        try:
            # Generate embedding if not provided
            if not memory.embedding and memory.content:
                # This will use the embedding function from chromadb
                # But we don't need to actually generate it manually as ChromaDB will do it
                pass
            
            # Convert metadata to JSON serializable format
            metadata = {}
            if memory.metadata:
                metadata = {k: v for k, v in memory.metadata.items() if v is not None}
                # Convert non-serializable values to strings
                for k, v in metadata.items():
                    if not isinstance(v, (str, int, float, bool, list, dict, type(None))):
                        metadata[k] = str(v)
            
            # Add required fields to metadata
            metadata["type"] = memory.type
            metadata["content"] = memory.content
            metadata["timestamp"] = memory.timestamp
            
            # Add to collection
            self.collection.add(
                ids=[memory.id],
                embeddings=[memory.embedding] if memory.embedding else None,
                metadatas=[metadata]
            )
            
            return memory
        except Exception as e:
            logger.error(f"Error storing memory: {e}")
            raise
    
    async def query_memories(
        self, 
        query: str,
        embedding: Optional[List[float]] = None,
        where: Optional[Dict[str, Any]] = None,
        limit: int = 5,
        threshold: float = 0.1
    ) -> List[MemoryQueryResult]:
        """Find memories related to a query using vector similarity"""
        await self._ensure_initialized()
        
        try:
            # Execute query
            results = self.collection.query(
                query_texts=[query] if not embedding else None,
                query_embeddings=[embedding] if embedding else None,
                n_results=limit,
                where=where
            )
            
            # Format results
            memory_results = []
            
            if not results["ids"] or not results["ids"][0]:
                return []
            
            for i, memory_id in enumerate(results["ids"][0]):
                metadata = results["metadatas"][0][i]
                score = 1.0 - (results["distances"][0][i] if "distances" in results else 0.0)
                
                # Skip if below threshold
                if score < threshold:
                    continue
                
                # Extract fields from metadata
                memory_type = metadata.get("type", MemoryType.KNOWLEDGE)
                content = metadata.get("content", "")
                timestamp = metadata.get("timestamp", int(datetime.now().timestamp() * 1000))
                
                # Remove extracted fields from metadata
                metadata_copy = metadata.copy()
                if "type" in metadata_copy:
                    del metadata_copy["type"]
                if "content" in metadata_copy:
                    del metadata_copy["content"]
                if "timestamp" in metadata_copy:
                    del metadata_copy["timestamp"]
                
                # Get embedding if available
                embedding = None
                if "embeddings" in results and results["embeddings"]:
                    embedding = results["embeddings"][0][i]
                
                # Create memory and result
                memory = Memory(
                    id=memory_id,
                    type=memory_type,
                    content=content,
                    timestamp=timestamp,
                    metadata=metadata_copy,
                    embedding=embedding
                )
                
                memory_results.append(MemoryQueryResult(
                    memory=memory,
                    score=score
                ))
            
            return memory_results
        except Exception as e:
            logger.error(f"Error querying memories: {e}")
            raise
    
    async def get_memories(self, where: Optional[Dict[str, Any]] = None) -> List[Memory]:
        """Get memories matching a filter"""
        await self._ensure_initialized()
        
        try:
            # Get memories from collection
            results = self.collection.get(
                where=where
            )
            
            # Format results
            memories = []
            
            if not results["ids"]:
                return []
            
            for i, memory_id in enumerate(results["ids"]):
                metadata = results["metadatas"][i]
                
                # Extract fields from metadata
                memory_type = metadata.get("type", MemoryType.KNOWLEDGE)
                content = metadata.get("content", "")
                timestamp = metadata.get("timestamp", int(datetime.now().timestamp() * 1000))
                
                # Remove extracted fields from metadata
                metadata_copy = metadata.copy()
                if "type" in metadata_copy:
                    del metadata_copy["type"]
                if "content" in metadata_copy:
                    del metadata_copy["content"]
                if "timestamp" in metadata_copy:
                    del metadata_copy["timestamp"]
                
                # Get embedding if available
                embedding = None
                if "embeddings" in results and results["embeddings"]:
                    embedding = results["embeddings"][i]
                
                # Create memory
                memory = Memory(
                    id=memory_id,
                    type=memory_type,
                    content=content,
                    timestamp=timestamp,
                    metadata=metadata_copy,
                    embedding=embedding
                )
                
                memories.append(memory)
            
            # Sort by timestamp (newest first)
            memories.sort(key=lambda x: x.timestamp, reverse=True)
            
            return memories
        except Exception as e:
            logger.error(f"Error getting memories: {e}")
            raise
    
    async def get_memory_by_id(self, memory_id: str) -> Optional[Memory]:
        """Get a memory by ID"""
        await self._ensure_initialized()
        
        try:
            # Get memory from collection
            results = self.collection.get(
                ids=[memory_id]
            )
            
            if not results["ids"]:
                return None
            
            # Format result
            metadata = results["metadatas"][0]
            
            # Extract fields from metadata
            memory_type = metadata.get("type", MemoryType.KNOWLEDGE)
            content = metadata.get("content", "")
            timestamp = metadata.get("timestamp", int(datetime.now().timestamp() * 1000))
            
            # Remove extracted fields from metadata
            metadata_copy = metadata.copy()
            if "type" in metadata_copy:
                del metadata_copy["type"]
            if "content" in metadata_copy:
                del metadata_copy["content"]
            if "timestamp" in metadata_copy:
                del metadata_copy["timestamp"]
            
            # Get embedding if available
            embedding = None
            if "embeddings" in results and results["embeddings"]:
                embedding = results["embeddings"][0]
            
            # Create memory
            memory = Memory(
                id=memory_id,
                type=memory_type,
                content=content,
                timestamp=timestamp,
                metadata=metadata_copy,
                embedding=embedding
            )
            
            return memory
        except Exception as e:
            logger.error(f"Error getting memory by ID: {e}")
            raise
    
    async def delete_memory(self, memory_id: str) -> bool:
        """Delete a memory by ID"""
        await self._ensure_initialized()
        
        try:
            # Delete memory from collection
            self.collection.delete(
                ids=[memory_id]
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting memory: {e}")
            raise
    
    async def delete_memories(self, where: Optional[Dict[str, Any]] = None) -> bool:
        """Delete memories matching a filter"""
        await self._ensure_initialized()
        
        try:
            # Get matching IDs first
            results = self.collection.get(
                where=where
            )
            
            if not results["ids"]:
                return True
            
            # Delete memory from collection
            self.collection.delete(
                ids=results["ids"]
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting memories: {e}")
            raise

# Create a singleton instance of the vector memory service
vector_memory = VectorMemoryService()

async def add_memory(content: str, metadata: Dict[str, Any]) -> Memory:
    """Add a memory to the vector store"""
    memory_id = f"memory-{uuid.uuid4()}"
    timestamp = int(datetime.now().timestamp() * 1000)
    
    memory_type = metadata.get("type", MemoryType.KNOWLEDGE)
    
    memory = Memory(
        id=memory_id,
        type=memory_type,
        content=content,
        timestamp=timestamp,
        metadata=metadata
    )
    
    return await vector_memory.store_memory(memory)

async def recall_relevant_context(query: str, where: Optional[Dict[str, Any]] = None, limit: int = 5) -> List[MemoryQueryResult]:
    """Recall relevant memories based on a query"""
    return await vector_memory.query_memories(
        query=query,
        where=where,
        limit=limit
    ) 