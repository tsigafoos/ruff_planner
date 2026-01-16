import { create } from 'zustand';
import { Platform } from 'react-native';
import { database } from '../lib/db';
import { supabase } from '../lib/supabase/client';
import { Task as TaskModel } from '../lib/db';
import { ProjectPhase, TaskStatus, RecurrenceConfig } from '../types';
import { createRegeneratedTask } from '../lib/recurrence';

// Valid phase values for Agile workflow
export const AGILE_PHASES: ProjectPhase[] = ['brainstorm', 'design', 'logic', 'polish', 'done'];

// Get the next phase in the Agile workflow (for mobile "next phase" button)
export function getNextPhase(currentPhase: ProjectPhase | null): ProjectPhase | null {
  if (!currentPhase) return 'brainstorm';
  const currentIndex = AGILE_PHASES.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex >= AGILE_PHASES.length - 1) return null;
  return AGILE_PHASES[currentIndex + 1];
}

interface TaskStore {
  tasks: any[];
  loading: boolean;
  fetchTasks: (userId: string) => Promise<void>;
  fetchTasksByProject: (projectId: string, userId: string) => Promise<void>;
  fetchTasksByLabel: (labelId: string, userId: string) => Promise<void>;
  fetchTasksDueToday: (userId: string) => Promise<void>;
  fetchTasksDueUpcoming: (userId: string) => Promise<void>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (taskId: string, updates: any) => Promise<void>;
  updateTaskPhase: (taskId: string, newPhase: ProjectPhase | null) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<{ regeneratedTask?: any }>;
  uncompleteTask: (taskId: string) => Promise<void>;
  // Dependency management
  addBlocker: (taskId: string, blockerTaskId: string) => Promise<{ success: boolean; circular?: boolean }>;
  removeBlocker: (taskId: string, blockerTaskId: string) => Promise<void>;
  getBlockedBy: (taskId: string) => string[];
  getBlockingTasks: (taskId: string) => any[];
  hasCircularDependency: (taskId: string, potentialBlockerId: string) => boolean;
}

// Helper to parse blocked_by field
function parseBlockedBy(task: any): string[] {
  if (!task) return [];
  const blockedBy = task.blocked_by || task.blockedBy;
  if (!blockedBy) return [];
  if (Array.isArray(blockedBy)) return blockedBy;
  try {
    return JSON.parse(blockedBy);
  } catch {
    return [];
  }
}

