export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityEntry {
  id: string;
  taskId: string;
  action: string;
  timestamp: string;
  details?: string;
  userId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
  tagIds: string[];
  subtasks: Subtask[];
  dueDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  estimatedMinutes: number | null;
  isRecurring: boolean;
  recurringInterval: 'daily' | 'weekly' | 'monthly' | null;
}

export interface FilterConfig {
  status: 'all' | TaskStatus;
  priority: 'all' | Priority;
  projectId: 'all' | string;
  tagIds: string[];
  searchQuery: string;
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#e74c3c',
  high: '#ff4757',
  medium: '#ffa502',
  low: '#00b894',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export const DEFAULT_TAG_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#a29bfe', '#fd79a8', '#55efc4', '#81ecec',
];
