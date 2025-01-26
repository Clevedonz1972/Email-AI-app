import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Assignment, Error } from '@mui/icons-material';
import { useAI } from '../../hooks/useAI';
import { EmailSummary } from '../../services/ai/types';

interface EmailCardProps {
  email: {
    id: string;
    sender: string;
    subject: string;
    content: string;
    timestamp: string;
  };
}

export const EmailCard: React.FC<EmailCardProps> = ({ email }) => {
  const { analyzeEmail, loading, error } = useAI();
  const [analysis, setAnalysis] = useState<EmailSummary | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      const result = await analyzeEmail(email.content);
      if (result) {
        setAnalysis(result);
      }
    };
    performAnalysis();
  }, [email.content]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {email.subject}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          From: {email.sender}
        </Typography>
        
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Box display="flex" alignItems="center" color="error.main" my={2}>
            <Error sx={{ mr: 1 }} />
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {analysis && (
          <>
            <Box my={2}>
              <Chip 
                label={analysis.priority}
                color={getPriorityColor(analysis.priority) as any}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {analysis.summary}
              </Typography>
            </Box>

            {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
              <List dense>
                {analysis.suggestedActions.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assignment fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 