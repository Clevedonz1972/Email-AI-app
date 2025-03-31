# ASTI AI Tooling Decisions

This document tracks decisions made regarding AI tools, libraries, and services for the ASTI assistant.

## Core Components

### Vector Database: ChromaDB

**Decision:** We will use ChromaDB for vector storage and similarity search.

**Rationale:**
- Open-source with good community support
- Easy to deploy (can run embedded in-process or as a separate service)
- Python-native API that integrates well with our backend
- Supports hybrid search (keywords + vectors)
- Low operational overhead
- Good developer experience

**Alternatives Considered:**
- Weaviate: More features but higher operational complexity
- Pinecone: Great performance but requires external API calls and has usage costs
- Milvus: Powerful but higher operational complexity

### Knowledge Graph: Neo4j

**Decision:** We will use Neo4j for relationship modeling and knowledge graph storage.

**Rationale:**
- Industry standard for graph databases
- Cypher query language is expressive and readable
- Visualization tools built-in
- Available as embedded DB or managed service
- Strong community and documentation
- Free tier available for development

**Alternatives Considered:**
- TerminusDB: Interesting version control features but smaller community
- TigerGraph: More enterprise-focused
- Custom solution: Would require significant development time

### Embedding Model: OpenAI text-embedding-3-small

**Decision:** We will use OpenAI's text-embedding-3-small for generating vector embeddings.

**Rationale:**
- Cost-effective ($0.02/million tokens)
- High quality embeddings with 1536 dimensions
- Strong performance on semantic search tasks
- Simple API integration
- Consistent with our use of other OpenAI models

**Alternatives Considered:**
- Hugging Face models: Would require self-hosting
- Cohere embeddings: Comparable quality but less integrated with our stack
- GCP Vertex AI: Higher complexity in setup and management

## Additional Components

### Speech Recognition: Web Speech API with Fallback

**Decision:** We will use the Web Speech API with a typed input fallback.

**Rationale:**
- Browser-native, no additional dependencies
- No additional cost or API keys needed
- Accessibility benefits from native implementation
- Fallback ensures functionality when speech recognition fails

### Text-to-Speech: TBD

**Decision pending:** Evaluating browser-native capabilities vs. external services.

### LLM Service: OpenAI API

**Decision:** We will use OpenAI's API for LLM capabilities.

**Rationale:**
- High quality outputs
- Manageable cost structure
- Well-documented API
- Consistent with embedding model choice

## Cost Considerations

All tooling decisions are made with the goal of keeping eventual user costs to £20-£40/month, focusing on:

1. Tools with free tiers or reasonable pricing
2. Minimal operational complexity
3. Efficient token usage and caching strategies
4. Options for self-hosting where appropriate

## Implementation Phases

1. **Phase 1**: Basic integration with OpenAI API and local storage
2. **Phase 2**: Add ChromaDB for vector search capabilities
3. **Phase 3**: Implement Neo4j knowledge graph for relationship tracking
4. **Phase 4**: Optimize for cost and performance

## Future Considerations

- Explore options for on-device processing to reduce API costs
- Consider fine-tuning custom models for specialized tasks
- Evaluate emerging open-source alternatives as they mature 