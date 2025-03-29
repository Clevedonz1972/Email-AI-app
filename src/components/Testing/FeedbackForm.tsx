 1060import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Rating,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Slider,
  Stack,
} from '@mui/material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface FeedbackFormProps {
  scenarioId: string;
  onSubmit: (feedback: FeedbackData) => void;
}

export interface FeedbackData {
  scenarioId: string;
  taskCompletionRating: number;
  usabilityRating: number;
  accessibilityRating: number;
  focusModeHelpful: boolean;
  stressLevelChange: number;
  aiSuggestionsHelpful: boolean;
  navigationEase: number;
  difficulties: string[];
  suggestions: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ scenarioId, onSubmit }) => {
  const { preferences } = useAccessibility();
  const [feedback, setFeedback] = useState<FeedbackData>({
    scenarioId,
    taskCompletionRating: 0,
    usabilityRating: 0,
    accessibilityRating: 0,
    focusModeHelpful: false,
    stressLevelChange: 0,
    aiSuggestionsHelpful: false,
    navigationEase: 5,
    difficulties: [],
    suggestions: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setFeedback(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty],
    }));
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ p: 3 }}
      role="form"
      aria-label="User Testing Feedback"
    >
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Feedback Form
        </Typography>

        <Box>
          <FormLabel id="task-completion-label">
            How well were you able to complete the tasks?
          </FormLabel>
          <Rating
            name="task-completion"
            value={feedback.taskCompletionRating}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, taskCompletionRating: value || 0 }))}
            aria-labelledby="task-completion-label"
          />
        </Box>

        <Box>
          <FormLabel id="usability-label">
            How easy was the interface to use?
          </FormLabel>
          <Rating
            name="usability"
            value={feedback.usabilityRating}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, usabilityRating: value || 0 }))}
            aria-labelledby="usability-label"
          />
        </Box>

        <Box>
          <FormLabel id="accessibility-label">
            How accessible were the features?
          </FormLabel>
          <Rating
            name="accessibility"
            value={feedback.accessibilityRating}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, accessibilityRating: value || 0 }))}
            aria-labelledby="accessibility-label"
          />
        </Box>

        <FormControl>
          <FormLabel id="focus-mode-label">
            Was the focus mode helpful?
          </FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={feedback.focusModeHelpful}
                onChange={(e) => setFeedback(prev => ({ ...prev, focusModeHelpful: e.target.checked }))}
                name="focus-mode"
              />
            }
            label="Yes, focus mode helped me concentrate"
          />
        </FormControl>

        <Box>
          <FormLabel id="stress-level-label">
            How did your stress level change while using the app?
          </FormLabel>
          <Slider
            value={feedback.stressLevelChange}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, stressLevelChange: value as number }))}
            min={-5}
            max={5}
            marks
            step={1}
            valueLabelDisplay="auto"
            aria-labelledby="stress-level-label"
            valueLabelFormat={(value) => value > 0 ? `+${value}` : value.toString()}
          />
        </Box>

        <FormControl>
          <FormLabel id="difficulties-label">
            What difficulties did you encounter?
          </FormLabel>
          <Stack>
            {['Navigation', 'Reading', 'Focus', 'Understanding', 'Visual', 'Other'].map(difficulty => (
              <FormControlLabel
                key={difficulty}
                control={
                  <Checkbox
                    checked={feedback.difficulties.includes(difficulty)}
                    onChange={() => handleDifficultyToggle(difficulty)}
                    name={`difficulty-${difficulty.toLowerCase()}`}
                  />
                }
                label={difficulty}
              />
            ))}
          </Stack>
        </FormControl>

        <TextField
          multiline
          rows={4}
          label="Suggestions for improvement"
          value={feedback.suggestions}
          onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
          fullWidth
          aria-label="Suggestions for improvement"
          inputProps={{
            style: {
              fontSize: preferences.fontSize,
              lineHeight: preferences.lineSpacing,
            }
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          Submit Feedback
        </Button>
      </Stack>
    </Paper>
  );
}; 