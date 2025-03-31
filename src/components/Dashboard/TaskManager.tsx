import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { 
  CheckCircleOutline, 
  PlayArrow, 
  Schedule, 
  CalendarToday, 
  MoreVert, 
  Add,
  ArrowForward
} from '@mui/icons-material';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import taskService, { Task, TaskStatus, TaskPriority } from '@/services/taskService';
import ActionButtons from '@/components/shared/ActionButtons';
import { useDashboardContext } from '@/contexts/DashboardContext';

interface TaskManagerProps {
  maxTasks?: number;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ maxTasks = 5 }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openSpeakToMe } = useDashboardContext();

  // Fetch prioritized tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const prioritizedTasks = await taskService.getPrioritizedTasks(maxTasks);
        setTasks(prioritizedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [maxTasks]);

  // Handle task actions
  const handleDoItNow = async (type: 'email' | 'calendar' | 'task' | 'wellbeing', taskId?: string) => {
    if (!taskId) return;
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: TaskStatus.IN_PROGRESS } 
            : task
        )
      );
      
      // Update in backend
      await taskService.startTask(taskId);
      navigate(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Error starting task:', err);
      refreshTasks();
    }
  };

  const handleDefer = async (type: 'email' | 'calendar' | 'task' | 'wellbeing', taskId?: string) => {
    if (!taskId) return;
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: TaskStatus.DEFERRED } 
            : task
        )
      );
      
      // Update in backend
      await taskService.deferTask(taskId);
    } catch (err) {
      console.error('Error deferring task:', err);
      refreshTasks();
    }
  };

  const handleAskASTI = (type: 'email' | 'calendar' | 'task' | 'wellbeing', taskId?: string) => {
    console.log(`Asking ASTI about task ${taskId}`);
    // Use the DashboardContext to open the SpeakToMe dialog
    openSpeakToMe();
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: TaskStatus.COMPLETE } 
            : task
        )
      );
      
      // Update in backend
      await taskService.completeTask(taskId);
    } catch (err) {
      console.error('Error completing task:', err);
      // Revert optimistic update on error
      refreshTasks();
    }
  };

  // Refresh tasks from API
  const refreshTasks = async () => {
    try {
      const prioritizedTasks = await taskService.getPrioritizedTasks(maxTasks);
      setTasks(prioritizedTasks);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  // Navigate to create new task
  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  // Navigate to task dashboard
  const handleViewAllTasks = () => {
    navigate('/tasks');
  };

  // Format due date for display
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    try {
      const date = parseISO(dueDate);
      
      if (isPast(date) && !isToday(date)) {
        return <Chip label={`Overdue: ${format(date, 'MMM d')}`} color="error" size="small" />;
      } else if (isToday(date)) {
        return <Chip label="Due Today" color="warning" size="small" />;
      } else if (isTomorrow(date)) {
        return <Chip label="Due Tomorrow" color="info" size="small" />;
      } else {
        return <Chip label={`Due ${format(date, 'MMM d')}`} color="default" size="small" />;
      }
    } catch (err) {
      console.error('Error parsing date:', err);
      return null;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL:
        return 'error';
      case TaskPriority.HIGH:
        return 'warning';
      case TaskPriority.MEDIUM:
        return 'info';
      case TaskPriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Tasks</Typography>
          <Box sx={{ mb: 3 }}>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={20} width="60%" />
              </Box>
            ))}
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Tasks</Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            onClick={refreshTasks}
            startIcon={<Schedule />}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tasks</Typography>
          <Button 
            size="small" 
            startIcon={<Add />}
            onClick={handleCreateTask}
          >
            New Task
          </Button>
        </Box>

        {tasks.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No tasks to show. Create a new task to get started.
          </Alert>
        ) : (
          <Stack spacing={2} sx={{ mb: 3 }}>
            {tasks.map((task) => (
              <Box 
                key={task.id} 
                sx={{ 
                  p: 1.5, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  backgroundColor: task.status === TaskStatus.COMPLETE ? 'action.hover' : 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      textDecoration: task.status === TaskStatus.COMPLETE ? 'line-through' : 'none',
                      color: task.status === TaskStatus.COMPLETE ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {task.title}
                  </Typography>
                  
                  {task.status !== TaskStatus.COMPLETE && (
                    <ActionButtons 
                      type="task"
                      onDoItNow={(type) => handleDoItNow(type, task.id)}
                      onDefer={(type) => handleDefer(type, task.id)}
                      onAskASTI={(type) => handleAskASTI(type, task.id)}
                      size="small"
                    />
                  )}
                  
                  {task.status === TaskStatus.COMPLETE && (
                    <Tooltip title="Completed">
                      <CheckCircleOutline color="success" />
                    </Tooltip>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip 
                    label={task.category} 
                    size="small" 
                    variant="outlined" 
                  />
                  
                  <Chip 
                    label={task.priority} 
                    size="small" 
                    color={getPriorityColor(task.priority)} 
                    variant="outlined" 
                  />
                  
                  {task.due_date && formatDueDate(task.due_date)}
                  
                  {task.status === TaskStatus.IN_PROGRESS && (
                    <Chip label="In Progress" size="small" color="info" variant="outlined" />
                  )}
                  
                  {task.status === TaskStatus.DEFERRED && (
                    <Chip label="Deferred" size="small" color="default" variant="outlined" />
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            endIcon={<ArrowForward />} 
            onClick={handleViewAllTasks}
            size="small"
          >
            View All Tasks
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskManager; 