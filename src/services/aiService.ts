import axios from 'axios';

// API endpoint for AI conversation
const AI_API_ENDPOINT = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.your-backend.com/ai';

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
  }
}; 