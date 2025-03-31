import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  Alert,
  Fab,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  keyframes,
  Badge
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Send as SendIcon,
  VolumeUp as SpeakIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  RadioButtonChecked as ContinuousMicIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon
} from '@mui/icons-material';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { aiService, ConversationMessage, OpenAIVoice } from '@/services/aiService';
import { EmailMessage } from '@/types/email';

// Add keyframes animation for the swirl effect
const swirl = keyframes`
  0% {
    transform: scale(1) rotate(0);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    transform: scale(1) rotate(360deg);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const pulseRing = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
`;

// Add SpeechRecognition type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: ((event: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Define types for props
interface SpeakToMeProps {
  open: boolean;
  onClose: () => void;
  contextEmail?: EmailMessage;
  initialMessage?: string | null;
}

export const SpeakToMe: React.FC<SpeakToMeProps> = ({ open, onClose, contextEmail, initialMessage }) => {
  const theme = useTheme();
  const [messages, setMessages] = useLocalStorage<ConversationMessage[]>('asti-conversation', []);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [audioRecording, setAudioRecording] = useState<Blob | null>(null);
  
  // Voice settings - switch from browser voices to OpenAI voices
  const [selectedVoice, setSelectedVoice] = useLocalStorage<OpenAIVoice>(
    'asti-voice', 
    OpenAIVoice.NOVA
  );
  const [useTTS, setUseTTS] = useLocalStorage<boolean>('asti-use-tts', true);
  const [useMockResponses, setUseMockResponses] = useLocalStorage<boolean>(
    'asti-use-mock', 
    process.env.NODE_ENV === 'development'
  );
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // Continuous conversation mode
  const [continuousMode, setContinuousMode] = useLocalStorage<boolean>('asti-continuous-mode', false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Gesture mode
  const [gestureMode, setGestureMode] = useLocalStorage<boolean>('asti-gesture-mode', false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gestureTimeoutRef = useRef<number | null>(null);
  
  // Generate prompt with email context
  const generatePromptWithContext = (userText: string, email?: EmailMessage) => {
    if (!email) return userText;
    
    // Create a prompt that includes email context
    return `
      I'm looking at this email:
      From: ${email.sender.name} (${email.sender.email})
      Subject: ${email.subject}
      Date: ${new Date(email.timestamp).toLocaleString()}
      
      Email content:
      ${email.content.slice(0, 1000)}${email.content.length > 1000 ? '...' : ''}
      
      My question/request: ${userText}
    `;
  };
  
  // Add suggestions based on email context
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Generate suggestions based on email context
  useEffect(() => {
    if (contextEmail && open) {
      // If in mock mode, use static suggestions
      if (useMockResponses) {
        setSuggestions([
          "Summarize this email for me",
          "Help me write a reply",
          "What's the main action needed?",
          "What tone is this email using?",
          "Draft a response in simple language"
        ]);
        return;
      }
      
      // Generate suggestions from the AI
      setIsThinking(true);
      const basePrompt = `
        This is an email:
        From: ${contextEmail.sender.name} (${contextEmail.sender.email})
        Subject: ${contextEmail.subject}
        Content: ${contextEmail.content.slice(0, 500)}...
        
        Generate 5 short, helpful actions I might want to take with this email.
        Each suggestion should be under 10 words. Return just the list with no additional text.
      `;
      
      // Call AI service to get suggestions
      aiService.sendMessage(basePrompt, [], {})
        .then(response => {
          // Parse suggestions from response
          try {
            // Split by newlines and cleanup
            const lines = response.text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && line.length < 50)
              .map(line => line.replace(/^\d+\.\s*/, '')) // Remove numbering
              .filter(line => !line.startsWith("Here are") && !line.includes("suggestions")); // Remove intro text
            
            setSuggestions(lines.slice(0, 5));
          } catch (err) {
            console.error('Error parsing suggestions:', err);
            setSuggestions([
              "Summarize this email for me",
              "Help me write a reply",
              "What's the main action needed?"
            ]);
          }
        })
        .catch(err => {
          console.error('Error generating suggestions:', err);
          setSuggestions([
            "Summarize this email for me",
            "Help me write a reply",
            "What's the main action needed?"
          ]);
        })
        .finally(() => {
          setIsThinking(false);
        });
    }
  }, [contextEmail, open, useMockResponses]);
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      speechRecognition.current = new SpeechRecognitionConstructor();
      
      if (speechRecognition.current) {
        speechRecognition.current.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            setInputText(prevText => `${prevText} ${result[0].transcript}`.trim());
          }
        };
        
        speechRecognition.current.onerror = (event: SpeechRecognitionError) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        speechRecognition.current.onend = () => {
          // In continuous mode, if not thinking and not speaking, restart listening
          if (continuousMode && !isThinking && !isSpeaking) {
            restartListening();
          } else {
            setIsListening(false);
          }
        };
      }
    } else {
      setError('Speech recognition is not supported in this browser');
    }
    
    // Create audio element for monitoring when speech ends
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      // If in continuous mode, restart listening after speaking ends
      if (continuousMode && !isThinking) {
        restartListening();
      }
    };
    
    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.onended = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [continuousMode, isThinking, isSpeaking]);
  
  // Restart listening for continuous mode
  const restartListening = () => {
    if (!speechRecognition.current || isThinking || isSpeaking) return;
    
    try {
      speechRecognition.current.start();
      startAudioRecording();
      setIsListening(true);
    } catch (error) {
      console.error('Error restarting speech recognition:', error);
    }
  };
  
  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Check backend connection
  useEffect(() => {
    if (!open) return;
    
    const checkConnection = async () => {
      setConnectionStatus('connecting');
      try {
        // Ping the API endpoint to check connection
        if (useMockResponses) {
          // In mock mode, pretend to be connected
          setConnectionStatus('connected');
        } else {
          // Try to get a simple response from the backend
          await aiService.sendMessage("ping", []);
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Backend connection error:', error);
        setConnectionStatus('error');
        
        // If not in mock mode, suggest using mock mode
        if (!useMockResponses) {
          setError('Failed to connect to the backend. Consider enabling mock responses in settings.');
        }
      }
    };
    
    checkConnection();
  }, [open, useMockResponses]);
  
  // Initialize gesture detection
  useEffect(() => {
    if (!open || !gestureMode) return;
    
    let videoStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 320 },
            height: { ideal: 240 }
          } 
        });
        
        // Store reference to local variable
        const videoElement = videoRef.current;
        
        // Set video stream
        if (videoElement) {
          videoElement.srcObject = stream;
        }
        
        videoStream = stream;
        setCameraActive(true);
        
        // Start motion detection after camera is ready
        videoElement?.addEventListener('loadeddata', startMotionDetection);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Unable to access the camera. Please check your browser permissions.');
        setGestureMode(false);
      }
    };
    
    // Motion detection algorithm
    const startMotionDetection = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      let previousImageData: ImageData | null = null;
      
      // Function to detect motion
      const detectMotion = () => {
        if (!context || !video || !canvas) return;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get current frame data
        const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        if (previousImageData) {
          // Compare with previous frame to detect motion
          const motionScore = calculateMotion(previousImageData, currentImageData);
          
          // If significant motion detected
          if (motionScore > 20 && !isListening && !isThinking && !isSpeaking) {
            // Debounce to prevent multiple triggers
            if (gestureTimeoutRef.current === null) {
              gestureTimeoutRef.current = window.setTimeout(() => {
                // Directly manipulate state instead of calling toggleListening
                if (!isListening) {
                  speechRecognition.current?.start();
                  startAudioRecording();
                  setIsListening(true);
                }
                gestureTimeoutRef.current = null;
              }, 300);
            }
          }
        }
        
        previousImageData = currentImageData;
        
        // Continue detection if gesture mode is still active
        if (gestureMode && cameraActive) {
          requestAnimationFrame(detectMotion);
        }
      };
      
      // Start detection loop
      detectMotion();
    };
    
    // Calculate amount of motion between two frames
    const calculateMotion = (prev: ImageData, curr: ImageData): number => {
      const data1 = prev.data;
      const data2 = curr.data;
      let score = 0;
      const threshold = 30;
      const skip = 10; // Skip pixels for performance
      
      // Compare pixels to detect changes
      for (let i = 0; i < data1.length; i += skip * 4) {
        const r1 = data1[i];
        const g1 = data1[i + 1];
        const b1 = data1[i + 2];
        
        const r2 = data2[i];
        const g2 = data2[i + 1];
        const b2 = data2[i + 2];
        
        // Calculate difference in pixel values
        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        
        // Count significant changes
        if (diff > threshold) {
          score++;
        }
      }
      
      return score;
    };
    
    // Start camera if gesture mode is enabled
    if (gestureMode) {
      startCamera();
    }
    
    // Cleanup function
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      
      setCameraActive(false);
      
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = null;
      }
      
      // Store reference in local variable
      const videoElement = videoRef.current;
      videoElement?.removeEventListener('loadeddata', startMotionDetection);
    };
  }, [open, gestureMode, isListening, isThinking, isSpeaking, setGestureMode]);
  
  // Add initial message when dialogue opens with new context
  useEffect(() => {
    if (open && initialMessage && initialMessage.trim()) {
      // Check if this is a new conversation or the last message isn't the same
      const isNewConversation = messages.length === 0;
      const isDifferentMessage = messages.length > 0 && 
        messages[messages.length - 1].sender === 'asti' && 
        messages[messages.length - 1].text !== initialMessage;
      
      if (isNewConversation || isDifferentMessage) {
        const welcomeMessage: ConversationMessage = {
          id: aiService.generateMessageId(),
          text: initialMessage,
          sender: 'asti',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, welcomeMessage]);
      }
    }
  }, [open, initialMessage, messages, setMessages]);
  
  // Handle send message to include context
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    
    const newUserMessage: ConversationMessage = {
      id: aiService.generateMessageId(),
      text: text, // Show original user text in UI
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputText('');
    setIsThinking(true);
    
    // Use audio recording if available and speech not in progress
    if (audioRecording && !isSpeaking) {
      aiService.sendAudio(audioRecording, messages, {
        requestAudio: useTTS,
        voice: selectedVoice
      })
      .then(handleAIResponse)
      .catch(handleAIError)
      .finally(() => {
        setAudioRecording(null);
        setIsThinking(false);
      });
    } else {
      // Prepare context object if we have contextual information
      const context = contextEmail ? { email: contextEmail } : undefined;
      
      // Using async/await with a self-executing async function for better error handling
      (async () => {
        try {
          // Send message with context to AI using the enhanced method
          const response = await aiService.sendMessageWithContext(text, messages, context, {
            requestAudio: useTTS,
            voice: selectedVoice
          });
          
          handleAIResponse(response);
        } catch (error) {
          handleAIError(error);
        } finally {
          setIsThinking(false);
        }
      })();
    }
  };
  
  // Render suggestions UI
  const renderSuggestions = () => {
    if (!contextEmail || suggestions.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Suggested actions:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => {
                setInputText(suggestion);
                // Use setTimeout to allow the input to update before sending
                setTimeout(() => handleSendMessage(), 10);
              }}
              sx={{ mb: 1 }}
            >
              {suggestion}
            </Button>
          ))}
        </Box>
      </Box>
    );
  };
  
  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioRecording(audioBlob);
        
        // If we have text from speech recognition, send it along with the audio
        if (inputText.trim()) {
          handleSendMessage();
        }
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setError('Unable to access the microphone. Please check your browser permissions.');
    }
  };
  
  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Handle toggling speech recognition
  const toggleListening = () => {
    if (!speechRecognition.current) {
      setError('Speech recognition is not available');
      return;
    }
    
    if (isListening) {
      speechRecognition.current.stop();
      stopAudioRecording();
      setIsListening(false);
      
      // If input text is available when stopping, send it
      if (inputText.trim()) {
        handleSendMessage();
      }
    } else {
      setError(null);
      speechRecognition.current.start();
      startAudioRecording();
      setIsListening(true);
    }
  };
  
  // Toggle continuous conversation mode
  const toggleContinuousMode = () => {
    const newMode = !continuousMode;
    setContinuousMode(newMode);
    
    if (newMode) {
      // If turning on continuous mode, start listening
      if (!isListening && !isThinking && !isSpeaking) {
        setTimeout(() => {
          toggleListening();
        }, 300);
      }
    } else {
      // If turning off continuous mode, stop listening
      if (isListening) {
        speechRecognition.current?.stop();
        stopAudioRecording();
        setIsListening(false);
      }
    }
  };
  
  // Toggle gesture mode
  const toggleGestureMode = () => {
    setGestureMode(!gestureMode);
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // If in continuous mode, restart listening after speaking ends
        if (continuousMode) {
          restartListening();
        }
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (continuousMode) {
          restartListening();
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Handle voice selection
  const handleVoiceChange = (event: SelectChangeEvent) => {
    setSelectedVoice(event.target.value as OpenAIVoice);
  };
  
  // Handle AI response
  const handleAIResponse = (response: { text: string; audio?: string }) => {
    const newMessage: ConversationMessage = {
      id: aiService.generateMessageId(),
      text: response.text,
      sender: 'asti',
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // If we have an audio response and TTS is enabled, play it
    if (response.audio && useTTS) {
      playAudioResponse(response.audio);
    } else if (useTTS) {
      // Fall back to browser TTS if we don't have audio response but TTS is enabled
      speakText(response.text);
    } else if (continuousMode) {
      // If TTS is disabled but in continuous mode, restart listening after a short delay
      setTimeout(restartListening, 500);
    }
  };
  
  // Handle AI error
  const handleAIError = (error: any) => {
    console.error('Error getting AI response:', error);
    setError('Failed to get a response. Please try again.');
  };
  
  // Play audio from base64 string
  const playAudioResponse = (audioBase64: string) => {
    try {
      setIsSpeaking(true);
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.onended = () => {
        setIsSpeaking(false);
        // If in continuous mode, restart listening after speaking ends
        if (continuousMode) {
          restartListening();
        }
      };
      audioRef.current = audio;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsSpeaking(false);
        if (continuousMode) {
          restartListening();
        }
      });
    } catch (error) {
      console.error('Error playing audio response:', error);
      setIsSpeaking(false);
    }
  };
  
  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    
    // Add welcome message
    const welcomeMessage: ConversationMessage = {
      id: aiService.generateMessageId(),
      text: "I've cleared our conversation history. How else can I help you today?",
      sender: 'asti',
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
  };
  
  // Get voice display name
  const getVoiceDisplayName = (voice: OpenAIVoice): string => {
    switch (voice) {
      case OpenAIVoice.ALLOY:
        return 'Alloy (Neutral, versatile)';
      case OpenAIVoice.ECHO:
        return 'Echo (Neutral, analytical)';
      case OpenAIVoice.FABLE:
        return 'Fable (Expressive, youthful)';
      case OpenAIVoice.ONYX:
        return 'Onyx (Deep, authoritative)';
      case OpenAIVoice.NOVA:
        return 'Nova (Warm, optimistic)';
      case OpenAIVoice.SHIMMER:
        return 'Shimmer (Clear, friendly)';
      default:
        return voice;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle>
        {contextEmail ? `AI Assistant - ${contextEmail.subject}` : 'AI Assistant'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <DeleteIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Connection status alert */}
        {connectionStatus === 'error' && (
          <Alert severity="error" sx={{ m: 2 }}>
            Unable to connect to AI service. {useMockResponses ? 'Using mock responses.' : 'Try enabling mock responses in settings.'}
          </Alert>
        )}
        
        {/* Settings panel */}
        <Collapse in={showSettings}>
          <Paper sx={{ m: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="voice-select-label">AI Voice</InputLabel>
                  <Select
                    labelId="voice-select-label"
                    value={selectedVoice}
                    label="AI Voice"
                    onChange={(e: SelectChangeEvent) => setSelectedVoice(e.target.value as OpenAIVoice)}
                  >
                    <MenuItem value={OpenAIVoice.NOVA}>Nova (Warm, optimistic)</MenuItem>
                    <MenuItem value={OpenAIVoice.ALLOY}>Alloy (Neutral, versatile)</MenuItem>
                    <MenuItem value={OpenAIVoice.ECHO}>Echo (Neutral, analytical)</MenuItem>
                    <MenuItem value={OpenAIVoice.FABLE}>Fable (Expressive, youthful)</MenuItem>
                    <MenuItem value={OpenAIVoice.ONYX}>Onyx (Deep, authoritative)</MenuItem>
                    <MenuItem value={OpenAIVoice.SHIMMER}>Shimmer (Clear, friendly)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useTTS}
                      onChange={(e) => setUseTTS(e.target.checked)}
                    />
                  }
                  label="Enable AI speech"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={continuousMode}
                      onChange={(e) => setContinuousMode(e.target.checked)}
                    />
                  }
                  label="Continuous conversation"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useMockResponses}
                      onChange={(e) => setUseMockResponses(e.target.checked)}
                    />
                  }
                  label="Use mock responses"
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        
        {/* Messages container */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: theme.palette.background.default,
          }}
        >
          {messages.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              textAlign="center"
              p={3}
            >
              <Typography variant="h6" gutterBottom>
                Welcome to your AI Assistant
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {contextEmail 
                  ? "I'm here to help you with this email. Ask me anything about it!" 
                  : "Ask me anything! I'm here to help with your tasks and questions."}
              </Typography>
              
              {/* Show suggestions if we have an email context */}
              {renderSuggestions()}
            </Box>
          ) : (
            <>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor:
                        msg.sender === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                      color:
                        msg.sender === 'user'
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              
              {/* Show thinking indicator */}
              {isThinking && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body1">Thinking...</Typography>
                  </Paper>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
        
        {/* Input area */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            position: 'relative',
          }}
        >
          {/* Suggestions for existing conversation */}
          {messages.length > 0 && contextEmail && renderSuggestions()}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isThinking}
              multiline
              maxRows={4}
              sx={{ mr: 1 }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="primary"
                onClick={() => setShowSettings(!showSettings)}
                sx={{ mr: 1 }}
              >
                <SettingsIcon />
              </IconButton>
              
              <Tooltip title={isListening ? 'Stop listening' : 'Start listening'}>
                <span>
                  <IconButton
                    color={isListening ? 'secondary' : 'primary'}
                    onClick={toggleListening}
                    disabled={isThinking || (continuousMode && !isSpeaking)}
                  >
                    {isListening ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Send message">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isThinking}
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
      
      {/* Continuous mode floating button */}
      {continuousMode && (
        <Fab
          color={isListening ? 'secondary' : 'primary'}
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 16,
            animation: isListening ? `${pulseRing} 1.5s infinite` : 'none',
          }}
          onClick={toggleListening}
          disabled={isThinking || isSpeaking}
        >
          <Badge color="error" variant="dot" invisible={!isSpeaking}>
            {isListening ? <ContinuousMicIcon /> : <MicIcon />}
          </Badge>
        </Fab>
      )}
      
      {/* Gesture mode button */}
      {cameraActive && (
        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
      )}
      <video
        ref={videoRef}
        style={{
          display: 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
    </Dialog>
  );
};

export default SpeakToMe; 