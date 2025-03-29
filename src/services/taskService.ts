import axios from 'axios';
import { API_URL } from '../config';

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// API endpoint
const TASK_API_ENDPOINT = `${API_URL}/api/asti/tasks`;

// Task status types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
  DEFERRED = 'deferred'
}

// Task priority levels
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Task categories
export enum TaskCategory {
  EMAIL = 'email',
  CALENDAR = 'calendar',
  HEALTH = 'health',
  WORK = 'work',
  PERSONAL = 'personal',
  FINANCE = 'finance',
  HOME = 'home',
  ERRANDS = 'errands',
  SOCIAL = 'social',
  LEARNING = 'learning',
  OTHER = 'other'
}

export enum TaskAssignedBy {
  USER = 'USER',
  AI = 'AI',
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR'
}

// Task interface matching the Knowledge Graph schema
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  category: TaskCategory;
  associated_email?: string;
  associated_emotion?: string;
  assigned_by: TaskAssignedBy;
  context_reasoning?: string;
  description?: string;
  completed_at?: string;
  tags: string[];
}

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  category?: TaskCategory;
  associated_email?: string;
  associated_emotion?: string;
  assigned_by?: TaskAssignedBy;
  context_reasoning?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  category?: TaskCategory;
  associated_email?: string;
  associated_emotion?: string;
  context_reasoning?: string;
  description?: string;
  completed_at?: string;
  tags?: string[];
}

// Mock data for testing when API is unavailable
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Respond to Sarah\'s email about project timeline',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    due_date: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
    created_at: new Date().toISOString(),
    category: TaskCategory.EMAIL,
    associated_email: 'sarah@example.com',
    associated_emotion: 'urgent',
    assigned_by: TaskAssignedBy.EMAIL,
    context_reasoning: 'This email contains urgent requests about project deadlines',
    description: 'Sarah needs information about the project timeline for the client meeting tomorrow.',
    tags: ['project-alpha', 'deadline']
  },
  {
    id: 'task-2',
    title: 'Prepare for meeting with design team',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    due_date: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    category: TaskCategory.WORK,
    assigned_by: TaskAssignedBy.CALENDAR,
    description: 'Review design proposals and prepare feedback',
    tags: ['design', 'feedback']
  },
  {
    id: 'task-3',
    title: 'Schedule doctor appointment',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    due_date: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    category: TaskCategory.HEALTH,
    assigned_by: TaskAssignedBy.USER,
    tags: ['health', 'personal']
  },
  {
    id: 'task-4',
    title: 'Buy groceries',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    category: TaskCategory.ERRANDS,
    assigned_by: TaskAssignedBy.USER,
    description: 'Milk, eggs, bread, fruits, vegetables',
    tags: ['shopping', 'home']
  },
  {
    id: 'task-5',
    title: 'Complete quarterly report',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    due_date: new Date(Date.now() + 3600 * 1000 * 36).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    category: TaskCategory.WORK,
    assigned_by: TaskAssignedBy.USER,
    description: 'Compile Q2 metrics and prepare executive summary',
    tags: ['report', 'deadline', 'quarterly']
  }
];

// Remove unused mockMemories array
// const mockMemories: MemoryItem[] = [
// ];

// Service functions
class TaskService {
  /**
   * Get all tasks for the current user
   */
  async getAllTasks(status?: TaskStatus, category?: TaskCategory): Promise<Task[]> {
    try {
      let url = TASK_API_ENDPOINT;
      const params = new URLSearchParams();
      
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return MOCK_TASKS; // Return mock data if API fails
    }
  }
  
  /**
   * Get prioritized tasks for the current user
   */
  async getPrioritizedTasks(limit: number = 3): Promise<Task[]> {
    try {
      const url = `${TASK_API_ENDPOINT}/prioritized?limit=${limit}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching prioritized tasks:', error);
      // Return mock data sorted by priority for testing
      return MOCK_TASKS
        .sort((a, b) => {
          const priorityOrder = {
            [TaskPriority.CRITICAL]: 0,
            [TaskPriority.HIGH]: 1,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 3
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, limit);
    }
  }
  
  /**
   * Get tasks by category
   */
  async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    try {
      const url = `${TASK_API_ENDPOINT}/category/${category}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for category ${category}:`, error);
      // Return mock data filtered by category
      return MOCK_TASKS.filter(task => task.category === category);
    }
  }
  
  /**
   * Get a specific task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const url = `${TASK_API_ENDPOINT}/${taskId}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      // Return mock task if found
      const mockTask = MOCK_TASKS.find(task => task.id === taskId);
      return mockTask || null;
    }
  }
  
  /**
   * Create a new task
   */
  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    try {
      const response = await axios.post(TASK_API_ENDPOINT, taskInput, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      // Return a mock task with a fake ID
      const mockTask: Task = {
        id: `task-${Date.now()}`,
        title: taskInput.title,
        status: taskInput.status || TaskStatus.PENDING,
        priority: taskInput.priority || TaskPriority.MEDIUM,
        due_date: taskInput.due_date,
        created_at: new Date().toISOString(),
        category: taskInput.category || TaskCategory.OTHER,
        associated_email: taskInput.associated_email,
        associated_emotion: taskInput.associated_emotion,
        assigned_by: taskInput.assigned_by || TaskAssignedBy.USER,
        context_reasoning: taskInput.context_reasoning,
        description: taskInput.description,
        tags: taskInput.tags || []
      };
      return mockTask;
    }
  }
  
  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updateData: UpdateTaskInput): Promise<Task> {
    try {
      const url = `${TASK_API_ENDPOINT}/${taskId}`;
      const response = await axios.patch(url, updateData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      // Find and update mock task
      const mockTaskIndex = MOCK_TASKS.findIndex(task => task.id === taskId);
      if (mockTaskIndex >= 0) {
        const updatedTask = { ...MOCK_TASKS[mockTaskIndex], ...updateData };
        // If completing the task, add completed_at
        if (updateData.status === TaskStatus.COMPLETE && !updateData.completed_at) {
          updatedTask.completed_at = new Date().toISOString();
        }
        return updatedTask;
      }
      throw new Error(`Task with ID ${taskId} not found`);
    }
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const url = `${TASK_API_ENDPOINT}/${taskId}`;
      await axios.delete(url, getAuthHeaders());
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      return false;
    }
  }
  
  /**
   * Mark a task as complete
   */
  async completeTask(taskId: string): Promise<Task> {
    return this.updateTask(taskId, {
      status: TaskStatus.COMPLETE,
      completed_at: new Date().toISOString()
    });
  }
  
  /**
   * Mark a task as in progress
   */
  async startTask(taskId: string): Promise<Task> {
    return this.updateTask(taskId, { status: TaskStatus.IN_PROGRESS });
  }
  
  /**
   * Defer a task
   */
  async deferTask(taskId: string, deferredDueDate?: string): Promise<Task> {
    const updateData: UpdateTaskInput = { status: TaskStatus.DEFERRED };
    if (deferredDueDate) {
      updateData.due_date = deferredDueDate;
    }
    return this.updateTask(taskId, updateData);
  }
  
  /**
   * Get test tasks (for development and testing)
   */
  async getTestTasks(count: number = 5): Promise<Task[]> {
    // Return a subset of mock tasks
    return MOCK_TASKS.slice(0, count);
  }
}

export const taskService = new TaskService();
export default taskService; 