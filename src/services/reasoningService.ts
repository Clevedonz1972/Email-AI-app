import { knowledgeGraphService, ReasoningPath, TemporalEvent, RelationshipProperties } from './knowledgeGraphService';
import { memoryService, Memory, MemoryType } from './memoryService';
import { v4 as uuidv4 } from 'uuid';

export interface EmailThreadInfo {
  threadId: string;
  subject: string;
  participants: string[];
  emailIds: string[];
  lastUpdated: number;
}

export interface ReasoningResult {
  relatedThreads: EmailThreadInfo[];
  relatedMemories: Memory[];
  emotionalImpact: {
    stress: number;
    urgency: number;
    sentiment: number;
  };
  priority: 'low' | 'medium' | 'high';
  reasoning: ReasoningPath[];
  temporalEvents: TemporalEvent[];
}

class ReasoningService {
  private static instance: ReasoningService;

  private constructor() {}

  public static getInstance(): ReasoningService {
    if (!ReasoningService.instance) {
      ReasoningService.instance = new ReasoningService();
    }
    return ReasoningService.instance;
  }

  /**
   * Process a new email through the reasoning pipeline
   * Links to related threads, identifies relevant memories, and infers priority
   */
  async processEmail(
    emailId: string,
    emailContent: string,
    metadata: {
      subject: string;
      sender: {
        email: string;
        name?: string;
      };
      recipients: {
        email: string;
        name?: string;
      }[];
      threadId?: string;
      timestamp: number;
      category?: string;
    }
  ): Promise<ReasoningResult> {
    // Step 1: Find relevant memories based on content similarity
    const relevantMemories = await this.findRelevantMemories(emailContent);

    // Step 2: Link to previous related threads
    const threadInfo = await this.linkToThread(emailId, metadata);

    // Step 3: Identify emotional impact and priority
    const emotionalImpact = await this.analyzeEmotionalImpact(emailContent, metadata.sender.email);

    // Step 4: Create temporal events if this email represents a significant event
    const temporalEvents = await this.createTemporalEvents(
      emailId, 
      metadata.subject, 
      emotionalImpact,
      relevantMemories.map(mem => mem.memory.id)
    );

    // Step 5: Determine priority based on emotional impact, sender, and content
    const priority = this.determinePriority(emotionalImpact, metadata.sender.email, relevantMemories);

    // Step 6: Build reasoning paths to explain connections
    const reasoningPaths = await this.buildReasoningPaths(emailId, relevantMemories);

    // Return the comprehensive reasoning result
    return {
      relatedThreads: [threadInfo],
      relatedMemories: relevantMemories.map(item => item.memory),
      emotionalImpact,
      priority,
      reasoning: reasoningPaths,
      temporalEvents
    };
  }

  /**
   * Find memories related to the email content
   */
  private async findRelevantMemories(content: string): Promise<Array<{ memory: Memory; score: number }>> {
    try {
      // Use vector similarity search to find related memories
      const memoryResults = await memoryService.findRelevantMemories(content, {
        limit: 10,
        threshold: 0.6 // Minimum similarity threshold
      });

      return memoryResults;
    } catch (error) {
      console.error('Error finding relevant memories:', error);
      return [];
    }
  }

