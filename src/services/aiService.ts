import axios from 'axios';
import mockEmailService from './mockEmailService';
import { memoryService, MemoryType } from './memoryService';
import { knowledgeGraphService } from './knowledgeGraphService';

// API endpoint for AI conversation
const AI_API_ENDPOINT = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.your-backend.com/ai';
const ASTI_API_ENDPOINT = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/asti` : '/api/asti';

// OpenAI voice models
export enum OpenAIVoice {
  ALLOY = 'alloy',      // Neutral, versatile
  ECHO = 'echo',        // Neutral, analytical
  FABLE = 'fable',      // Expressive, youthful
  ONYX = 'onyx',        // Deep, authoritative
  NOVA = 'nova',        // Warm, optimistic
  SHIMMER = 'shimmer'   // Clear, friendly
}

// Message types for conversation
export interface ConversationMessage {
  id: string;
  text: string;
  sender: 'user' | 'asti';
  timestamp: number;
}

// Interface for AI service response
interface AIResponse {
  text: string;
  audio?: string; // Base64 encoded audio if TTS is requested
}

// Daily Brief data interface
export interface DailyBriefData {
  greeting: string;
  overall_status: {
    stress_level: 'HIGH' | 'MEDIUM' | 'LOW';
    focus_needed: string[];
  };
  email_summary: {
    unread_count: number;
    high_priority_count: number;
    action_required_count: number;
    most_important_sender?: string;
  };
  calendar_summary: {
    total_events: number;
    next_event?: {
      title: string;
      start_time: string;
      end_time: string;
      location?: string;
    };
  };
  task_summary: {
    total_tasks: number;
    urgent_tasks: number;
    upcoming_deadlines: Array<{
      title: string;
      due_date: string;
    }>;
  };
  stress_factors: string[];
  wellbeing_suggestions: string[];
  memory_insights: Array<{
    text: string;
    relevance_score: number;
  }>;
}

// Add a new interface for email reply options
export interface EmailReplyOptions {
  full: string;
  brief: string;
  needTime: string;
}

export type ReplyStyle = 'authentic' | 'masked' | 'simple';

// Get token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Create API client with timeout
const apiClient = axios.create({
  baseURL: ASTI_API_ENDPOINT,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Memory contexts for AI
interface ContextItem {
  type: 'email' | 'task' | 'calendar' | 'conversation' | 'knowledge';
  id: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Enhanced AI Service implementation
export const aiService = {
  // Generate a unique message ID
  generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },

  // Add an item to context memory - now using memoryService
  async rememberContext(item: { 
    type: 'email' | 'task' | 'calendar' | 'conversation' | 'knowledge',
    id: string, 
    content: string, 
    metadata?: Record<string, any> 
  }): Promise<void> {
    // Map the type from string to MemoryType enum
    const memoryType = item.type === 'email' ? MemoryType.EMAIL
      : item.type === 'task' ? MemoryType.TASK
      : item.type === 'conversation' ? MemoryType.CONVERSATION 
      : MemoryType.KNOWLEDGE;
      
    await memoryService.storeMemory({
      type: memoryType,
      content: item.content,
      metadata: item.metadata
    });
  },

  // Retrieve relevant contexts for an input - now using memoryService
  async findRelevantContexts(input: string, count: number = 3): Promise<any[]> {
    const results = await memoryService.findRelevantMemories(input, {
      limit: count,
      threshold: 0.1
    });
    
    return results.map(result => ({
      type: result.memory.type,
      id: result.memory.id,
      content: result.memory.content,
      timestamp: result.memory.timestamp,
      metadata: result.memory.metadata,
      score: result.score
    }));
  },

  // Enhanced send message with context enrichment
  async sendMessageWithContext(
    text: string,
    conversationHistory: ConversationMessage[],
    context?: {
      email?: any;
      task?: any;
      calendar?: any;
    },
    options: {
      requestAudio?: boolean;
      voice?: OpenAIVoice;
    } = {}
  ): Promise<AIResponse> {
    try {
      // In development, check if we should use mock responses
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_AI === 'true') {
        return this.getMockResponse(text);
      }
      
      // Save this interaction to memory
      const contextText = this._formatContextForPrompt(context);
      const memory = await memoryService.storeMemory({
        type: MemoryType.CONVERSATION,
        content: `User: ${text}\nContext: ${contextText}`,
        metadata: { userText: text, context }
      });
      
      // Find relevant past contexts using vector similarity
      const relevantMemories = await memoryService.findRelevantMemories(text, {
        limit: 5,
        threshold: 0.1
      });
      
      // Find related memories in the knowledge graph
      const relatedMemories = await knowledgeGraphService.findRelatedMemories(memory.id, {
        limit: 3
      });
      
      // Create a context-enhanced prompt
      let enhancedPrompt = text;
      
      // Add current context if available
      if (contextText) {
        enhancedPrompt = `${contextText}\n\nUser query: ${text}`;
      }
      
      // Add relevant vector memories if available
      if (relevantMemories.length > 0) {
        enhancedPrompt += "\n\nRelevant past information:";
        relevantMemories.forEach(({ memory, score }) => {
          enhancedPrompt += `\n- ${memory.content} (Relevance: ${score.toFixed(2)})`;
        });
      }
      
      // Add related graph memories if available
      if (relatedMemories.length > 0) {
        enhancedPrompt += "\n\nRelated information:";
        relatedMemories.forEach(node => {
          enhancedPrompt += `\n- ${node.content}`;
          if (node.relationships && node.relationships.length > 0) {
            const relationship = node.relationships[0];
            enhancedPrompt += ` (${relationship.relationship.type})`;
          }
        });
      }
      
      // Format conversation history for the API
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Send request to backend
      const response = await axios.post(`${AI_API_ENDPOINT}/chat`, {
        message: enhancedPrompt,
        conversation_history: history,
        request_audio: options.requestAudio || false,
        voice: options.voice || OpenAIVoice.NOVA
      });

      // Store the response in memory and create relationships
      const responseMemory = await memoryService.storeMemory({
        type: MemoryType.CONVERSATION,
        content: response.data.response,
        metadata: { 
          isAIResponse: true,
          originalQuery: text,
          context
        }
      });
      
      // Create relationships in the knowledge graph
      await knowledgeGraphService.createRelationship(
        memory.id,
        responseMemory.id,
        {
          type: 'RESPONDS_TO',
          properties: {
            timestamp: Date.now(),
            relevance: relevantMemories.length > 0 ? relevantMemories[0].score : 0
          }
        }
      );
      
      // Create relationships with relevant memories
      for (const { memory: relevantMemory } of relevantMemories) {
        await knowledgeGraphService.createRelationship(
          memory.id,
          relevantMemory.id,
          {
            type: 'RELATED_TO',
            properties: {
              timestamp: Date.now(),
              relevance: relevantMemory.metadata?.relevance || 0
            }
          }
        );
      }

      return {
        text: response.data.response,
        audio: response.data.audio_base64
      };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Return a fallback response if the API call fails
      return {
        text: "I'm sorry, I'm having trouble connecting to my backend service. Please try again later."
      };
    }
  },
  
  // Format context objects into a prompt string
  _formatContextForPrompt(context?: {
    email?: any;
    task?: any;
    calendar?: any;
  }): string {
    if (!context) return '';
    
    let contextText = 'Current context:';
    
    if (context.email) {
      contextText += `
