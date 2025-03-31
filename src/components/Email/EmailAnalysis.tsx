import React from 'react';
import { Box, Typography, Paper, CircularProgress, Divider, Chip, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { EmailMessage } from '../../types/email';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoodIcon from '@mui/icons-material/Mood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export interface EmailAnalysisProps {
  email?: EmailMessage;
  analysis?: any;
  loading?: boolean;
  error?: string | null;
  onReply?: (replyText: string) => void;
}

export const EmailAnalysis: React.FC<EmailAnalysisProps> = ({
  email,
  analysis,
  loading = false,
  error = null,
  onReply
}) => {
  const handleUseSuggestedResponse = () => {
    if (onReply && analysis?.suggested_response) {
      onReply(analysis.suggested_response);
    }
  };

  const getStressLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>ASTI's Analysis</Typography>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      
      {!loading && !error && analysis && (
        <Box sx={{ mt: 2 }}>
          {/* Summary */}
          <Typography variant="subtitle1" fontWeight="medium">
            Summary
          </Typography>
          <Typography variant="body2" paragraph>
            {analysis.summary}
          </Typography>

          <Divider sx={{ my: 1.5 }} />
          
          {/* Emotional Context */}
          <Box display="flex" alignItems="center" mb={1}>
            <MoodIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Emotional Context
            </Typography>
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip 
              label={`Tone: ${analysis.emotional_tone || 'Neutral'}`} 
              size="small"
              color="primary"
              variant="outlined" 
            />
            <Chip 
              label={`Stress level: ${analysis.stress_level || 'MEDIUM'}`} 
              size="small"
              color={getStressLevelColor(analysis.stress_level || 'MEDIUM')}
            />
            {analysis.needs_immediate_attention && (
              <Chip 
                icon={<WarningIcon />}
                label="Needs attention" 
                size="small"
                color="error"
              />
            )}
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          {/* Expectations */}
          {(analysis.explicit_expectations?.length > 0 || analysis.implicit_expectations?.length > 0) && (
            <>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Sender's Expectations
              </Typography>
              
              {analysis.explicit_expectations?.length > 0 && (
                <>
                  <Typography variant="body2" fontWeight="medium">
                    Explicitly stated:
                  </Typography>
                  <List dense disablePadding>
                    {analysis.explicit_expectations.map((exp: string, i: number) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <ArrowRightIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={exp} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              {analysis.implicit_expectations?.length > 0 && (
                <>
                  <Typography variant="body2" fontWeight="medium" mt={1}>
                    Implied:
                  </Typography>
                  <List dense disablePadding>
                    {analysis.implicit_expectations.map((exp: string, i: number) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <ArrowRightIcon fontSize="small" color="disabled" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={exp} 
                          primaryTypographyProps={{ color: 'text.secondary' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              <Divider sx={{ my: 1.5 }} />
            </>
          )}
          
          {/* Suggested Actions */}
          {analysis.suggested_actions?.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Suggested Actions
              </Typography>
              
              <List dense disablePadding>
                {analysis.suggested_actions.map((action: any, i: number) => (
                  <Box key={i} mb={1.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {action.action}
                      {action.deadline && (
                        <Box component="span" display="inline-flex" alignItems="center" ml={1}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {action.deadline}
                        </Box>
                      )}
                    </Typography>
                    
                    {action.steps?.length > 0 && (
                      <List dense disablePadding sx={{ pl: 2 }}>
                        {action.steps.map((step: string, j: number) => (
                          <ListItem key={j} disablePadding>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckCircleIcon fontSize="small" color="disabled" />
                            </ListItemIcon>
                            <ListItemText primary={step} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ))}
              </List>
              
              <Divider sx={{ my: 1.5 }} />
            </>
          )}
          
          {/* Suggested Response */}
          {analysis.suggested_response && (
            <>
              <Box display="flex" alignItems="center" mb={1}>
                <FormatQuoteIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Suggested Response
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ 
                backgroundColor: 'grey.100', 
                p: 1.5, 
                borderRadius: 1,
                fontStyle: 'italic',
                mb: 1.5
              }}>
                {analysis.suggested_response}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleUseSuggestedResponse}
                disabled={!onReply}
              >
                Use this response
              </Button>
            </>
          )}
        </Box>
      )}
      
      {!loading && !error && !analysis && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {email ? 'Analysis for this email is not yet available.' : 'No email selected for analysis'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EmailAnalysis; 