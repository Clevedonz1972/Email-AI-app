import axios from 'axios';

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

// AI Service implementation
export const aiService = {
  // Generate a unique message ID
  generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },

  // Send a text message to the AI backend
  async sendMessage(
    text: string, 
    conversationHistory: ConversationMessage[],
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

      // Format conversation history for the API
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Send request to backend
      const response = await axios.post(`${AI_API_ENDPOINT}/chat`, {
        message: text,
        conversation_history: history,
        request_audio: options.requestAudio || false,
        voice: options.voice || OpenAIVoice.NOVA // Default to Nova voice
      });

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
  }
};

// Fallback data for development/error cases
const getFallbackDailyBriefData = (): DailyBriefData => {
  const now = new Date();
  const hour = now.getHours();
  
  // Generate appropriate greeting based on time of day
  let greeting = "Good day!";
  if (hour < 12) greeting = "Good morning!";
  else if (hour < 17) greeting = "Good afternoon!";
  else greeting = "Good evening!";
  
  return {
    greeting: greeting,
    overall_status: {
      stress_level: 'MEDIUM',
      focus_needed: ['Email inbox', 'Upcoming deadline']
    },
    email_summary: {
      unread_count: 12,
      high_priority_count: 3,
      action_required_count: 5,
      most_important_sender: 'Team Lead'
    },
    calendar_summary: {
      total_events: 3,
      next_event: {
        title: 'Team Meeting',
        start_time: new Date(now.getTime() + 3600000).toISOString(), // 1 hour from now
        end_time: new Date(now.getTime() + 5400000).toISOString() // 1.5 hours from now
      }
    },
    task_summary: {
      total_tasks: 8,
      urgent_tasks: 2,
      upcoming_deadlines: [
        {
          title: 'Project Proposal',
          due_date: new Date(now.getTime() + 86400000).toISOString() // Tomorrow
        },
        {
          title: 'Client Presentation',
          due_date: new Date(now.getTime() + 259200000).toISOString() // 3 days from now
        }
      ]
    },
    stress_factors: [
      'Multiple high-priority emails',
      'Approaching deadline',
      'Meeting preparation'
    ],
    wellbeing_suggestions: [
      'Take a 5-minute break every hour',
      'Consider a short walk after lunch',
      'Prioritize the most important tasks first'
    ],
    memory_insights: [
      {
        text: 'You mentioned feeling overwhelmed with project deadlines last week',
        relevance_score: 0.85
      },
      {
        text: 'The team leader asked for updates on the current project by end of day',
        relevance_score: 0.92
      }
    ]
  };
}; 