Email:
From: ${context.email.sender.name} (${context.email.sender.email})
Subject: ${context.email.subject}
Date: ${context.email.timestamp}
Content: ${context.email.content.slice(0, 500)}${context.email.content.length > 500 ? '...' : ''}
`;
    }
    
    if (context.task) {
      contextText += `
Task:
Title: ${context.task.title}
Description: ${context.task.description || 'No description'}
Due date: ${context.task.due_date || 'No due date'}
Priority: ${context.task.priority}
`;
    }
    
    if (context.calendar) {
      contextText += `
Calendar event:
Title: ${context.calendar.title}
Time: ${context.calendar.start_time} - ${context.calendar.end_time}
Location: ${context.calendar.location || 'No location'}
Description: ${context.calendar.description || 'No description'}
`;
    }
    
    return contextText;
  },

  // Keep compatibility with existing sendMessage function
  async sendMessage(
    text: string, 
    conversationHistory: ConversationMessage[],
    options: {
      requestAudio?: boolean;
      voice?: OpenAIVoice;
    } = {}
  ): Promise<AIResponse> {
    return this.sendMessageWithContext(text, conversationHistory, undefined, options);
  },

  // Send audio to the AI backend for transcription and response
  async sendAudio(
    audioBlob: Blob, 
    conversationHistory: ConversationMessage[],
    options: {
      requestAudio?: boolean;
      voice?: OpenAIVoice;
    } = {}
  ): Promise<AIResponse> {
    try {
      // In development, check if we should use mock responses
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_AI === 'true') {
        // Simulate transcription delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getMockResponse("Hello, this is a simulated audio message");
      }

      // Format conversation history for the API
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Create form data with audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('conversation_history', JSON.stringify(history));
      formData.append('request_audio', (options.requestAudio || true).toString());
      if (options.voice) {
        formData.append('voice', options.voice);
      }

      // Send to backend
      const response = await axios.post(`${AI_API_ENDPOINT}/audio-chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        text: response.data.response,
        audio: response.data.audio_base64
      };
    } catch (error) {
      console.error('Error sending audio to AI:', error);
      
      // Return a fallback response if the API call fails
      return {
        text: "I'm sorry, I couldn't process your audio message. Please try again or type your message instead."
      };
    }
  },

  // Mock responses for development/testing
  getMockResponse(text: string): AIResponse {
    const lowercaseText = text.toLowerCase();
    
    // Simple pattern matching for mock responses
    if (lowercaseText.includes('hello') || lowercaseText.includes('hi')) {
      return { text: "Hello! It's nice to chat with you. How can I support you today?" };
    } 
    else if (lowercaseText.includes('how are you')) {
      return { text: "I'm doing well, thanks for asking! I'm here and ready to help you with whatever you need. How are you feeling today?" };
    }
    else if (lowercaseText.includes('stressed') || lowercaseText.includes('anxiety') || lowercaseText.includes('anxious')) {
      return { text: "I'm sorry to hear you're feeling stressed. That's really tough. Would you like to talk about what's causing your stress? Sometimes just expressing what's on your mind can help. Or we could explore some simple stress-reduction techniques if you prefer." };
    }
    else if (lowercaseText.includes('adhd') || lowercaseText.includes('focus') || lowercaseText.includes('distract')) {
      return { text: "Living with ADHD has its unique challenges. Your brain works differently, and that's okay. Would you like to talk about specific strategies that might help with focus? Or perhaps you'd just like to share your experience?" };
    }
    else if (lowercaseText.includes('thank')) {
      return { text: "You're very welcome! I'm always here when you need someone to talk to. Is there anything else on your mind?" };
    }
    else if (lowercaseText.includes('bye') || lowercaseText.includes('goodbye')) {
      return { text: "I hope our conversation has been helpful. Remember, I'm here anytime you want to chat. Take care of yourself, and bye for now!" };
    }
    else {
      // Default responses to keep conversation going
      const defaultResponses = [
        "That's interesting. Could you tell me more about that?",
        "I understand. How does that make you feel?",
        "Thank you for sharing that with me. What else is on your mind?",
        "I appreciate you telling me this. Would you like to explore this topic further?",
        "I'm here to listen. Please continue if you'd like to share more.",
        "That sounds challenging. How have you been coping with it?",
        "I'm listening and I'm here for you. What would be most helpful for you right now?"
      ];
      
      const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      return { text: randomResponse };
    }
  },

  // Get daily brief data from ASTI
  getDailyBrief: async (): Promise<DailyBriefData> => {
    try {
      const token = getAuthToken();
      
      // For development, if no backend is available, return mock data
      if (process.env.NODE_ENV === 'development' && (!token || !process.env.REACT_APP_API_URL)) {
        console.log('Using fallback data for daily brief in development mode');
        return getFallbackDailyBriefData();
      }
      
      const response = await apiClient.get('/daily-brief', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching daily brief:', error);
      // Return fallback data in case of error
      return getFallbackDailyBriefData();
    }
  },
  
  // Get wellbeing suggestions
  getWellbeingSuggestions: async (): Promise<string[]> => {
    try {
      const token = getAuthToken();
      
      const response = await apiClient.get('/wellbeing/suggestions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.suggestions;
    } catch (error) {
      console.error('Error fetching wellbeing suggestions:', error);
      return [
        "Take a 5-minute break and practice deep breathing",
        "Consider a short walk to reset your mind",
        "Try the Pomodoro technique for better focus",
        "Drink water and ensure you're staying hydrated",
        "Check your posture and adjust your seating if needed"
      ];
    }
  },
  
  // Analyze an email
  analyzeEmail: async (email: any): Promise<any> => {
    try {
      const token = getAuthToken();
      
      const response = await apiClient.post('/analyze-email', email, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing email:', error);
      throw error;
    }
  },

  // Generate email reply options based on email content and style
  async generateEmailReplyOptions(
    emailContent: { 
      sender: { name: string; email: string; }, 
      subject: string, 
      content: string 
    },
    style: ReplyStyle = 'authentic'
  ): Promise<EmailReplyOptions> {
    try {
      // In development mode, return mock responses
      if (process.env.NODE_ENV === 'development') {
        // Mock delay for development testing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock responses based on style
        const mockResponses: Record<ReplyStyle, EmailReplyOptions> = {
          authentic: {
            full: `Hi ${emailContent.sender.name},\n\nThanks for your email. I\'ve read through it and have some thoughts. ${emailContent.subject.includes('meeting') ? 'I can make the meeting time you suggested.' : 'I\'ll need to think about this more before I can give a complete response.'}\n\nI appreciate you reaching out about this.\n\nBest,\n[Your Name]`,
            brief: `Hi ${emailContent.sender.name},\n\nGot your email. I\'ll look into this.\n\nThanks,\n[Your Name]`,
            needTime: `Hi ${emailContent.sender.name},\n\nI\'ve received your email and need some time to process it properly. I\'ll get back to you by tomorrow.\n\nAppreciate your patience,\n[Your Name]`
          },
          masked: {
            full: `Dear ${emailContent.sender.name},\n\nThank you for your email regarding ${emailContent.subject}. I appreciate you taking the time to reach out. I have reviewed the information you provided and would be happy to assist with this matter. ${emailContent.subject.includes('meeting') ? 'The proposed meeting time works for my schedule.' : 'I will review this in detail and provide a comprehensive response.'}\n\nPlease let me know if you need any additional information from my end.\n\nBest regards,\n[Your Name]`,
            brief: `Dear ${emailContent.sender.name},\n\nThank you for your email. I will review this and respond accordingly.\n\nBest regards,\n[Your Name]`,
            needTime: `Dear ${emailContent.sender.name},\n\nThank you for your email. I am currently reviewing your request and will need some additional time to provide a thorough response. I expect to get back to you within the next business day.\n\nThank you for your patience and understanding.\n\nBest regards,\n[Your Name]`
          },
          simple: {
            full: `Hi ${emailContent.sender.name},\n\nI got your email about ${emailContent.subject}.\n\nHere\'s my response:\n- ${emailContent.subject.includes('meeting') ? 'Yes, I can attend the meeting.' : 'I understand what you\'re asking.'}\n- I\'ll work on this soon.\n\nThanks,\n[Your Name]`,
            brief: `Hi ${emailContent.sender.name},\n\nI got your email. Will handle this soon.\n\nThanks,\n[Your Name]`,
            needTime: `Hi ${emailContent.sender.name},\n\nI need more time to answer your email. Will reply by tomorrow.\n\nThanks,\n[Your Name]`
          }
        };
        
        return mockResponses[style];
      }
      
      // For production: Create a prompt for the AI service
      const prompt = `
        I need to reply to this email:
        From: ${emailContent.sender.name} (${emailContent.sender.email})
        Subject: ${emailContent.subject}
        Content: ${emailContent.content}
        
        Generate a ${style} style reply to this email.
        
        ${style === 'authentic' ? 'Write as my authentic self, with direct honesty.' : ''}
        ${style === 'masked' ? 'Write in a professional, neurotypical-friendly style.' : ''}
        ${style === 'simple' ? 'Write in a simple, low-cognitive-load style for ease of processing.' : ''}
        
        Generate 3 different options:
        1. Full reply addressing all points in the email
        2. Brief acknowledgment
        3. Request for more time
        
        Format your response as:
        FULL: [full reply text]
        BRIEF: [brief acknowledgment text]
        NEEDTIME: [request for more time text]
      `;
      
      // Call the AI backend for a response
      const response = await this.sendMessage(prompt, []);
      const responseText = response.text;
      
      // Parse the response to extract the different reply options
      const fullMatch = responseText.match(/FULL:([\s\S]*?)(?=BRIEF:|$)/);
      const briefMatch = responseText.match(/BRIEF:([\s\S]*?)(?=NEEDTIME:|$)/);
      const needTimeMatch = responseText.match(/NEEDTIME:([\s\S]*?)(?=$)/);
      
      // Return the extracted options
      return {
        full: fullMatch ? fullMatch[1].trim() : 'Thank you for your email. I\'ll respond in detail soon.',
        brief: briefMatch ? briefMatch[1].trim() : 'Got it, thanks!',
        needTime: needTimeMatch ? needTimeMatch[1].trim() : 'I\'ve received your email and need more time to respond properly.'
      };
    } catch (error) {
      console.error('Error generating email reply options:', error);
      
      // Return fallback responses in case of error
      return {
        full: `Hi ${emailContent.sender.name},\n\nThank you for your email. I will get back to you with a full response soon.\n\nBest regards,\n[Your Name]`,
        brief: `Hi ${emailContent.sender.name},\n\nThanks for your email. I\'ll review this shortly.\n\n[Your Name]`,
        needTime: `Hi ${emailContent.sender.name},\n\nI\'ve received your email and will need some time to prepare a proper response. I\'ll get back to you soon.\n\n[Your Name]`
      };
    }
  },
  
  // Send an email reply (this would connect to your email service)
  async sendEmailReply(to: string, subject: string, content: string): Promise<boolean> {
    try {
      // In development, just log the email details
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending email reply to:', to);
        console.log('Subject:', subject);
        console.log('Content:', content);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return success for development
        return true;
      }
      
      // For production: Connect to your email sending service
      const token = getAuthToken();
      const response = await apiClient.post('/send-email', {
        to,
        subject: `Re: ${subject}`,
        content
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error sending email reply:', error);
      return false;
    }
  }
};

// Update the getFallbackDailyBriefData function to use mockEmailService
const getFallbackDailyBriefData = (): DailyBriefData => {
  // Get stored mock emails from localStorage
  const storedMockEmails = mockEmailService.getStoredMockEmails();
  
  // Calculate email metrics based on mock emails
  const unreadCount = storedMockEmails ? storedMockEmails.filter(email => !email.is_read).length : 0;
  const highPriorityCount = storedMockEmails ? storedMockEmails.filter(email => email.priority === 'HIGH' && !email.is_read).length : 0;
  const actionRequiredCount = storedMockEmails ? storedMockEmails.filter(email => email.action_required && !email.is_read).length : 0;
  
  // Get most important sender if available
  let mostImportantSender = undefined;
  if (storedMockEmails && storedMockEmails.length > 0) {
    const highPriorityEmails = storedMockEmails.filter(email => email.priority === 'HIGH' && !email.is_read);
    if (highPriorityEmails.length > 0) {
      mostImportantSender = highPriorityEmails[0].sender.name;
    }
  }
  
  // Default stress level based on unread count and priority
  let stressLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (highPriorityCount > 2 || unreadCount > 10) {
    stressLevel = 'HIGH';
  } else if (highPriorityCount > 0 || unreadCount > 5) {
    stressLevel = 'MEDIUM';
  }
  
  // Return mock data with real numbers from stored mock emails
  return {
    greeting: "Good day! Here\'s your current status.",
    overall_status: {
      stress_level: stressLevel,
      focus_needed: [
        storedMockEmails && storedMockEmails.length > 0 ? 
          `Respond to ${unreadCount} unread emails` : 
          "Your inbox is clear. Well done!",
        highPriorityCount > 0 ? 
          `Address ${highPriorityCount} high priority messages` : 
          "No high priority items pending"
      ]
    },
    email_summary: {
      unread_count: unreadCount,
      high_priority_count: highPriorityCount,
      action_required_count: actionRequiredCount,
      most_important_sender: mostImportantSender
    },
    calendar_summary: {
      total_events: 3,
      next_event: {
        title: "Weekly Team Meeting",
        start_time: new Date(Date.now() + 90 * 60000).toISOString(), // 90 mins from now
        end_time: new Date(Date.now() + 150 * 60000).toISOString(), // 150 mins from now
        location: "Conference Room A"
      }
    },
    task_summary: {
      total_tasks: actionRequiredCount + 2,
      urgent_tasks: highPriorityCount,
      upcoming_deadlines: [
        {
          title: actionRequiredCount > 0 ? 
            `Respond to ${mostImportantSender || "important email"}` : 
            "Review quarterly reports",
          due_date: new Date(Date.now() + 24 * 60 * 60000).toISOString() // Tomorrow
        },
        {
          title: "Complete project milestone",
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60000).toISOString() // 3 days from now
        }
      ]
    },
    stress_factors: [
      "Unread emails requiring action",
      highPriorityCount > 0 ? "High priority communications" : "No high priority stress factors",
      "Upcoming deadlines"
    ],
    wellbeing_suggestions: [
      "Take a 10-minute break for a mindfulness exercise",
      "Consider batch-processing emails at set times",
      "Prioritize tasks by importance and urgency"
    ],
    memory_insights: [
      {
        text: "You tend to have higher stress levels on Mondays when email volume is highest",
        relevance_score: 0.9
      },
      {
        text: "Breaking tasks into smaller steps has helped you in the past",
        relevance_score: 0.8
      }
    ]
  };
}; 