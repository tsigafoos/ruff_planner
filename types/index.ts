// Type definitions for BarkItDone
// Using loose TypeScript - types can be added incrementally

// Task status values (shared across all project types)
export type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

// Project types
export type ProjectType = 'waterfall' | 'agile' | 'maintenance';

// Agile workflow phases (only used for Agile projects)
export type ProjectPhase = 'brainstorm' | 'design' | 'logic' | 'polish' | 'done';

// Maintenance categories (only used for Maintenance projects)
export type MaintenanceCategory = 'bug' | 'enhancement' | 'support' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  startDate?: Date;
  priority: number; // 1-4
  projectId?: string;
  labelIds: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recurringPattern?: string;
  status: TaskStatus; // Primary state (to_do, in_progress, blocked, etc.)
  projectPhase?: ProjectPhase; // Agile-only: brainstorm, design, logic, polish, done
  assigneeId?: string; // Single assignee (user ID)
  blockedBy?: string[]; // Array of task IDs that block this task
  category?: MaintenanceCategory; // Maintenance-only: bug, enhancement, support, other
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  projectType?: ProjectType; // waterfall, agile, or maintenance
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
