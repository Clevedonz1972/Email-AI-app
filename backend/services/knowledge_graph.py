"""
Knowledge Graph Service
Handles interaction with Neo4j for graph operations
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel
import neo4j
from neo4j import GraphDatabase
import os
import json
import logging
from datetime import datetime
import asyncio
from enum import Enum

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

class GraphNode(BaseModel):
    id: str
    type: MemoryType
    content: str
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None
    relationships: Optional[List[Dict[str, Any]]] = None

class Relationship(BaseModel):
    type: str
    properties: Optional[Dict[str, Any]] = None

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

class Neo4jService:
    """Service for handling knowledge graph operations with Neo4j"""
    
    def __init__(self):
        """Initialize the Neo4j service"""
        self.driver = None
        self.initialized = False
        self.mock_mode = False
        self._initialize()
    
    def _initialize(self):
        """Initialize the Neo4j driver"""
        try:
            uri = os.environ.get("NEO4J_URI", "bolt://neo4j:7687")
            user = os.environ.get("NEO4J_USER", "neo4j")
            password = os.environ.get("NEO4J_PASSWORD", "password")
            
            logger.info(f"Connecting to Neo4j at {uri}")
            
            try:
                self.driver = neo4j.GraphDatabase.driver(uri, auth=(user, password))
                self.driver.verify_connectivity()
                self.initialized = True
                logger.info("Neo4j service initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Neo4j service: {e}")
                logger.warning("Falling back to mock mode for knowledge graph")
                self.mock_mode = True
                self.initialized = True
        except Exception as e:
            logger.error(f"Error initializing Neo4j service: {e}")
            logger.warning("Falling back to mock mode for knowledge graph")
            self.mock_mode = True
            self.initialized = True
    
    async def create_node(self, memory: Memory) -> str:
        """Create or update a node in the knowledge graph"""
        if self.mock_mode:
            # In mock mode, just return the node ID
            logger.info(f"MOCK: Created node {memory.id} of type {memory.type}")
            return memory.id
            
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                # Convert metadata to JSON serializable format
                metadata = {}
                if memory.metadata:
                    metadata = {k: v for k, v in memory.metadata.items() if v is not None}
                    # Convert non-serializable values to strings
                    for k, v in metadata.items():
                        if not isinstance(v, (str, int, float, bool, list, dict, type(None))):
                            metadata[k] = str(v)
                
                # Merge node (create if not exists, update if exists)
                query = """
                MERGE (n:Memory {id: $id})
                SET n.type = $type,
                    n.content = $content,
                    n.timestamp = $timestamp,
                    n.metadata = $metadata
                RETURN n.id
                """
                
                result = session.run(
                    query,
                    id=memory.id,
                    type=memory.type,
                    content=memory.content,
                    timestamp=memory.timestamp,
                    metadata=metadata
                )
                
                return result.single()[0]
        except Exception as e:
            logger.error(f"Error creating node: {e}")
            raise
    
    async def create_temporal_event(self, event: TemporalEvent, user_id: str) -> str:
        """Create a temporal reasoning node in the knowledge graph"""
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                # Create temporal event node
                query = """
                CREATE (e:TemporalEvent {
                    id: $id,
                    event_type: $event_type,
                    timestamp: $timestamp,
                    description: $description,
                    intensity: $intensity,
                    duration: $duration,
                    user_id: $user_id
                })
                RETURN e.id
                """
                
                result = session.run(
                    query,
                    id=event.id,
                    event_type=event.event_type,
                    timestamp=event.timestamp,
                    description=event.description,
                    intensity=event.intensity,
                    duration=event.duration or 0,
                    user_id=user_id
                )
                
                event_id = result.single()[0]
                
                # Connect temporal event to related entities
                for entity_id in event.related_entities:
                    query = """
                    MATCH (e:TemporalEvent {id: $event_id})
                    MATCH (n:Memory {id: $entity_id})
                    CREATE (e)-[r:RELATES_TO {
                        strength: $strength,
                        timestamp: $timestamp
                    }]->(n)
                    RETURN r
                    """
                    
                    session.run(
                        query,
                        event_id=event.id,
                        entity_id=entity_id,
                        strength=event.intensity / 10,  # Normalize to 0-1 range
                        timestamp=event.timestamp
                    )
                
                return event_id
        except Exception as e:
            logger.error(f"Error creating temporal event: {e}")
            raise
    
    async def create_edge(
        self,
        source_id: str,
        target_id: str,
        relationship_type: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Create a relationship between two nodes in the knowledge graph"""
        if self.mock_mode:
            # In mock mode, just return True
            logger.info(f"MOCK: Created edge between {source_id} and {target_id} of type {relationship_type}")
            return True
            
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                # Check if relationship already exists
                check_query = f"""
                MATCH (source:Memory {{id: $source_id}})-[r:{relationship_type}]->(target:Memory {{id: $target_id}})
                RETURN r
                """
                
                check_result = session.run(
                    check_query,
                    source_id=source_id,
                    target_id=target_id
                )
                
                # Default properties
                now = int(datetime.now().timestamp() * 1000)
                default_props = {
                    "timestamp": now,
                    "strength": 0.5,
                    "frequency": 1,
                    "recency": 1.0
                }
                
                # If relationship exists, increment frequency
                record = check_result.single() if check_result.peek() else None
                if record:
                    rel = record["r"]
                    # Get current frequency or default to 0
                    frequency = rel.get("frequency", 0) + 1
                    default_props["frequency"] = frequency
                
                # Merge with provided properties
                if not properties:
                    properties = {}
                props = {**default_props, **properties}
                
                # Calculate overall relationship strength if not explicitly provided
                if "strength" not in properties:
                    # Normalize frequency (logarithmic scale to avoid extreme values)
                    freq = props["frequency"]
                    normalized_freq = min(1, (1 if freq <= 1 else (1 + 0.1 * (freq - 1))))
                    
                    # Combine frequency (30%), recency (50%), and base strength (20%)
                    recency = props.get("recency", 1.0)
                    base_strength = default_props["strength"]
                    props["strength"] = 0.3 * normalized_freq + 0.5 * recency + 0.2 * base_strength
                
                # Create or update relationship
                query = f"""
                MATCH (source:Memory {{id: $source_id}})
                MATCH (target:Memory {{id: $target_id}})
                MERGE (source)-[r:{relationship_type}]->(target)
                SET r = $properties
                RETURN r
                """
                
                session.run(
                    query,
                    source_id=source_id,
                    target_id=target_id,
                    properties=props
                )
                
                return True
        except Exception as e:
            logger.error(f"Error creating edge: {e}")
            raise
    
    async def get_node(self, node_id: str) -> Optional[GraphNode]:
        """Get a node by ID"""
        if self.mock_mode:
            # In mock mode, return None
            logger.info(f"MOCK: Node {node_id} not found (mock mode)")
            return None
            
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                query = """
                MATCH (n {id: $id})
                RETURN n
                """
                
                result = session.run(query, id=node_id)
                
                record = result.single() if result.peek() else None
                if not record:
                    return None
                
                node = record["n"]
                
                # Extract properties
                props = dict(node.items())
                
                # Create GraphNode
                return GraphNode(
                    id=props["id"],
                    type=props.get("type", MemoryType.KNOWLEDGE),
                    content=props.get("content", ""),
                    timestamp=props.get("timestamp", int(datetime.now().timestamp() * 1000)),
                    metadata=props.get("metadata", {})
                )
        except Exception as e:
            logger.error(f"Error getting node: {e}")
            raise
    
    async def get_related_nodes(
        self,
        node_id: str,
        relationship_types: Optional[List[str]] = None,
        limit: int = 10,
        min_strength: float = 0.0
    ) -> List[GraphNode]:
        """Find related nodes for a given node"""
        if self.mock_mode:
            # In mock mode, return empty list or mock data
            logger.info(f"MOCK: Returning empty list for get_related_nodes({node_id})")
            return []
            
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                rel_types = relationship_types if relationship_types else ["*"]
                rel_type_str = "|".join(f"`{t}`" for t in rel_types)
                
                query = f"""
                MATCH (source {{id: $node_id}})
                MATCH (source)-[r:{rel_type_str}]->(target)
                WHERE r.strength >= $min_strength
                RETURN target, r
                ORDER BY r.strength DESC, r.timestamp DESC
                LIMIT $limit
                """
                
                result = session.run(
                    query,
                    node_id=node_id,
                    min_strength=min_strength,
                    limit=limit
                )
                
                nodes = []
                
                for record in result:
                    target = record["target"]
                    relationship = record["r"]
                    
                    # Extract properties
                    target_props = dict(target.items())
                    rel_props = dict(relationship.items())
                    
                    # Create GraphNode
                    node = GraphNode(
                        id=target_props["id"],
                        type=target_props.get("type", MemoryType.KNOWLEDGE),
                        content=target_props.get("content", ""),
                        timestamp=target_props.get("timestamp", int(datetime.now().timestamp() * 1000)),
                        metadata=target_props.get("metadata", {}),
                        relationships=[{
                            "targetId": node_id,
                            "relationship": {
                                "type": relationship.type,
                                "properties": rel_props
                            }
                        }]
                    )
                    
                    nodes.append(node)
                
                return nodes
        except Exception as e:
            logger.error(f"Error getting related nodes: {e}")
            raise
    
    async def get_path(
        self,
        source_id: str,
        target_id: str,
        relationship_types: Optional[List[str]] = None,
        max_length: int = 5
    ) -> List[GraphNode]:
        """Find the shortest path between two nodes"""
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                rel_types = relationship_types if relationship_types else ["*"]
                rel_type_str = "|".join(f"`{t}`" for t in rel_types)
                
                query = f"""
                MATCH path = shortestPath(
                    (source {{id: $source_id}})-[r:{rel_type_str}*1..{max_length}]->(target {{id: $target_id}})
                )
                RETURN nodes(path) as nodes, relationships(path) as relationships
                """
                
                result = session.run(
                    query,
                    source_id=source_id,
                    target_id=target_id
                )
                
                record = result.single() if result.peek() else None
                if not record:
                    return []
                
                nodes = record["nodes"]
                relationships = record["relationships"]
                
                # Format nodes and relationships
                formatted_nodes = []
                
                for i, node in enumerate(nodes):
                    # Extract properties
                    props = dict(node.items())
                    
                    # Create relationship info for this node to the next node
                    node_relationships = None
                    if i < len(relationships):
                        rel = relationships[i]
                        rel_props = dict(rel.items())
                        
                        node_relationships = [{
                            "targetId": nodes[i + 1]["id"],
                            "relationship": {
                                "type": rel.type,
                                "properties": rel_props
                            }
                        }]
                    
                    # Create GraphNode
                    formatted_node = GraphNode(
                        id=props["id"],
                        type=props.get("type", MemoryType.KNOWLEDGE),
                        content=props.get("content", ""),
                        timestamp=props.get("timestamp", int(datetime.now().timestamp() * 1000)),
                        metadata=props.get("metadata", {}),
                        relationships=node_relationships
                    )
                    
                    formatted_nodes.append(formatted_node)
                
                return formatted_nodes
        except Exception as e:
            logger.error(f"Error getting path: {e}")
            raise
    
    async def calculate_relevance_score(
        self,
        entity_id: str,
        target_type: str,
        relationship_types: Optional[List[str]] = None,
        max_depth: int = 3
    ) -> float:
        """Calculate relevance score for an entity based on its connections"""
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                rel_types = relationship_types if relationship_types else ["*"]
                rel_type_str = "|".join(f"`{t}`" for t in rel_types)
                
                query = f"""
                MATCH path = (source {{id: $entity_id}})-[r:{rel_type_str}*1..{max_depth}]->(target)
                WHERE target.type = $target_type
                WITH path,
                     relationships(path) as rels,
                     length(path) as pathLength
                WITH path,
                     rels,
                     pathLength,
                     reduce(s = 1.0, rel in rels | s * rel.strength) as pathStrength
                RETURN sum(pathStrength / (pathLength ^ 2)) as relevanceScore
                """
                
                result = session.run(
                    query,
                    entity_id=entity_id,
                    target_type=target_type
                )
                
                record = result.single() if result.peek() else None
                if not record or record["relevanceScore"] is None:
                    return 0.0
                
                return float(record["relevanceScore"])
        except Exception as e:
            logger.error(f"Error calculating relevance score: {e}")
            return 0.0
    
    async def perform_reasoning(
        self,
        source_id: str,
        target_id: str,
        max_length: int = 5,
        min_strength: float = 0.2
    ) -> ReasoningPath:
        """Perform reasoning by finding paths between entities and explaining the connections"""
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                # Find the most relevant path based on relationship strength
                query = f"""
                MATCH path = (source {{id: $source_id}})-[rels*1..{max_length}]->(target {{id: $target_id}})
                WHERE all(r in rels WHERE r.strength >= $min_strength)
                WITH path,
                     relationships(path) as rels,
                     nodes(path) as nodes,
                     reduce(s = 1.0, rel in relationships(path) | s * rel.strength) as pathStrength
                RETURN path, nodes, rels, pathStrength
                ORDER BY pathStrength DESC
                LIMIT 1
                """
                
                result = session.run(
                    query,
                    source_id=source_id,
                    target_id=target_id,
                    min_strength=min_strength
                )
                
                record = result.single() if result.peek() else None
                if not record:
                    return ReasoningPath(
                        path=[],
                        relationships=[],
                        score=0,
                        explanation=f"No connection found between {source_id} and {target_id}"
                    )
                
                nodes = record["nodes"]
                relationships = record["rels"]
                path_strength = record["pathStrength"]
                
                # Format nodes
                formatted_nodes = []
                for node in nodes:
                    props = dict(node.items())
                    
                    formatted_node = GraphNode(
                        id=props["id"],
                        type=props.get("type", MemoryType.KNOWLEDGE),
                        content=props.get("content", ""),
                        timestamp=props.get("timestamp", int(datetime.now().timestamp() * 1000)),
                        metadata=props.get("metadata", {})
                    )
                    
                    formatted_nodes.append(formatted_node)
                
                # Format relationships
                formatted_rels = []
                for rel in relationships:
                    rel_props = dict(rel.items())
                    
                    formatted_rel = Relationship(
                        type=rel.type,
                        properties=rel_props
                    )
                    
                    formatted_rels.append(formatted_rel)
                
                # Generate explanation
                explanation = f"Connection found between {formatted_nodes[0].id} and {formatted_nodes[-1].id} with strength {path_strength:.2f}: "
                
                # Add path details to explanation
                for i in range(len(formatted_nodes) - 1):
                    current_node = formatted_nodes[i]
                    next_node = formatted_nodes[i + 1]
                    rel = formatted_rels[i]
                    
                    explanation += f"{current_node.type}({current_node.id}) -[{rel.type}]-> "
                    
                    if i == len(formatted_nodes) - 2:
                        explanation += f"{next_node.type}({next_node.id})"
                
                return ReasoningPath(
                    path=formatted_nodes,
                    relationships=formatted_rels,
                    score=float(path_strength),
                    explanation=explanation
                )
        except Exception as e:
            logger.error(f"Error performing reasoning: {e}")
            return ReasoningPath(
                path=[],
                relationships=[],
                score=0,
                explanation=f"Error: Failed to perform reasoning between {source_id} and {target_id}"
            )
    
    async def delete_node(self, node_id: str) -> bool:
        """Delete a node and its relationships"""
        if self.mock_mode:
            # In mock mode, return success
            logger.info(f"MOCK: Deleted node {node_id}")
            return True
            
        await self._ensure_initialized()
        
        try:
            with self.driver.session() as session:
                query = """
                MATCH (n {id: $node_id})
                DETACH DELETE n
                """
                
                session.run(query, node_id=node_id)
                return True
        except Exception as e:
            logger.error(f"Error deleting node: {e}")
            raise
    
    async def close(self):
        """Close the Neo4j driver"""
        if self.driver:
            self.driver.close()

# Create singleton instance
knowledge_graph_service = Neo4jService() 