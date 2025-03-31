import axios from 'axios';
import { Memory, MemoryType } from './memoryService';

export interface Relationship {
  type: string;
  properties?: RelationshipProperties;
}

export interface GraphNode {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
  relationships?: Array<{
    targetId: string;
    relationship: Relationship;
  }>;
}

export interface RelationshipProperties {
  strength?: number;
  timestamp?: number;
  relevance?: number;
  context?: string;
  frequency?: number;
  recency?: number;
  tone?: string;
  [key: string]: any;
}

export interface TemporalEvent {
  id: string;
  event_type: string;
  timestamp: number;
  description: string;
  intensity: number;
  duration?: number;
  related_entities: string[];
}

export interface ReasoningPath {
  path: GraphNode[];
  relationships: Relationship[];
  score: number;
  explanation: string;
}

class KnowledgeGraphService {
  private static instance: KnowledgeGraphService;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
  }

  public static getInstance(): KnowledgeGraphService {
    if (!KnowledgeGraphService.instance) {
      KnowledgeGraphService.instance = new KnowledgeGraphService();
    }
    return KnowledgeGraphService.instance;
  }

  /**
   * Create or update a node in the knowledge graph
   */
  async upsertNode(memory: Memory): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/graph/node`, memory);
    } catch (error) {
      console.error('Error upserting node:', error);
      throw new Error('Failed to upsert node in knowledge graph');
    }
  }

  /**
   * Create a temporal reasoning node (e.g., "stress spike on March 10th")
   */
  async createTemporalEvent(event: TemporalEvent): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/graph/temporal-event`, event);
    } catch (error) {
      console.error('Error creating temporal event:', error);
      throw new Error('Failed to create temporal event in knowledge graph');
    }
  }

  /**
   * Create a relationship between two memories with edge weights
   */
  async createRelationship(
    sourceId: string,
    targetId: string,
    relationship: Relationship
  ): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/graph/relationship`, {
        sourceId,
        targetId,
        relationship
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw new Error('Failed to create relationship in knowledge graph');
    }
  }

  /**
   * Find related memories for a given memory
   */
  async findRelatedMemories(
    memoryId: string,
    options: {
      relationshipTypes?: string[];
      limit?: number;
      minStrength?: number;
    } = {}
  ): Promise<GraphNode[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/graph/related-memories/${memoryId}`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Error finding related memories:', error);
      throw new Error('Failed to find related memories');
    }
  }

  /**
   * Find the shortest path between two memories
   */
  async findPath(
    sourceId: string,
    targetId: string,
    options: {
      relationshipTypes?: string[];
      maxLength?: number;
    } = {}
  ): Promise<GraphNode[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/graph/path`, {
        params: {
          sourceId,
          targetId,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error finding path:', error);
      throw new Error('Failed to find path between nodes');
    }
  }

  /**
   * Calculate relevance score for an entity based on its connections
   */
  async calculateRelevanceScore(
    entityId: string,
    targetType: string,
    options: {
      relationshipTypes?: string[];
      maxDepth?: number;
    } = {}
  ): Promise<number> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/graph/relevance-score`, {
        params: {
          entityId,
          targetType,
          ...options
        }
      });
      return response.data.score;
    } catch (error) {
      console.error('Error calculating relevance score:', error);
      return 0;
    }
  }

  /**
   * Perform reasoning by finding paths between entities and explaining the connections
   */
  async performReasoning(
    sourceId: string,
    targetId: string,
    options: {
      maxLength?: number;
      minStrength?: number;
    } = {}
  ): Promise<ReasoningPath> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/graph/reasoning`, {
        params: {
          sourceId,
          targetId,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error performing reasoning:', error);
      return {
        path: [],
        relationships: [],
        score: 0,
        explanation: `Error: Failed to perform reasoning between ${sourceId} and ${targetId}`
      };
    }
  }

  /**
   * Delete a node and its relationships
   */
  async deleteNode(memoryId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiBaseUrl}/graph/node/${memoryId}`);
    } catch (error) {
      console.error('Error deleting node:', error);
      throw new Error('Failed to delete node from knowledge graph');
    }
  }
}

export const knowledgeGraphService = KnowledgeGraphService.getInstance(); 