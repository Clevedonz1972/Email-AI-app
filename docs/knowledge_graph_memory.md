# ASTI Knowledge Graph and Vector Memory

This document outlines the knowledge graph schema, memory types, and integration between vector and graph-based memory systems in ASTI.

## Overview

ASTI uses a hybrid memory system that combines:

1. **Vector Memory** (ChromaDB): For semantic similarity search and fuzzy matching
2. **Knowledge Graph** (Neo4j): For structured relationships, causal reasoning, and temporal events

This hybrid approach allows ASTI to both find content-similar items (vector) and understand how information relates contextually (graph).

## Memory Types

### Vector Memory

Vector memories are stored with embeddings for semantic similarity search:

| Memory Type | Description | Use Cases |
|-------------|-------------|-----------|
| EMAIL | Email content and metadata | Finding similar emails, topic clustering |
| TASK | Task descriptions and status | Finding similar tasks, priority management |
| CONVERSATION | Chat messages and discussions | Context retrieval, topical connections |
| KNOWLEDGE | General facts and information | Q&A, reference material |

### Knowledge Graph Nodes

| Node Type | Properties | Description |
|-----------|------------|-------------|
| Memory | id, type, content, timestamp, metadata | Base node type for all memories |
| Email | sender, recipients, subject, content | Email messages with threading |
| Task | title, description, status, priority | Work items and action points |
| TemporalEvent | event_type, timestamp, description, intensity | Time-based events (stress spikes, etc.) |
| Person | email, name, role | People interacting with the system |

### Knowledge Graph Relationships

| Relationship Type | Properties | Description |
|-------------------|------------|-------------|
| RELATES_TO | strength, context | General relationship between nodes |
| PART_OF | index, timestamp | Hierarchical relationship (email → thread) |
| SENT | timestamp | Who sent an email |
| RECEIVED | timestamp | Who received an email |
| CAUSES | strength, context | Causal relationship |
| ASSIGNED_TO | timestamp, status | Task assignment |
| DEPENDS_ON | criticality | Task dependencies |

## Edge Weights and Relationship Strength

Relationships have weighted edges based on:

1. **Frequency**: How often this relationship is observed
2. **Recency**: How recently this relationship was observed
3. **Explicit Strength**: Directly assigned strength based on context

Edge strength is calculated as:
```
strength = (0.3 * normalized_frequency) + (0.5 * recency) + (0.2 * base_strength)
```

This creates a time-decay model where recent, frequent connections are stronger than old, infrequent ones.

## Reasoning Engine

The reasoning engine traverses the graph to:

1. **Link new content to existing context**
   - Connect emails to threads
   - Connect people to topics
   - Form causal chains

2. **Infer priority and emotional impact**
   - Create temporal reasoning nodes for significant events
   - Track stress levels over time
   - Identify high-priority relationships

3. **Generate explanations**
   - Trace reasoning paths to explain why connections exist
   - Calculate relevance scores
   - Provide evidence-based insights

## Vector vs. Graph Differences

| Feature | Vector Memory | Knowledge Graph |
|---------|---------------|-----------------|
| **Strengths** | • Fast semantic similarity<br>• Handles unstructured data<br>• No schema required | • Structured relationships<br>• Multi-hop reasoning<br>• Causal/temporal tracking |
| **Weaknesses** | • No relationship context<br>• No multi-hop reasoning<br>• Embedding drift | • Requires schema<br>• More complex queries<br>• Structured data only |
| **When to use** | • "Find similar to X"<br>• Topic identification<br>• Initial retrieval | • "How does X relate to Y?"<br>• "Why is X important?"<br>• Context building |

## Time Decay Model

Both systems implement time decay:

1. **Vector Memory**:
   - Recency boost in query results
   - Automatic re-embedding of content after significant time

2. **Knowledge Graph**:
   - Edge strength decay over time
   - Recency property on relationships
   - Temporal event nodes to mark significant time points

## Implementation Details

### Vector Memory Implementation

```typescript
// Create embeddings with OpenAI
const embedding = await embeddingService.generateEmbedding(content, type);

// Store in ChromaDB with metadata
await memoryCollection.add({
  ids: [id],
  embeddings: [embedding],
  metadatas: [{ timestamp, type, ...metadata }]
});

// Query by similarity
const results = await memoryCollection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 10
});
```

### Knowledge Graph Implementation

```typescript
// Create nodes
await knowledgeGraphService.upsertNode({
  id: 'email-123',
  type: MemoryType.EMAIL,
  content: 'Email content...',
  timestamp: Date.now(),
  metadata: { sender, recipients, subject }
});

// Create relationships with strength
await knowledgeGraphService.createRelationship(
  'email-123',
  'thread-456',
  {
    type: 'PART_OF',
    properties: {
      strength: 0.8,
      timestamp: Date.now()
    }
  }
);

// Temporal reasoning
await knowledgeGraphService.createTemporalEvent({
  id: 'event-stress-789',
  event_type: 'stress_spike',
  timestamp: Date.now(),
  description: 'Stress spike from deadline pressure',
  intensity: 8, // 0-10 scale
  related_entities: ['email-123', 'task-456']
});
```

## Scaling Considerations

As the knowledge graph and vector stores grow, consider:

1. **Performance Optimization**:
   - Use Neo4j's index capabilities for faster graph queries
   - Implement embedding caching to reduce OpenAI API calls
   - Consider partitioning data by time periods

2. **Cost Management**:
   - Implement TTL (time-to-live) for old, low-relevance memories
   - Batch embedding generation to minimize API calls
   - Downsample vector dimensions for storage efficiency

3. **Safety & Privacy**:
   - Implement access controls on both graph and vector data
   - Personal data sanitization before storage
   - Regular pruning of sensitive data

## Integration Points

| Component | Integration |
|-----------|-------------|
| Email Processing | 1. Generate embeddings<br>2. Store in vector memory<br>3. Create graph nodes<br>4. Link to threads and people |
| Task Management | 1. Create task nodes<br>2. Link to related emails/context<br>3. Connect to people and deadlines |
| User Interface | 1. Visualize knowledge graph<br>2. Show related memories<br>3. Explain reasoning paths |
| Reasoning Service | 1. Traverse graph for connections<br>2. Query vectors for similar content<br>3. Calculate priority and relevance | 