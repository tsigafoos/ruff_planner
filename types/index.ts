// Type definitions for BarkItDone
// Using loose TypeScript - types can be added incrementally

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: number; // 1-4
  projectId?: string;
  labelIds: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recurringPattern?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  userId: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  userId: string;
}
