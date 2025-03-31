import OpenAI from 'openai';
import { MemoryType } from './memoryService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  type: MemoryType;
  metadata?: Record<string, any>;
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private model: string = 'text-embedding-3-small';
  private batchSize: number = 10;

  private constructor() {}

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Generate embeddings for a single text
   */
  async generateEmbedding(text: string, type: MemoryType, metadata?: Record<string, any>): Promise<EmbeddingResult> {
    try {
      const response = await openai.embeddings.create({
        model: this.model,
        input: text,
      });

      return {
        embedding: response.data[0].embedding,
        text,
        type,
        metadata
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateBatchEmbeddings(texts: string[], type: MemoryType, metadata?: Record<string, any>): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      
      try {
        const response = await openai.embeddings.create({
          model: this.model,
          input: batch,
        });

        const batchResults = response.data.map((item, index) => ({
          embedding: item.embedding,
          text: batch[index],
          type,
          metadata: metadata ? { ...metadata, batchIndex: i + index } : undefined
        }));

        results.push(...batchResults);
      } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw new Error('Failed to generate batch embeddings');
      }
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));

    return dotProduct / (magnitude1 * magnitude2);
  }
}

export const embeddingService = EmbeddingService.getInstance(); 