  /**
   * Link the email to a thread
   */
  private async linkToThread(
    emailId: string,
    metadata: {
      subject: string;
      threadId?: string;
      sender: { email: string; name?: string };
      recipients: Array<{ email: string; name?: string }>;
      timestamp: number;
    }
  ): Promise<EmailThreadInfo> {
    try {
      const subject = metadata.subject;
      const threadId = metadata.threadId || `thread-${uuidv4()}`;
      const isNewThread = !metadata.threadId;

      // Find existing thread node or create a new one
      if (isNewThread) {
        // Create new thread node in knowledge graph
        const threadNode: Memory = {
          id: threadId,
          type: MemoryType.EMAIL,
          content: `Thread: ${subject}`,
          timestamp: metadata.timestamp,
          metadata: {
            type: 'email_thread',
            subject,
            participants: [
              metadata.sender.email,
              ...metadata.recipients.map(r => r.email)
            ],
            emailCount: 1,
            lastUpdated: metadata.timestamp
          }
        };

        // Store thread node
        await knowledgeGraphService.upsertNode(threadNode);
      } else {
        // Update existing thread
        // Look for the thread node (mock implementation)
        // In a real implementation, we would fetch and update the thread node
        console.log(`Updating existing thread ${threadId}`);
      }

      // Connect email to thread
      await knowledgeGraphService.createRelationship(
        emailId,
        threadId,
        {
          type: 'PART_OF',
          properties: {
            timestamp: metadata.timestamp,
            index: 0, // Position in thread
            context: 'email_thread'
          }
        }
      );

      // Connect sender to email with SENT relationship
      await knowledgeGraphService.createRelationship(
        metadata.sender.email,
        emailId,
        {
          type: 'SENT',
          properties: {
            timestamp: metadata.timestamp,
            context: 'email_sender'
          }
        }
      );

      // Connect recipients to email with RECEIVED relationship
      for (const recipient of metadata.recipients) {
        await knowledgeGraphService.createRelationship(
          emailId,
          recipient.email,
          {
            type: 'RECEIVED',
            properties: {
              timestamp: metadata.timestamp,
              context: 'email_recipient'
            }
          }
        );
      }

      // Return thread info
      return {
        threadId,
        subject,
        participants: [
          metadata.sender.email,
          ...metadata.recipients.map(r => r.email)
        ],
        emailIds: [emailId],
        lastUpdated: metadata.timestamp
      };
    } catch (error) {
      console.error('Error linking email to thread:', error);
      // Return minimal thread info on error
      return {
        threadId: metadata.threadId || `thread-${uuidv4()}`,
        subject: metadata.subject,
        participants: [
          metadata.sender.email,
          ...metadata.recipients.map(r => r.email)
        ],
        emailIds: [emailId],
        lastUpdated: metadata.timestamp
      };
    }
  }

  /**
   * Analyze the emotional impact of an email
   * This would typically use AI analysis, but we're mocking for now
   */
  private async analyzeEmotionalImpact(
    content: string,
    senderEmail: string
  ): Promise<{
    stress: number;
    urgency: number;
    sentiment: number;
  }> {
    try {
      // Analyze content for stress indicators
      const containsUrgent = content.toLowerCase().includes('urgent') || 
                             content.toLowerCase().includes('asap') || 
                             content.toLowerCase().includes('immediately');
      
      const containsDeadline = content.toLowerCase().includes('deadline') || 
                               content.toLowerCase().includes('due date') ||
                               content.toLowerCase().includes('by tomorrow');

      const containsNegative = content.toLowerCase().includes('problem') || 
                               content.toLowerCase().includes('issue') ||
                               content.toLowerCase().includes('concerned') ||
                               content.toLowerCase().includes('disappointed');

      const containsPositive = content.toLowerCase().includes('thank') || 
                               content.toLowerCase().includes('appreciate') ||
                               content.toLowerCase().includes('great job') ||
                               content.toLowerCase().includes('well done');

      // Calculate stress, urgency and sentiment scores
      let stress = 0.3; // Base stress level
      if (containsUrgent) stress += 0.3;
      if (containsDeadline) stress += 0.2;
      if (containsNegative) stress += 0.2;

      let urgency = 0.2; // Base urgency
      if (containsUrgent) urgency += 0.5;
      if (containsDeadline) urgency += 0.3;

      let sentiment = 0.5; // Neutral sentiment
      if (containsPositive) sentiment += 0.3;
      if (containsNegative) sentiment -= 0.3;

      // Clamp values to 0-1 range
      stress = Math.min(1, Math.max(0, stress));
      urgency = Math.min(1, Math.max(0, urgency));
      sentiment = Math.min(1, Math.max(0, sentiment));

      return { stress, urgency, sentiment };
    } catch (error) {
      console.error('Error analyzing emotional impact:', error);
      return { stress: 0.3, urgency: 0.3, sentiment: 0.5 };
    }
  }

