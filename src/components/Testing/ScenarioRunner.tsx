import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FeedbackForm, FeedbackData } from './FeedbackForm';
import { testScenarios, testMetrics } from '../../test/setup/testConfig';

interface ScenarioRunnerProps {
  scenarioId: string;
  onComplete: (feedback: FeedbackData) => void;
  onNextScenario: () => void;
}

interface TaskTiming {
  taskId: number;
  startTime: number;
  endTime?: number;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({
  scenarioId,
  onComplete,
  onNextScenario,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timings, setTimings] = useState<TaskTiming[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scenario = testScenarios.find(s => s.id === scenarioId);
  
  if (!scenario) {
    return <Alert severity="error">Scenario not found</Alert>;
  }

  useEffect(() => {
    // Start timing for first task
    setTimings([{ taskId: 0, startTime: Date.now() }]);
  }, []);

  const handleNext = () => {
    // Record end time for current task
    setTimings(prev => prev.map(timing => 
      timing.taskId === activeStep ? { ...timing, endTime: Date.now() } : timing
    ));

    if (activeStep === scenario.tasks.length - 1) {
      setShowFeedback(true);
    } else {
      // Start timing for next task
      setActiveStep(prev => prev + 1);
      setTimings(prev => [...prev, { taskId: activeStep + 1, startTime: Date.now() }]);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFeedbackSubmit = (feedback: FeedbackData) => {
    try {
      // Calculate metrics
      const taskTimings = timings.map(timing => ({
        taskId: timing.taskId,
        duration: timing.endTime ? timing.endTime - timing.startTime : 0,
      }));

      const enrichedFeedback = {
        ...feedback,
        timings: taskTimings,
        completedAt: new Date().toISOString(),
      };

      onComplete(enrichedFeedback);
      onNextScenario();
    } catch (err) {
      setError('Failed to save feedback. Please try again.');
    }
  };

  return (
    <Paper sx={{ p: 3 }} role="region" aria-label={`Test Scenario: ${scenario.name}`}>
      <Typography variant="h5" gutterBottom>
        {scenario.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!showFeedback ? (
        <>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {scenario.tasks.map((task, index) => (
              <Step key={index}>
                <StepLabel>{`Task ${index + 1}`}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Current Task
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {scenario.tasks[activeStep]}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Success Criteria:
            </Typography>
            <Typography variant="body2">
              {scenario.successCriteria[activeStep]}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
            >
              {activeStep === scenario.tasks.length - 1 ? 'Complete Tasks' : 'Next Task'}
            </Button>
          </Box>
        </>
      ) : (
        <FeedbackForm
          scenarioId={scenarioId}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </Paper>
  );
}; 