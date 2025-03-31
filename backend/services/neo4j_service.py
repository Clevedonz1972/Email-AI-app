from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from neo4j import GraphDatabase, Driver
from backend.models.knowledge_graph import Node, Edge, NodeType, EdgeType
from backend.utils.logger import logger
from backend.config import settings


class Neo4jService:
    """
    Service for interacting with Neo4j knowledge graph.
    Handles all CRUD operations for nodes and edges.
    """
    
    def __init__(self):
        """Initialize Neo4j connection"""
        self.driver: Optional[Driver] = None
        self._connect()
    
    def _connect(self):
        """Establish connection to Neo4j database"""
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            logger.info("Successfully connected to Neo4j database")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {str(e)}")
            raise
    
    async def create_node(self, node: Node) -> Node:
        """Create a new node in the knowledge graph"""
        try:
            with self.driver.session() as session:
                # Create node with properties
                result = session.run(
                    """
                    CREATE (n:%s {
                        id: $id,
                        type: $type,
                        properties: $properties,
                        created_at: $created_at,
                        updated_at: $updated_at
                    })
                    RETURN n
                    """,
                    labels=node.type.value,
                    id=node.id,
                    type=node.type.value,
                    properties=node.properties,
                    created_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat()
                )
                
                record = result.single()
                if not record:
                    raise ValueError("Failed to create node")
                
                return self._create_node_from_record(record["n"])
                
        except Exception as e:
            logger.error(f"Failed to create node: {str(e)}")
            raise
    
    async def create_edge(self, edge: Edge) -> Edge:
        """Create a new edge between nodes"""
        try:
            with self.driver.session() as session:
                # Create edge with properties
                result = session.run(
                    """
                    MATCH (source {id: $source_id})
                    MATCH (target {id: $target_id})
                    CREATE (source)-[r:%s {
                        id: $id,
                        type: $type,
                        properties: $properties,
                        created_at: $created_at
                    }]->(target)
                    RETURN r
                    """,
                    relationship_type=edge.type.value,
                    source_id=edge.source_id,
                    target_id=edge.target_id,
                    id=edge.id,
                    type=edge.type.value,
                    properties=edge.properties,
                    created_at=datetime.utcnow().isoformat()
                )
                
                record = result.single()
                if not record:
                    raise ValueError("Failed to create edge")
                
                return self._create_edge_from_record(record["r"])
                
        except Exception as e:
            logger.error(f"Failed to create edge: {str(e)}")
            raise
    
    async def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (n)
                    WHERE n.id = $id
                    RETURN n
                    """,
                    id=node_id
                )
                
                record = result.single()
                if not record:
                    return None
                
                return self._create_node_from_record(record["n"])
                
        except Exception as e:
            logger.error(f"Failed to get node: {str(e)}")
            raise
    
    async def get_related_nodes(self, node_id: str, relationship_types: Optional[List[str]] = None) -> List[Node]:
        """Get nodes related to a given node"""
        try:
            with self.driver.session() as session:
                # Build relationship type filter
                rel_filter = ""
                if relationship_types:
                    rel_filter = f":{':|'.join(relationship_types)}"
                
                result = session.run(
                    f"""
                    MATCH (source {{id: $id}})-[r{rel_filter}]->(target)
                    RETURN target
                    """,
                    id=node_id
                )
                
                return [self._create_node_from_record(record["target"]) for record in result]
                
        except Exception as e:
            logger.error(f"Failed to get related nodes: {str(e)}")
            raise
    
    async def get_path(self, source_id: str, target_id: str) -> List[Dict[str, Any]]:
        """Find the shortest path between two nodes"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH path = shortestPath(
                        (source {id: $source_id})-[*]-(target {id: $target_id})
                    )
                    RETURN path
                    """,
                    source_id=source_id,
                    target_id=target_id
                )
                
                record = result.single()
                if not record:
                    return []
                
                path = record["path"]
                return self._format_path(path)
                
        except Exception as e:
            logger.error(f"Failed to get path: {str(e)}")
            raise
    
    async def update_node(self, node: Node) -> Node:
        """Update an existing node"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (n {id: $id})
                    SET n.properties = $properties,
                        n.updated_at = $updated_at
                    RETURN n
                    """,
                    id=node.id,
                    properties=node.properties,
                    updated_at=datetime.utcnow().isoformat()
                )
                
                record = result.single()
                if not record:
                    raise ValueError("Failed to update node")
                
                return self._create_node_from_record(record["n"])
                
        except Exception as e:
            logger.error(f"Failed to update node: {str(e)}")
            raise
    
    async def delete_node(self, node_id: str) -> bool:
        """Delete a node and its relationships"""
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (n {id: $id})
                    DETACH DELETE n
                    RETURN count(n) as deleted
                    """,
                    id=node_id
                )
                
                record = result.single()
                return record["deleted"] > 0
                
        except Exception as e:
            logger.error(f"Failed to delete node: {str(e)}")
            raise
    
    def _create_node_from_record(self, record: Any) -> Node:
        """Convert a Neo4j record to a Node object"""
        node_type = NodeType(record["type"])
        return Node(
            id=record["id"],
            type=node_type,
            properties=record["properties"]
        )
    
    def _create_edge_from_record(self, record: Any) -> Edge:
        """Convert a Neo4j record to an Edge object"""
        edge_type = EdgeType(record["type"])
        return Edge(
            id=record["id"],
            type=edge_type,
            source_id=record["source_id"],
            target_id=record["target_id"],
            properties=record["properties"]
        )
    
    def _format_path(self, path: Any) -> List[Dict[str, Any]]:
        """Format a Neo4j path into a list of nodes and relationships"""
        formatted_path = []
        
        for segment in path:
            if "start_node" in segment:
                formatted_path.append({
                    "type": "node",
                    "data": self._create_node_from_record(segment["start_node"])
                })
            
            if "relationship" in segment:
                formatted_path.append({
                    "type": "relationship",
                    "data": self._create_edge_from_record(segment["relationship"])
                })
        
        return formatted_path
    
    async def close(self):
        """Close the Neo4j connection"""
        try:
            if self.driver:
                self.driver.close()
                logger.info("Closed Neo4j connection")
        except Exception as e:
            logger.error(f"Failed to close Neo4j connection: {str(e)}")
            raise


# Create singleton instance
neo4j_service = Neo4jService() 