// Helper function to get or create default project ID
async function getDefaultProjectId(userId: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Check if default project exists
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      return existing.id;
    }

    // Create default project if it doesn't exist
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        name: 'To-Do List',
        color: '#6B7280',
        icon: 'list',
        project_type: 'waterfall',
        is_default: true,
        user_id: userId,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newProject.id;
  } else {
    // Native: Use WatermelonDB with Q query
    const { Q } = require('@nozbe/watermelondb');
    const projectsCollection = database.get('projects');
    const existing = await projectsCollection
      .query(
        Q.where('user_id', userId),
        Q.where('is_default', true)
      )
      .fetch();

    if (existing.length > 0) {
      return existing[0].id;
    }

    const newProject = await projectsCollection.create((project: any) => {
      project.name = 'To-Do List';
      project.color = '#6B7280';
      project.icon = 'list';
      project.isDefault = true;
      project.userId = userId;
    });

    return newProject.id;
  }
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        // Use Supabase directly on web
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ tasks: data || [], loading: false });
      } else {
        // Use WatermelonDB on native
        const { Q } = require('@nozbe/watermelondb');
        const tasksCollection = database.get('tasks');
        const tasks = await tasksCollection
          .query(Q.where('user_id', userId))
          .fetch();
        set({ tasks, loading: false });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ loading: false });
    }
  },

  fetchTasksByProject: async (projectId: string, userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ tasks: data || [], loading: false });
      } else {
        const { Q } = require('@nozbe/watermelondb');
        const tasksCollection = database.get('tasks');
        const tasks = await tasksCollection
          .query(
            Q.where('project_id', projectId),
            Q.where('user_id', userId)
          )
          .fetch();
        set({ tasks, loading: false });
      }
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      set({ loading: false });
    }
  },

  fetchTasksByLabel: async (labelId: string, userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter tasks that have this label
        const filteredTasks = (data || []).filter((task: any) => {
          const labelIds = typeof task.label_ids === 'string' 
            ? JSON.parse(task.label_ids || '[]') 
            : (task.label_ids || []);
          return labelIds.includes(labelId);
        });
        
        set({ tasks: filteredTasks, loading: false });
      } else {
        const { Q } = require('@nozbe/watermelondb');
        const tasksCollection = database.get('tasks');
        const tasks = await tasksCollection
          .query(Q.where('user_id', userId))
          .fetch();
        
        const filteredTasks = tasks.filter((task: any) => {
          const labelIds = typeof task.labelIds === 'string'
            ? JSON.parse(task.labelIds || '[]')
            : (task.labelIds || []);
          return labelIds.includes(labelId);
        });
        
        set({ tasks: filteredTasks, loading: false });
      }
    } catch (error) {
      console.error('Error fetching tasks by label:', error);
      set({ loading: false });
    }
  },

  fetchTasksDueToday: async (userId: string) => {
    set({ loading: true });
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .gte('due_date', today.toISOString())
          .lt('due_date', tomorrow.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ tasks: data || [], loading: false });
      } else {
        const { Q } = require('@nozbe/watermelondb');
        const tasksCollection = database.get('tasks');
        const tasks = await tasksCollection
          .query(Q.where('user_id', userId))
          .fetch();
        
        const filteredTasks = tasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        }).sort((a: any, b: any) => {
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        
        set({ tasks: filteredTasks, loading: false });
      }
    } catch (error) {
      console.error('Error fetching tasks due today:', error);
      set({ loading: false });
    }
  },

  fetchTasksDueUpcoming: async (userId: string) => {
    set({ loading: true });
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .gte('due_date', today.toISOString())
          .order('due_date', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ tasks: data || [], loading: false });
      } else {
        const { Q } = require('@nozbe/watermelondb');
        const tasksCollection = database.get('tasks');
        const tasks = await tasksCollection
          .query(Q.where('user_id', userId))
          .fetch();
        
        const filteredTasks = tasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today;
        }).sort((a: any, b: any) => {
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        
        set({ tasks: filteredTasks, loading: false });
      }
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      set({ loading: false });
    }
  },

  createTask: async (taskData: any) => {
    try {
      // If no projectId is provided, assign to default project
      let projectId = taskData.projectId;
      if (!projectId && taskData.userId) {
        projectId = await getDefaultProjectId(taskData.userId);
      }

      if (Platform.OS === 'web') {
        // Use Supabase directly on web
        // Build insert data object - only include recurrence if it has a value
        const insertData: any = {
          title: taskData.title,
          description: taskData.description || null,
          start_date: taskData.startDate ? new Date(taskData.startDate).toISOString() : new Date().toISOString(),
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          priority: taskData.priority || 1,
          project_id: projectId,
          label_ids: taskData.labelIds || [],
          user_id: taskData.userId,
          recurring_pattern: taskData.recurringPattern || null,
          status: taskData.status || 'to_do',
          project_phase: taskData.projectPhase || null, // Agile phase (null for Waterfall)
          assignee_id: taskData.assigneeId || null,
          blocked_by: taskData.blockedBy || [],
          category: taskData.category || null, // Maintenance category (null for non-maintenance)
          completed_at: (taskData.completed || taskData.status === 'completed') ? new Date().toISOString() : null,
        };
        
        // Only include recurrence if it exists and is enabled (column may not exist in DB yet)
        if (taskData.recurrence && taskData.recurrence.enabled) {
          insertData.recurrence = taskData.recurrence;
        }
        
        const { data, error } = await supabase
          .from('tasks')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        const currentTasks = get().tasks;
        set({ tasks: [data, ...currentTasks] });
        
        return data;
      } else {
        // Use WatermelonDB on native
        const tasksCollection = database.get('tasks');
        const newTask = await tasksCollection.create((task: any) => {
          task.title = taskData.title;
          task.description = taskData.description || '';
          task.startDate = taskData.startDate ? new Date(taskData.startDate).getTime() : Date.now();
          task.dueDate = taskData.dueDate ? new Date(taskData.dueDate).getTime() : undefined;
          task.priority = taskData.priority || 1;
          task.projectId = projectId;
          task.labelIds = JSON.stringify(taskData.labelIds || []);
          task.userId = taskData.userId;
          task.recurringPattern = taskData.recurringPattern || undefined;
          task.status = taskData.status || 'to_do';
          task.projectPhase = taskData.projectPhase || undefined; // Agile phase (undefined for Waterfall)
          task.assigneeId = taskData.assigneeId || undefined;
          task.blockedBy = JSON.stringify(taskData.blockedBy || []);
          task.category = taskData.category || undefined; // Maintenance category (undefined for non-maintenance)
          if (taskData.completed || taskData.status === 'completed') {
            task.completedAt = Date.now();
          }
        });
        return newTask;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: any) => {
    try {
      if (Platform.OS === 'web') {
        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.startDate !== undefined) {
          updateData.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : new Date().toISOString();
        }
        if (updates.dueDate !== undefined) {
          updateData.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
        }
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
        if (updates.labelIds !== undefined) updateData.label_ids = updates.labelIds;
        if (updates.recurringPattern !== undefined) updateData.recurring_pattern = updates.recurringPattern;
        // Only include recurrence if it's enabled (column may not exist in DB yet)
        if (updates.recurrence !== undefined && updates.recurrence?.enabled) {
          updateData.recurrence = updates.recurrence;
        }
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.projectPhase !== undefined) updateData.project_phase = updates.projectPhase;
        if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;
        if (updates.blockedBy !== undefined) updateData.blocked_by = updates.blockedBy;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.completed !== undefined) {
          updateData.completed_at = updates.completed ? new Date().toISOString() : null;
        } else if (updates.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        } else if (updates.status && updates.status !== 'completed') {
          updateData.completed_at = null;
        }

        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((task: any) =>
          task.id === taskId ? { ...task, ...updateData } : task
        );
        set({ tasks: updatedTasks });
      } else {
        const tasksCollection = database.get('tasks');
        const task = await tasksCollection.find(taskId);
        await task.update((taskRecord: any) => {
          if (updates.title !== undefined) taskRecord.title = updates.title;
          if (updates.description !== undefined) taskRecord.description = updates.description;
          if (updates.dueDate !== undefined) {
            taskRecord.dueDate = updates.dueDate ? new Date(updates.dueDate).getTime() : undefined;
          }
          if (updates.priority !== undefined) taskRecord.priority = updates.priority;
          if (updates.projectId !== undefined) taskRecord.projectId = updates.projectId;
          if (updates.labelIds !== undefined) taskRecord.labelIds = JSON.stringify(updates.labelIds);
          if (updates.recurringPattern !== undefined) taskRecord.recurringPattern = updates.recurringPattern;
          if (updates.status !== undefined) taskRecord.status = updates.status;
          if (updates.projectPhase !== undefined) taskRecord.projectPhase = updates.projectPhase;
          if (updates.assigneeId !== undefined) taskRecord.assigneeId = updates.assigneeId;
          if (updates.blockedBy !== undefined) taskRecord.blockedBy = JSON.stringify(updates.blockedBy);
          if (updates.category !== undefined) taskRecord.category = updates.category;
          if (updates.completed !== undefined) {
            taskRecord.completedAt = updates.completed ? Date.now() : undefined;
          } else if (updates.status === 'completed') {
            taskRecord.completedAt = Date.now();
          } else if (updates.status && updates.status !== 'completed') {
            taskRecord.completedAt = undefined;
          }
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Helper for Kanban drag-and-drop: Update only the project phase
  // When moving to 'done' phase, also marks task as completed
  updateTaskPhase: async (taskId: string, newPhase: ProjectPhase | null) => {
    try {
      const isDone = newPhase === 'done';
      
      if (Platform.OS === 'web') {
        const updateData: any = {
          project_phase: newPhase,
        };
        
        // If moving to 'done' lane, also complete the task
        if (isDone) {
          updateData.status = 'completed';
          updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((task: any) =>
          task.id === taskId ? { ...task, ...updateData } : task
        );
        set({ tasks: updatedTasks });
      } else {
        const tasksCollection = database.get('tasks');
        const task = await tasksCollection.find(taskId);
        await task.update((taskRecord: any) => {
          taskRecord.projectPhase = newPhase;
          if (isDone) {
            taskRecord.status = 'completed';
            taskRecord.completedAt = Date.now();
          }
        });
      }
    } catch (error) {
      console.error('Error updating task phase:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        set({ tasks: currentTasks.filter((task: any) => task.id !== taskId) });
      } else {
        const tasksCollection = database.get('tasks');
        const task = await tasksCollection.find(taskId);
        await task.markAsDeleted();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  completeTask: async (taskId: string) => {
    try {
      const completedDate = new Date();
      let regeneratedTask: any = null;
      
      if (Platform.OS === 'web') {
        // First, get the task to check for recurrence
        const currentTasks = get().tasks;
        const taskToComplete = currentTasks.find((t: any) => t.id === taskId);
        
        // Update the task as completed
        const { error } = await supabase
          .from('tasks')
          .update({ 
            completed_at: completedDate.toISOString(),
            status: 'completed'
          })
          .eq('id', taskId);
        
        if (error) throw error;
        
        // Update local state
        const updatedTasks = currentTasks.map((task: any) =>
          task.id === taskId 
            ? { ...task, completed_at: completedDate.toISOString(), status: 'completed' }
            : task
        );
        set({ tasks: updatedTasks });
        
        // Check for recurrence and auto-regenerate
        if (taskToComplete?.recurrence?.enabled && taskToComplete.recurrence.regenerateOnComplete !== false) {
          // Convert task to proper format for createRegeneratedTask
          const taskWithDates = {
            ...taskToComplete,
            dueDate: taskToComplete.due_date ? new Date(taskToComplete.due_date) : undefined,
            startDate: taskToComplete.start_date ? new Date(taskToComplete.start_date) : undefined,
            labelIds: taskToComplete.label_ids || [],
          };
          
          const newTaskData = createRegeneratedTask(taskWithDates, completedDate);
          
          if (newTaskData) {
            // Create the regenerated task
            const { data: newTask, error: createError } = await supabase
              .from('tasks')
              .insert({
                title: newTaskData.title,
                description: newTaskData.description || '',
                priority: newTaskData.priority || 1,
                status: 'to_do',
                due_date: newTaskData.dueDate?.toISOString(),
                start_date: newTaskData.startDate?.toISOString(),
                project_id: newTaskData.projectId,
                project_phase: newTaskData.projectPhase,
                category: newTaskData.category,
                label_ids: newTaskData.labelIds || [],
                user_id: newTaskData.userId,
                recurrence: newTaskData.recurrence,
                assignee_id: newTaskData.assigneeId,
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating regenerated task:', createError);
            } else if (newTask) {
              regeneratedTask = newTask;
              // Add regenerated task to local state
              set({ tasks: [...get().tasks, newTask] });
            }
          }
        }
      } else {
        // Mobile - WatermelonDB
        const tasksCollection = database.get('tasks');
        const task = await tasksCollection.find(taskId);
        await task.update((taskRecord: any) => {
          taskRecord.completedAt = Date.now();
          taskRecord.status = 'completed';
        });
        // TODO: Implement mobile recurrence regeneration
      }
      
      return { regeneratedTask };
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  uncompleteTask: async (taskId: string) => {
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            completed_at: null,
            status: 'to_do'
          })
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((task: any) =>
          task.id === taskId 
            ? { ...task, completed_at: null, status: 'to_do' }
            : task
        );
        set({ tasks: updatedTasks });
      } else {
        const tasksCollection = database.get('tasks');
        const task = await tasksCollection.find(taskId);
        await task.update((taskRecord: any) => {
          taskRecord.completedAt = undefined;
          taskRecord.status = 'to_do';
        });
      }
    } catch (error) {
      console.error('Error uncompleting task:', error);
      throw error;
    }
  },

  // Get task IDs that block a specific task
  getBlockedBy: (taskId: string) => {
    const task = get().tasks.find((t: any) => t.id === taskId);
    return parseBlockedBy(task);
  },

  // Get all tasks that are blocked by a specific task (i.e., tasks where this task is in their blocked_by)
  getBlockingTasks: (taskId: string) => {
    return get().tasks.filter((task: any) => {
      const blockedBy = parseBlockedBy(task);
      return blockedBy.includes(taskId);
    });
  },

  // Check for circular dependency: would adding blockerTaskId as blocker create a cycle?
  hasCircularDependency: (taskId: string, potentialBlockerId: string) => {
    if (taskId === potentialBlockerId) return true;
    
    const tasks = get().tasks;
    const visited = new Set<string>();
    const stack: string[] = [potentialBlockerId];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (currentId === taskId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const currentTask = tasks.find((t: any) => t.id === currentId);
      const blockers = parseBlockedBy(currentTask);
      stack.push(...blockers);
    }
    
    return false;
  },

  // Add a blocker to a task
  addBlocker: async (taskId: string, blockerTaskId: string) => {
    try {
      // Check for circular dependency
      if (get().hasCircularDependency(taskId, blockerTaskId)) {
        return { success: false, circular: true };
      }

      const task = get().tasks.find((t: any) => t.id === taskId);
      const currentBlockers = parseBlockedBy(task);
      
      // Don't add duplicate
      if (currentBlockers.includes(blockerTaskId)) {
        return { success: true };
      }
      
      const newBlockers = [...currentBlockers, blockerTaskId];

      if (Platform.OS === 'web') {
        const { error } = await supabase
          .from('tasks')
          .update({ blocked_by: newBlockers })
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((t: any) =>
          t.id === taskId ? { ...t, blocked_by: newBlockers } : t
        );
        set({ tasks: updatedTasks });
      } else {
        const tasksCollection = database.get('tasks');
        const taskRecord = await tasksCollection.find(taskId);
        await taskRecord.update((record: any) => {
          record.blockedBy = JSON.stringify(newBlockers);
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding blocker:', error);
      throw error;
    }
  },

  // Remove a blocker from a task
  removeBlocker: async (taskId: string, blockerTaskId: string) => {
    try {
      const task = get().tasks.find((t: any) => t.id === taskId);
      const currentBlockers = parseBlockedBy(task);
      const newBlockers = currentBlockers.filter((id: string) => id !== blockerTaskId);

      if (Platform.OS === 'web') {
        const { error } = await supabase
          .from('tasks')
          .update({ blocked_by: newBlockers })
          .eq('id', taskId);
        
        if (error) throw error;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((t: any) =>
          t.id === taskId ? { ...t, blocked_by: newBlockers } : t
        );
        set({ tasks: updatedTasks });
      } else {
        const tasksCollection = database.get('tasks');
        const taskRecord = await tasksCollection.find(taskId);
        await taskRecord.update((record: any) => {
          record.blockedBy = JSON.stringify(newBlockers);
        });
      }
    } catch (error) {
      console.error('Error removing blocker:', error);
      throw error;
    }
  },
}));
