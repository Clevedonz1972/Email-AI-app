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
  keyframes
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Send as SendIcon,
  VolumeUp as SpeakIcon,
  Delete as DeleteIcon,
  RestartAlt as ResetIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  RadioButtonChecked as ContinuousMicIcon
} from '@mui/icons-material';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { aiService, ConversationMessage, OpenAIVoice } from '@/services/aiService';

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
}

export const SpeakToMe: React.FC<SpeakToMeProps> = ({ open, onClose }) => {
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
  
  // Add a user message to the conversation
  const addUserMessage = async (text: string) => {
    // If text is empty and in continuous mode, don't add a message
    if (!text.trim() && continuousMode) return;
    
    const newMessage: ConversationMessage = {
      id: aiService.generateMessageId(),
      text,
      sender: 'user',
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Indicate that ASTI is thinking
    setIsThinking(true);
    
    try {
      // If mock responses are enabled, use the local mock functionality
      if (useMockResponses) {
        const mockResponse = aiService.getMockResponse(text);
        addAstiMessage(mockResponse.text);
        return;
      }
      
      // Otherwise continue with actual API calls
      // If we have audio, send the audio blob to the AI service
      if (audioRecording) {
        const response = await aiService.sendAudio(
          audioRecording, 
          updatedMessages,
          { 
            requestAudio: useTTS,
            voice: selectedVoice
          }
        );
        addAstiMessage(response.text, response.audio);
        setAudioRecording(null);
      } else {
        // Otherwise, send the text message
        const response = await aiService.sendMessage(
          text, 
          updatedMessages,
          { 
            requestAudio: useTTS,
            voice: selectedVoice
          }
        );
        addAstiMessage(response.text, response.audio);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get a response. Please try again.');
      setIsThinking(false);
    }
  };
  
  // Add an ASTI message to the conversation
  const addAstiMessage = (text: string, audioBase64?: string) => {
    const newMessage: ConversationMessage = {
      id: aiService.generateMessageId(),
      text,
      sender: 'asti',
      timestamp: Date.now()
    };
    
    setMessages([...messages, newMessage]);
    setIsThinking(false);
    
    // If we have an audio response and TTS is enabled, play it
    if (audioBase64 && useTTS) {
      playAudioResponse(audioBase64, text);
    } else if (useTTS) {
      // Fall back to browser TTS if we don't have audio response but TTS is enabled
      speakText(text);
    } else if (continuousMode) {
      // If TTS is disabled but in continuous mode, restart listening after a short delay
      setTimeout(restartListening, 500);
    }
  };
  
  // Play audio from base64 string
  const playAudioResponse = (audioBase64: string, fallbackText: string) => {
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
      // Fall back to speech synthesis
      speakText(fallbackText);
    }
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
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addUserMessage(inputText);
    setInputText('');
    
    // Stop listening after sending message
    if (isListening && !continuousMode) {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
      stopAudioRecording();
      setIsListening(false);
    }
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
  
  // Clear conversation history
  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear the entire conversation history? This cannot be undone.')) {
      setMessages([]);
      // Add a welcome message after clearing
      setTimeout(() => {
        addAstiMessage(
          "I've cleared our conversation history. How can I help you now?"
        );
      }, 500);
    }
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
      aria-labelledby="speak-to-me-dialog"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Speak to Me - ASTI Conversation</Typography>
          <Box display="flex" alignItems="center">
            {connectionStatus === 'connecting' && (
              <Tooltip title="Connecting to backend...">
                <CircularProgress size={20} sx={{ mr: 1 }} />
              </Tooltip>
            )}
            {connectionStatus === 'connected' && (
              <Tooltip title="Connected to backend">
                <Box 
                  component="span" 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    display: 'inline-block',
                    mr: 1
                  }} 
                />
              </Tooltip>
            )}
            {connectionStatus === 'error' && (
              <Tooltip title="Connection error">
                <Box 
                  component="span" 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main',
                    display: 'inline-block',
                    mr: 1
                  }} 
                />
              </Tooltip>
            )}
            <Tooltip title="Conversation Settings">
              <IconButton onClick={() => setShowSettings(!showSettings)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      
      <Collapse in={showSettings}>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Settings</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Conversation</Typography>
              
              <Box display="flex" gap={1} mb={2}>
                <Tooltip title="Clear Conversation History">
                  <Button 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={handleClearConversation}
                    variant="outlined"
                    size="small"
                  >
                    Clear History
                  </Button>
                </Tooltip>
                <Tooltip title="Reset ASTI">
                  <Button 
                    color="primary" 
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      setMessages([]);
                      addAstiMessage(
                        "Hi, I'm ASTI! I've been reset and I'm ready to chat. How can I help you today?"
                      );
                    }}
                    variant="outlined"
                    size="small"
                  >
                    Reset ASTI
                  </Button>
                </Tooltip>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={continuousMode} 
                    onChange={toggleContinuousMode}
                    color="secondary"
                  />
                }
                label="Continuous Conversation Mode"
              />
              <Typography variant="caption" sx={{ display: 'block', mt: -0.5, mb: 2 }}>
                Enables natural back-and-forth without pressing the mic button repeatedly
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={useMockResponses} 
                    onChange={(e) => setUseMockResponses(e.target.checked)}
                  />
                }
                label="Use Mock Responses"
              />
              <Typography variant="caption" sx={{ display: 'block', mt: -0.5, mb: 2 }}>
                Enable for offline use or when backend is unavailable
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Voice Settings</Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={useTTS} 
                    onChange={(e) => setUseTTS(e.target.checked)}
                  />
                }
                label="Enable Text-to-Speech"
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="voice-select-label">OpenAI Voice</InputLabel>
                <Select
                  labelId="voice-select-label"
                  value={selectedVoice}
                  onChange={handleVoiceChange}
                  label="OpenAI Voice"
                  disabled={!useTTS}
                >
                  {Object.values(OpenAIVoice).map((voice) => (
                    <MenuItem key={voice} value={voice}>
                      {getVoiceDisplayName(voice)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  // Test voice by getting a sample response
                  if (useMockResponses) {
                    // In mock mode, just use browser TTS
                    speakText("This is how your selected OpenAI voice will sound. With the actual API connected, you'll hear high-quality speech synthesis.");
                  } else {
                    // Otherwise attempt to get an actual sample from OpenAI
                    setIsThinking(true);
                    aiService.sendMessage(
                      "Please provide a brief voice sample saying: 'Hello, I'm ASTI, your AI assistant.'", 
                      [],
                      { requestAudio: true, voice: selectedVoice }
                    ).then(response => {
                      setIsThinking(false);
                      if (response.audio) {
                        playAudioResponse(response.audio, response.text);
                      } else {
                        speakText("Could not retrieve an audio sample from OpenAI. Please check your connection.");
                      }
                    }).catch(error => {
                      setIsThinking(false);
                      setError("Could not get a voice sample. Please try again later.");
                      console.error("Error getting voice sample:", error);
                    });
                  }
                }}
                startIcon={<SpeakIcon />}
                disabled={!useTTS}
              >
                Test Voice
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Divider />
      </Collapse>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          height: '400px', 
          overflowY: 'auto', 
          p: 2, 
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
        }}>
          {messages.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="100%" 
              color="text.secondary"
              textAlign="center"
              p={3}
            >
              <Typography variant="body1" gutterBottom>
                Welcome to your conversation with ASTI.
              </Typography>
              <Typography variant="body2">
                Start speaking or typing to begin. Everything you share is kept private.
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box 
                key={message.id}
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    maxWidth: '80%',
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' 
                      ? theme.palette.primary.light
                      : theme.palette.background.default,
                    color: message.sender === 'user' 
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary
                  }}
                >
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: message.sender === 'user' 
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.1)',
                      opacity: 0.7,
                      fontSize: '0.75rem'
                    }}
                  >
                    <span>
                      {message.sender === 'user' ? 'You' : 'ASTI'}
                    </span>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ mr: 1 }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                      
                      {message.sender === 'asti' && useTTS && (
                        <Tooltip title="Speak this response">
                          <IconButton 
                            size="small"
                            onClick={() => speakText(message.text)}
                          >
                            <SpeakIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))
          )}
          
          {isThinking && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography color="text.secondary">ASTI is thinking...</Typography>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
          {/* Mic button with mode selection */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
            {/* Continuous Mode Button with Animation */}
            {continuousMode ? (
              <Tooltip title={isListening ? "Stop Continuous Listening" : "Start Continuous Listening"}>
                <Fab 
                  color={isListening ? "secondary" : "primary"} 
                  aria-label="continuous-microphone"
                  onClick={toggleListening}
                  size="medium"
                  sx={{ 
                    position: 'relative',
                    animation: isListening ? `${swirl} 3s infinite` : 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: isListening ? theme.palette.secondary.main : theme.palette.primary.main,
                      opacity: 0.7,
                      animation: isListening ? `${pulseRing} 2s infinite` : 'none'
                    }
                  }}
                >
                  <ContinuousMicIcon />
                </Fab>
              </Tooltip>
            ) : (
              <Tooltip title={isListening ? "Stop listening" : "Start voice input"}>
                <Fab 
                  color={isListening ? "secondary" : "primary"} 
                  aria-label="microphone"
                  onClick={toggleListening}
                  size="medium"
                  sx={{ boxShadow: isListening ? 5 : 2 }}
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </Fab>
              </Tooltip>
            )}
            
            {/* Mode Toggle Switch */}
            <FormControlLabel
              control={
                <Switch 
                  checked={continuousMode} 
                  onChange={toggleContinuousMode}
                  size="small"
                  color="secondary"
                />
              }
              label="Continuous"
              sx={{ 
                mt: 1, 
                '& .MuiFormControlLabel-label': { 
                  fontSize: '0.75rem',
                  opacity: 0.8
                }
              }}
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={continuousMode && isListening ? "Listening... speak or type" : "Type your message here..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            disabled={isThinking}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px'
              }
            }}
          />
          
          <Tooltip title="Send message">
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isThinking}
              sx={{ ml: 1, bgcolor: inputText.trim() ? 'primary.main' : 'inherit', color: inputText.trim() ? 'white' : 'inherit' }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogActions>
      
      {/* Status indicator for continuous mode */}
      {continuousMode && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 4,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 1000
          }}
        >
          {isListening && (
            <>
              <CircularProgress size={12} color="secondary" />
              <span>Listening...</span>
            </>
          )}
          {isSpeaking && (
            <>
              <SpeakIcon fontSize="small" />
              <span>Speaking...</span>
            </>
          )}
          {!isListening && !isSpeaking && !isThinking && (
            <>
              <span>Continuous mode active. Waiting...</span>
            </>
          )}
        </Box>
      )}
    </Dialog>
  );
};

export default SpeakToMe; 