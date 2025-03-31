/**
 * Memory Service - Handles vector storage and semantic memory
 * Uses API calls to backend ChromaDB service, with localStorage fallback for development
 */

import axios from 'axios';
import { embeddingService, EmbeddingResult } from './embeddingService';

export enum MemoryType {
  EMAIL = 'email',
  TASK = 'task',
  CONVERSATION = 'conversation',
  KNOWLEDGE = 'knowledge'
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface MemoryQueryResult {
  memory: Memory;
  score: number;
}

interface LocalStorageData {
  ids: string[];
  embeddings: number[][];
  metadatas: Record<string, any>[];
}

interface IndexDistance {
  index: number;
  distance: number;
}

class MemoryService {
  private localStorageKey: string = 'asti_memory_collection';
  private apiBaseUrl: string;
  private useLocalStorage: boolean = false;
  
  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
    // Check if we're in development mode with no backend
    this.useLocalStorage = process.env.NODE_ENV === 'development' && 
                          (!process.env.REACT_APP_USE_BACKEND || process.env.REACT_APP_USE_BACKEND === 'false');
    
    if (this.useLocalStorage) {
      console.log('Using localStorage for memory service (development mode)');
    } else {
      console.log('Using backend API for memory service');
    }
  }
  
  /**
   * Load memory collection from localStorage (fallback for development)
   */
  private loadFromLocalStorage(): LocalStorageData {
    const storedData = localStorage.getItem(this.localStorageKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return {
      ids: [],
      embeddings: [],
      metadatas: []
    };
  }
  
  /**
   * Save memory collection to localStorage (fallback for development)
   */
  private saveToLocalStorage(data: LocalStorageData): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }
  
  /**
   * Calculate cosine similarity between two vectors (for local implementation)
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * Store a new memory with vector embedding
   */
  async storeMemory(memory: Omit<Memory, 'id' | 'timestamp' | 'embedding'>): Promise<Memory> {
    const id = `memory-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();
    
    // Generate embedding for the memory content
    const embeddingResult = await embeddingService.generateEmbedding(
      memory.content,
      memory.type,
      memory.metadata
    );
    
    const newMemory: Memory = {
      ...memory,
      id,
      timestamp,
      embedding: embeddingResult.embedding
    };
    
    if (this.useLocalStorage) {
      // Local storage fallback implementation
      const existingData = this.loadFromLocalStorage();
      
      existingData.ids.push(id);
      existingData.embeddings.push(embeddingResult.embedding);
      existingData.metadatas.push({
        type: memory.type,
        content: memory.content,
        timestamp,
        ...(memory.metadata || {})
      });
      
      this.saveToLocalStorage(existingData);
    } else {
      // Use backend API
      try {
        await axios.post(`${this.apiBaseUrl}/vector/memory`, newMemory);
      } catch (error) {
        console.error('Error storing memory on backend:', error);
        throw new Error('Failed to store memory');
      }
    }
    
    return newMemory;
  }
  
  /**
   * Find memories related to a query using vector similarity
   */
  async findRelevantMemories(query: string, options: {
    type?: MemoryType;
    limit?: number;
    threshold?: number;
  } = {}): Promise<MemoryQueryResult[]> {
    const { 
      type, 
      limit = 5, 
      threshold = 0.1 
    } = options;
    
    // Generate embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query, MemoryType.KNOWLEDGE);
    
    if (this.useLocalStorage) {
      // Local implementation using localStorage
      const existingData = this.loadFromLocalStorage();
      
      // Filter by type if provided
      let filteredIndices = existingData.ids.map((_: string, index: number) => index);
      if (type) {
        filteredIndices = filteredIndices.filter((index: number) => {
          const metadata = existingData.metadatas[index];
          return metadata.type === type;
        });
      }
      
      // Calculate distances
      const results: IndexDistance[] = filteredIndices.map((index: number) => {
        const embedding = existingData.embeddings[index];
        const distance = this.calculateCosineSimilarity(queryEmbedding.embedding, embedding);
        return { index, distance };
      });
      
      // Sort by distance (higher is better for cosine similarity)
      results.sort((a: IndexDistance, b: IndexDistance) => b.distance - a.distance);
      
      // Take top n results
      const topResults = results.slice(0, limit);
      
      // Filter by threshold and format results
      return topResults
        .filter((result: IndexDistance) => result.distance >= threshold)
        .map((result: IndexDistance) => ({
          memory: {
            id: existingData.ids[result.index],
            type: existingData.metadatas[result.index].type as MemoryType,
            content: existingData.metadatas[result.index].content,
            timestamp: existingData.metadatas[result.index].timestamp,
            metadata: existingData.metadatas[result.index],
            embedding: existingData.embeddings[result.index]
          },
          score: result.distance
        }));
    } else {
      // Use backend API
      try {
        const response = await axios.post(`${this.apiBaseUrl}/vector/query`, {
          query,
          embedding: queryEmbedding.embedding,
          options: {
            type,
            limit,
            threshold
          }
        });
        
        return response.data;
      } catch (error) {
        console.error('Error finding relevant memories:', error);
        return [];
      }
    }
  }
  
  /**
   * Get all memories of a specific type
   */
  async getMemoriesByType(type: MemoryType): Promise<Memory[]> {
    if (this.useLocalStorage) {
      // Local implementation using localStorage
      const existingData = this.loadFromLocalStorage();
      
      // Filter by type
      const filteredIndices = existingData.ids.map((_: string, index: number) => index)
        .filter((index: number) => existingData.metadatas[index].type === type);
      
      // Format results
      return filteredIndices.map((index: number) => ({
        id: existingData.ids[index],
        type: existingData.metadatas[index].type as MemoryType,
        content: existingData.metadatas[index].content,
        timestamp: existingData.metadatas[index].timestamp,
        metadata: existingData.metadatas[index],
        embedding: existingData.embeddings[index]
      })).sort((a: Memory, b: Memory) => b.timestamp - a.timestamp);
    } else {
      // Use backend API
      try {
        const response = await axios.get(`${this.apiBaseUrl}/vector/memories/${type}`);
        return response.data;
      } catch (error) {
        console.error('Error getting memories by type:', error);
        return [];
      }
    }
  }
  
  /**
   * Delete a memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    if (this.useLocalStorage) {
      // Local implementation using localStorage
      const existingData = this.loadFromLocalStorage();
      
      const index = existingData.ids.indexOf(id);
      if (index === -1) {
        return false;
      }
      
      // Remove the memory
      existingData.ids.splice(index, 1);
      existingData.embeddings.splice(index, 1);
      existingData.metadatas.splice(index, 1);
      
      this.saveToLocalStorage(existingData);
      return true;
    } else {
      // Use backend API
      try {
        await axios.delete(`${this.apiBaseUrl}/vector/memory/${id}`);
        return true;
      } catch (error) {
        console.error('Error deleting memory:', error);
        return false;
      }
    }
  }
  
  /**
   * Clear all memories
   */
  async clearMemories(): Promise<void> {
    if (this.useLocalStorage) {
      // Local implementation using localStorage
      this.saveToLocalStorage({
        ids: [],
        embeddings: [],
        metadatas: []
      });
    } else {
      // Use backend API
      try {
        await axios.delete(`${this.apiBaseUrl}/vector/memories`);
      } catch (error) {
        console.error('Error clearing memories:', error);
      }
    }
  }
}

// Export a singleton instance
export const memoryService = new MemoryService();

export default memoryService; 