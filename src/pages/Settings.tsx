import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  SelectChangeEvent,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  VolumeUp as SpeakIcon,
  Save as SaveIcon,
  Refresh as ResetIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Navbar } from '@/components/Navigation/Navbar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OpenAIVoice, aiService } from '@/services/aiService';

const Settings: React.FC = () => {
  // Voice settings
  const [selectedVoice, setSelectedVoice] = useLocalStorage<OpenAIVoice>('asti-voice', OpenAIVoice.NOVA);
  const [useTTS, setUseTTS] = useLocalStorage<boolean>('asti-use-tts', true);
  
  // App settings
  const [useMockResponses, setUseMockResponses] = useLocalStorage<boolean>('asti-use-mock', process.env.NODE_ENV === 'development');
  const [saveConversationHistory, setSaveConversationHistory] = useLocalStorage<boolean>('asti-save-history', true);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('asti-dark-mode', true);
  const [continuousMode, setContinuousMode] = useLocalStorage<boolean>('asti-continuous-mode', false);
  
  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testingVoice, setTestingVoice] = useState(false);
  
  // Handle voice selection
  const handleVoiceChange = (event: SelectChangeEvent) => {
    setSelectedVoice(event.target.value as OpenAIVoice);
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
  
  // Test the selected OpenAI voice
  const testVoice = () => {
    if (useMockResponses) {
      // In mock mode, just use browser TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "This is how your selected OpenAI voice will sound. With the actual API connected, you'll hear high-quality speech synthesis."
        );
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Otherwise attempt to get an actual sample from OpenAI
      setTestingVoice(true);
      aiService.sendMessage(
        "Please provide a brief voice sample saying: 'Hello, I'm ASTI, your AI assistant.'", 
        [],
        { requestAudio: true, voice: selectedVoice }
      ).then(response => {
        setTestingVoice(false);
        if (response.audio) {
          // Play the audio
          const audio = new Audio(`data:audio/mp3;base64,${response.audio}`);
          audio.play();
        } else {
          // Fallback to browser TTS
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(
              "Could not retrieve an audio sample from OpenAI. Please check your connection."
            );
            window.speechSynthesis.speak(utterance);
          }
          setSnackbarMessage('Could not get a voice sample from OpenAI. Check your connection.');
          setSnackbarOpen(true);
        }
      }).catch(error => {
        setTestingVoice(false);
        setSnackbarMessage('Error getting voice sample. Please try again later.');
        setSnackbarOpen(true);
        console.error("Error getting voice sample:", error);
      });
    }
  };
  
  // Save all settings
  const saveSettings = () => {
    // All settings are automatically saved via useLocalStorage
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarOpen(true);
  };
  
  // Reset all settings to defaults
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSelectedVoice(OpenAIVoice.NOVA);
      setUseTTS(true);
      setUseMockResponses(process.env.NODE_ENV === 'development');
      setSaveConversationHistory(true);
      setDarkMode(true);
      setContinuousMode(false);
      
      setSnackbarMessage('Settings reset to defaults');
      setSnackbarOpen(true);
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#222' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
          Settings
        </Typography>
        
        <Grid container spacing={3}>
          {/* Voice Settings Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Voice Settings" 
                avatar={<SpeakIcon />}
                action={
                  <Button 
                    startIcon={testingVoice ? <CircularProgress size={16} /> : <SpeakIcon />}
                    onClick={testVoice}
                    size="small"
                    disabled={testingVoice || !useTTS}
                  >
                    Test
                  </Button>
                }
              />
              <Divider />
              <CardContent>
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
                
                <FormControl fullWidth margin="normal" disabled={!useTTS}>
                  <InputLabel id="voice-select-label">OpenAI Voice</InputLabel>
                  <Select
                    labelId="voice-select-label"
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                    label="OpenAI Voice"
                  >
                    {Object.values(OpenAIVoice).map((voice) => (
                      <MenuItem key={voice} value={voice}>
                        {getVoiceDisplayName(voice)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  ASTI uses OpenAI's high-quality voices for more natural-sounding speech. 
                  Different voices have different characteristics and speaking styles.
                </Typography>
                
                {useMockResponses && useTTS && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    In mock mode, you'll hear browser-generated speech instead of OpenAI's premium voices.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Application Settings Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Application Settings" 
                avatar={<SettingsIcon />}
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={saveConversationHistory}
                        onChange={(e) => setSaveConversationHistory(e.target.checked)}
                      />
                    }
                    label="Save Conversation History"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={continuousMode}
                        onChange={(e) => setContinuousMode(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Continuous Conversation Mode"
                  />
                  <Typography variant="caption" sx={{ ml: 0.5, mt: -1.5, mb: 0.5 }}>
                    Enables natural back-and-forth speech without pressing buttons repeatedly
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
                  <Typography variant="caption">
                    Enable for offline use or when backend is unavailable
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Settings Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<ResetIcon />}
            onClick={resetSettings}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={saveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Settings; 