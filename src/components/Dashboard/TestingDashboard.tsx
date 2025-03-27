import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface TestScenario {
  id: string;
  name: string;
  completed: boolean;
  feedback?: string;
}

interface TestingMetrics {
  totalScenarios: number;
  completedScenarios: number;
  feedbackCount: number;
  issuesReported: number;
  averageRating: number;
}

export const TestingDashboard: React.FC = () => {
  const theme = useTheme();
  const { highContrast, textScale } = useAccessibility();
  const [metrics, setMetrics] = useState<TestingMetrics>({
    totalScenarios: 6,
    completedScenarios: 0,
    feedbackCount: 0,
    issuesReported: 0,
    averageRating: 0,
  });

  const [scenarios, setScenarios] = useState<TestScenario[]>([
    { id: '1', name: 'Initial Onboarding', completed: false },
    { id: '2', name: 'Email Processing & Stress Analysis', completed: false },
    { id: '3', name: 'Simplified View Mode', completed: false },
    { id: '4', name: 'AI-Assisted Replies', completed: false },
    { id: '5', name: 'Accessibility Features', completed: false },
    { id: '6', name: 'Stress Management', completed: false },
  ]);

  const [feedbackDialog, setFeedbackDialog] = useState({
    open: false,
    scenarioId: '',
    feedback: '',
  });

  useEffect(() => {
    // Fetch testing progress from API
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/testing/progress');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching testing progress:', error);
      }
    };

    fetchProgress();
  }, []);

  const handleScenarioComplete = async (scenarioId: string) => {
    try {
      await fetch('/api/testing/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      setScenarios(scenarios.map(s => 
        s.id === scenarioId ? { ...s, completed: true } : s
      ));
    } catch (error) {
      console.error('Error marking scenario as complete:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await fetch('/api/testing/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: feedbackDialog.scenarioId,
          feedback: feedbackDialog.feedback,
        }),
      });

      setFeedbackDialog({ open: false, scenarioId: '', feedback: '' });
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        feedbackCount: prev.feedbackCount + 1,
      }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontSize: `${1.5 * (textScale / 100)}rem`,
        color: highContrast ? theme.palette.common.white : theme.palette.text.primary 
      }}>
        User Testing Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Testing Progress</Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(metrics.completedScenarios / metrics.totalScenarios) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {metrics.completedScenarios} of {metrics.totalScenarios} scenarios completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feedback Statistics</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={`Total Feedback: ${metrics.feedbackCount}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`Issues Reported: ${metrics.issuesReported}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`Average Rating: ${metrics.averageRating.toFixed(1)}/5.0`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Test Scenarios */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Test Scenarios</Typography>
              <List>
                {scenarios.map((scenario) => (
                  <ListItem key={scenario.id}>
                    <ListItemText primary={scenario.name} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={scenario.completed ? "Completed" : "Pending"}
                        color={scenario.completed ? "success" : "default"}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setFeedbackDialog({
                          open: true,
                          scenarioId: scenario.id,
                          feedback: '',
                        })}
                      >
                        Add Feedback
                      </Button>
                      {!scenario.completed && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleScenarioComplete(scenario.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialog.open}
        onClose={() => setFeedbackDialog({ ...feedbackDialog, open: false })}
      >
        <DialogTitle>Add Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Feedback"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={feedbackDialog.feedback}
            onChange={(e) => setFeedbackDialog({
              ...feedbackDialog,
              feedback: e.target.value,
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog({ ...feedbackDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 