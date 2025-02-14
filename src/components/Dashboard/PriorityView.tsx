import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Warning, Error, Info, ExpandMore, VolumeUp } from '@mui/icons-material';
import { useEmailContext } from '../../contexts/EmailContext';
import { useSensoryPreferences } from '../../hooks/useSensoryPreferences';
import { useAccessibilityTracking } from '../../hooks/useAccessibilityTracking';

interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export const PriorityView: React.FC = () => {
  const { preferences } = useSensoryPreferences();
  const { emailStats } = useEmailContext();
  const { trackAccessibilityEvent } = useAccessibilityTracking();
  const [expanded, setExpanded] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
    trackAccessibilityEvent({
      type: 'keyboard',
      action: expanded ? 'collapse' : 'expand',
      element: 'PriorityView',
      timestamp: Date.now()
    });
  };

  const speakPriority = (text: string) => {
    if (audioEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = preferences.readingSpeed === 'slow' ? 0.8 : 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3,
        backgroundColor: preferences.contrast === 'high' ? '#000' : '#fff',
        color: preferences.contrast === 'high' ? '#fff' : '#000',
        transition: preferences.motion === 'reduced' ? 'none' : 'all 0.3s ease'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Priority Overview
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Audio Feedback"
          />
          <IconButton
            onClick={handleExpand}
            aria-expanded={expanded}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            <ExpandMore
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: preferences.motion === 'reduced' ? 'none' : 'transform 0.3s'
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {/* Urgent Items */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                color="error"
                onClick={() => speakPriority(`You have ${emailStats.high} urgent emails`)}
              >
                Urgent ({emailStats.high})
              </Typography>
              {emailStats.urgentEmails.map(email => (
                <Tooltip 
                  title={email.summary} 
                  key={email.id}
                  PopperProps={{
                    modifiers: [{
                      name: 'offset',
                      options: {
                        offset: [0, -8],
                      },
                    }],
                  }}
                >
                  <Chip
                    icon={<Error />}
                    label={email.subject}
                    color="error"
                    sx={{ 
                      m: 0.5,
                      fontSize: `${preferences.fontScale}rem`,
                      transition: preferences.motion === 'reduced' ? 'none' : 'all 0.3s'
                    }}
                    onClick={() => speakPriority(email.subject)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        speakPriority(email.subject);
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>

          {/* Priority Distribution */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Priority Distribution
              </Typography>
              <LinearProgress
                variant="buffer"
                value={(emailStats.high / emailStats.total) * 100}
                valueBuffer={(emailStats.high + emailStats.medium) / emailStats.total * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Grid>

          {/* Action Items */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Required Actions
              </Typography>
              {emailStats.actionRequired.map(action => (
                <Chip
                  key={action.id}
                  label={action.subject}
                  color="primary"
                  sx={{ m: 0.5 }}
                  onClick={() => {/* Handle click */}}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}; 