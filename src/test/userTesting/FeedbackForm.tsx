import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Rating,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Stack
} from '@mui/material';

interface FeedbackFormProps {
  taskName: string;
  onSubmit: (feedback: TaskFeedback) => void;
}

interface TaskFeedback {
  taskName: string;
  satisfactionScore: number;
  difficultyRating: number;
  accessibilityIssues: string[];
  comments: string;
  completedSuccessfully: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  taskName,
  onSubmit
}) => {
  const [feedback, setFeedback] = useState<TaskFeedback>({
    taskName,
    satisfactionScore: 0,
    difficultyRating: 0,
    accessibilityIssues: [],
    comments: '',
    completedSuccessfully: false
  });

  const accessibilityIssueOptions = [
    'Difficult to read text',
    'Confusing navigation',
    'Hard to use with keyboard',
    'Colors are hard to distinguish',
    'Motion/animations are distracting',
    'Screen reader issues',
    'Focus indicators not visible',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Task Feedback: {taskName}
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography component="legend">How satisfied were you with this task?</Typography>
          <Rating
            value={feedback.satisfactionScore}
            onChange={(_, value) => 
              setFeedback(prev => ({ ...prev, satisfactionScore: value || 0 }))
            }
          />
        </Box>

        <Box>
          <Typography component="legend">How difficult was this task?</Typography>
          <Rating
            value={feedback.difficultyRating}
            onChange={(_, value) => 
              setFeedback(prev => ({ ...prev, difficultyRating: value || 0 }))
            }
          />
        </Box>

        <Box>
          <Typography component="legend">Did you encounter any accessibility issues?</Typography>
          {accessibilityIssueOptions.map(issue => (
            <FormControlLabel
              key={issue}
              control={
                <Checkbox
                  checked={feedback.accessibilityIssues.includes(issue)}
                  onChange={(e) => {
                    setFeedback(prev => ({
                      ...prev,
                      accessibilityIssues: e.target.checked
                        ? [...prev.accessibilityIssues, issue]
                        : prev.accessibilityIssues.filter(i => i !== issue)
                    }));
                  }}
                />
              }
              label={issue}
            />
          ))}
        </Box>

        <TextField
          label="Additional Comments"
          multiline
          rows={4}
          value={feedback.comments}
          onChange={(e) => 
            setFeedback(prev => ({ ...prev, comments: e.target.value }))
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={feedback.completedSuccessfully}
              onChange={(e) => 
                setFeedback(prev => ({ 
                  ...prev, 
                  completedSuccessfully: e.target.checked 
                }))
              }
            />
          }
          label="I completed this task successfully"
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          size="large"
        >
          Submit Feedback
        </Button>
      </Stack>
    </Paper>
  );
}; 