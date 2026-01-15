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

// ============================================
// Team & Collaboration Types
// ============================================

// Team member roles
export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';

// Project sharing roles
export type ProjectShareRole = 'viewer' | 'commenter' | 'editor' | 'co_owner';

// Invite status
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Team {
  id: string;
  name: string;
  note?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  // Populated fields from joins
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  token: string;
  invitedBy: string;
  status: InviteStatus;
  createdAt: Date;
  expiresAt: Date;
  // Populated fields
  team?: Team;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  teamId?: string;
  sharedWithUserId?: string;
  role: ProjectShareRole;
  createdAt: Date;
  // Populated fields
  team?: Team;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Email settings for SMTP/IMAP
export interface EmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPass?: string;
  imapSecure?: boolean;
}

// ============================================
// Dynamic Dashboard Types
// ============================================

// Widget types available for dashboard
export type WidgetType =
  | 'gantt'
  | 'dependency-flow'
  | 'calendar'
  | 'kanban'
  | 'status-lanes'
  | 'info-cards'
  | 'burndown'
  | 'velocity'
  | 'team-quick'
  | 'team-waiting'
  | 'project-list'
  | 'task-list'
  | 'mini-calendar'
  | 'notes'
  | 'resources';

// Widget width - 12 column grid system
// Number represents columns out of 12
export type WidgetColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Legacy widget width options (for backwards compatibility)
export type WidgetWidth = '25%' | '33%' | '50%' | '66%' | '75%' | '100%';

// Dashboard template types
export type DashboardTemplate = 'agile' | 'waterfall' | 'maintenance' | 'custom' | 'blank';

// Dashboard scope - global or project-specific
export type DashboardScope = 'global' | 'project';

// Individual widget configuration
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  width: WidgetWidth;
  columns?: WidgetColumns; // New 12-column grid width
  title?: string;
  config?: Record<string, any>;
}

// Row/Lane of widgets
export interface DashboardRow {
  id: string;
  name?: string; // Optional lane name
  widgets: DashboardWidget[];
}

// Complete dashboard layout
export interface DashboardLayout {
  id: string;
  name: string;
  emoji?: string; // Custom emoji/icon for the dashboard
  template: DashboardTemplate;
  scope: DashboardScope; // Global or project-specific
  projectId?: string; // If associated with a specific project
  userId: string;
  rows: DashboardRow[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean; // Is this the home/default dashboard
  order?: number; // Tab order
}

// Widget catalog entry (for widget picker)
export interface WidgetCatalogEntry {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultWidth: WidgetWidth;
  defaultColumns: WidgetColumns; // Default column span
  minColumns: WidgetColumns; // Minimum columns needed
  maxColumns: WidgetColumns; // Maximum columns allowed
  supportedWidths: WidgetWidth[];
  category: 'charts' | 'tasks' | 'team' | 'info' | 'utility';
}
