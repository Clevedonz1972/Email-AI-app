# ASTI Vector Memory Implementation Plan

This document outlines the plan for implementing vector memory storage in ASTI using ChromaDB.

## Overview

ASTI needs a robust memory system to:
1. Store and retrieve semantic information about emails, tasks, and conversations
2. Find relevant past contexts for current requests
3. Build a knowledge graph of user interactions over time
4. Provide a foundation for intelligent recommendations

## Phase 1: Local ChromaDB Implementation

### 1.1 Setup

We'll begin with a local ChromaDB implementation in the app:

```typescript
// Initial implementation will use in-memory ChromaDB with persistence to localStorage
import { ChromaClient } from 'chromadb';

const chroma = new ChromaClient();
const collection = await chroma.createCollection({ name: "asti_memory" });
```

### 1.2 Memory Types

We'll store different types of memories:
- **Email Memories**: Important emails, replies, and their contexts
- **Task Memories**: Tasks, their status changes, and completion details
- **Conversation Memories**: Interactions between the user and ASTI
- **Knowledge Memories**: Facts, preferences, and learned information about the user

### 1.3 Memory Schema

Each memory item will follow this schema:

```typescript
interface VectorMemoryItem {
  id: string;               // Unique identifier
  type: MemoryType;         // Email, Task, Conversation, Knowledge
  text: string;             // Full text content
  embedding: number[];      // Vector embedding (from OpenAI)
  metadata: {
    timestamp: number;      // When it was created/happened
    category?: string;      // Optional categorization
    importance: number;     // 0-1 scale of importance
    source: string;         // Where this memory came from
    references?: string[];  // IDs of related memories
  };
}
```

## Phase 2: OpenAI Integration for Embeddings

### 2.1 Embedding Service

We'll create an embedding service to generate vector representations:

```typescript
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data.data[0].embedding;
}
```

### 2.2 Memory Storage Flow

The process for storing memories:
1. Capture important information (email, task, etc.)
2. Generate embedding using OpenAI
3. Store in ChromaDB with metadata
4. Update references if needed

## Phase 3: Memory Retrieval and Context Enrichment

### 3.1 Query Interface

We'll create functions to query the memory:

```typescript
async function findSimilarMemories(text: string, limit = 5) {
  const queryEmbedding = await generateEmbedding(text);
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
  });
  return results;
}
```

### 3.2 Context Enrichment

When the user makes a request:
1. Generate embedding for the request
2. Find similar memories in ChromaDB
3. Add relevant context to the prompt
4. Send enriched prompt to OpenAI for response

## Phase 4: Long-term Persistence

### 4.1 Backend Storage

Eventually, move from localStorage to server-side storage:
- Set up ChromaDB on backend server
- Create API endpoints for memory operations
- Implement authentication and user-specific collections

### 4.2 Memory Management

Implement strategies for memory management:
- Importance ranking for retention decisions
- Memory consolidation (combining similar memories)
- Forgetting mechanisms (removing or archiving old memories)

## Implementation Timeline

| Phase | Task | Timeline |
|-------|------|----------|
| 1     | Local ChromaDB Setup | Week 1 |
| 1     | Memory Types & Schema | Week 1 |
| 2     | OpenAI Embedding | Week 2 |
| 2     | Memory Storage Implementation | Week 2 |
| 3     | Query Interface | Week 3 |
| 3     | Context Enrichment | Week 3 |
| 4     | Backend Persistence | Week 4-5 |
| 4     | Memory Management | Week 5-6 |

## Future Considerations

- **Semantic Network**: Building connections between memories to form a knowledge graph
- **Memory Summarization**: Creating higher-level memories from multiple related memories
- **On-device Embeddings**: Exploring options for generating embeddings locally
- **User Control**: Interface for users to view, edit, and delete their memories 