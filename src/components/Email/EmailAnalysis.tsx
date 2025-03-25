import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  MoodBad as NegativeIcon,
  SentimentSatisfied as NeutralIcon,
  MoodOutlined as PositiveIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { EmailMessage, EmailAnalysis as EmailAnalysisType } from '../../types/email';

export interface EmailAnalysisProps {
  email: EmailMessage;
  analysis?: EmailAnalysisType | null;
  loading?: boolean;
  error?: string | null;
  onReply?: (content: string) => void;
}

export const EmailAnalysis: React.FC<EmailAnalysisProps> = ({
  email,
  analysis,
  loading = false,
  error = null,
  onReply
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No analysis available for this email.
      </Alert>
    );
  }

  const getStressColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSentimentIcon = (score: number) => {
    if (score < -0.2) return <NegativeIcon color="error" />;
    if (score > 0.2) return <PositiveIcon color="success" />;
    return <NeutralIcon color="action" />;
  };

  const getSentimentText = (score: number) => {
    if (score < -0.2) return 'Negative';
    if (score > 0.2) return 'Positive';
    return 'Neutral';
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Email Analysis
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Chip
          icon={
            analysis.stress_level === 'HIGH' ? <ErrorIcon /> :
            analysis.stress_level === 'MEDIUM' ? <WarningIcon /> :
            <InfoIcon />
          }
          label={`Stress: ${analysis.stress_level}`}
          color={getStressColor(analysis.stress_level) as any}
        />
        
        <Chip
          label={`Priority: ${analysis.priority}`}
          color={getPriorityColor(analysis.priority) as any}
        />
        
        <Chip
          icon={getSentimentIcon(analysis.sentiment_score)}
          label={`Sentiment: ${getSentimentText(analysis.sentiment_score)}`}
        />
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {analysis.summary && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Summary
          </Typography>
          <Typography variant="body2" paragraph>
            {analysis.summary}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </>
      )}
      
      {analysis.action_items && analysis.action_items.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Action Items
          </Typography>
          <List>
            {analysis.action_items?.map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={typeof item === 'string' ? item : item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}; 