  /**
   * Create temporal events if this email represents a significant event
   */
  private async createTemporalEvents(
    emailId: string,
    subject: string,
    emotionalImpact: { stress: number; urgency: number; sentiment: number },
    relatedMemoryIds: string[]
  ): Promise<TemporalEvent[]> {
    const events: TemporalEvent[] = [];

    try {
      // Check if this email represents a high-stress event
      if (emotionalImpact.stress > 0.7) {
        const stressEvent: TemporalEvent = {
          id: `event-stress-${uuidv4()}`,
          event_type: 'stress_spike',
          timestamp: Date.now(),
          description: `Stress spike from email: ${subject}`,
          intensity: emotionalImpact.stress * 10, // Convert to 0-10 scale
          related_entities: [emailId, ...relatedMemoryIds]
        };

        // Add to knowledge graph
        await knowledgeGraphService.createTemporalEvent(stressEvent);
        events.push(stressEvent);
      }

      // Check if this email represents a high-urgency event
      if (emotionalImpact.urgency > 0.7) {
        const urgencyEvent: TemporalEvent = {
          id: `event-urgency-${uuidv4()}`,
          event_type: 'urgency_spike',
          timestamp: Date.now(),
          description: `Urgency spike from email: ${subject}`,
          intensity: emotionalImpact.urgency * 10, // Convert to 0-10 scale
          related_entities: [emailId, ...relatedMemoryIds]
        };

        // Add to knowledge graph
        await knowledgeGraphService.createTemporalEvent(urgencyEvent);
        events.push(urgencyEvent);
      }

      // Create a sentiment event for significantly positive or negative emails
      if (emotionalImpact.sentiment < 0.3 || emotionalImpact.sentiment > 0.7) {
        const eventType = emotionalImpact.sentiment < 0.3 ? 'negative_sentiment' : 'positive_sentiment';
        const sentimentEvent: TemporalEvent = {
          id: `event-${eventType}-${uuidv4()}`,
          event_type: eventType,
          timestamp: Date.now(),
          description: `${eventType === 'negative_sentiment' ? 'Negative' : 'Positive'} sentiment spike from email: ${subject}`,
          intensity: Math.abs(emotionalImpact.sentiment - 0.5) * 20, // Convert to 0-10 scale
          related_entities: [emailId, ...relatedMemoryIds]
        };

        // Add to knowledge graph
        await knowledgeGraphService.createTemporalEvent(sentimentEvent);
        events.push(sentimentEvent);
      }

      return events;
    } catch (error) {
      console.error('Error creating temporal events:', error);
      return events;
    }
  }

  /**
   * Determine email priority based on various factors
   */
  private determinePriority(
    emotionalImpact: { stress: number; urgency: number; sentiment: number },
    senderEmail: string,
    relevantMemories: Array<{ memory: Memory; score: number }>
  ): 'low' | 'medium' | 'high' {
    // Combine factors to determine priority
    let priorityScore = 0;

    // Factor 1: Emotional impact (50% weight)
    priorityScore += (emotionalImpact.stress * 0.3 + emotionalImpact.urgency * 0.7) * 0.5;

    // Factor 2: Sender importance (30% weight)
    // In a real implementation, we would calculate sender importance based on past interactions
    const senderImportance = 0.5; // Default medium importance
    priorityScore += senderImportance * 0.3;

    // Factor 3: Relevance to other memories (20% weight)
    const relevanceScore = relevantMemories.length > 0 
      ? Math.min(1, relevantMemories.length / 5) * relevantMemories[0].score
      : 0;
    priorityScore += relevanceScore * 0.2;

    // Determine priority level based on score
    if (priorityScore >= 0.7) return 'high';
    if (priorityScore >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Build reasoning paths to explain the connections between this email and other entities
   */
  private async buildReasoningPaths(
    emailId: string,
    relevantMemories: Array<{ memory: Memory; score: number }>
  ): Promise<ReasoningPath[]> {
    const reasoningPaths: ReasoningPath[] = [];

    try {
      // Get paths to most relevant memories
      for (const memoryItem of relevantMemories.slice(0, 3)) { // Process top 3 memories
        const path = await knowledgeGraphService.performReasoning(
          emailId,
          memoryItem.memory.id,
          { maxLength: 4, minStrength: 0.3 }
        );

        if (path.path.length > 0) {
          reasoningPaths.push(path);
        }
      }

      // If we couldn't find paths based on relevance, try stress connection
      if (reasoningPaths.length === 0) {
        const stressPath = await knowledgeGraphService.performReasoning(
          emailId,
          'stress', // Generic stress node
          { maxLength: 3, minStrength: 0.2 }
        );

        if (stressPath.path.length > 0) {
          reasoningPaths.push(stressPath);
        }
      }

      return reasoningPaths;
    } catch (error) {
      console.error('Error building reasoning paths:', error);
      return [];
    }
  }
}

export const reasoningService = ReasoningService.getInstance();

export default reasoningService; 