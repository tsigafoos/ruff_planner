import { database } from '../db';
import { supabase } from './client';
import { useSyncStore } from '../../store/syncStore';

const getSyncStore = () => useSyncStore.getState();

// Sync local changes to Supabase
export async function pushLocalChanges(userId: string) {
  const syncStore = getSyncStore();
  syncStore.setSyncing(true);
  syncStore.setError(null);

  try {
    // Sync projects
    const { Q } = require('@nozbe/watermelondb');
    const projectsCollection = database.get('projects');
    const unsyncedProjects = await projectsCollection
      .query(Q.where('user_id', userId))
      .fetch();
    
    for (const project of unsyncedProjects) {
      if (!project.syncedAt || project._raw.updated_at > project.syncedAt) {
        const { error } = await supabase
          .from('projects')
          .upsert({
            id: project.id,
            name: project.name,
            color: project.color,
            icon: project.icon,
            user_id: userId,
            created_at: new Date(project.createdAt).toISOString(),
            updated_at: new Date(project.updatedAt).toISOString(),
          });
        
        if (!error) {
          await project.update((p: any) => {
            p.syncedAt = Date.now();
          });
        }
      }
    }

    // Sync tasks
    const tasksCollection = database.get('tasks');
    const unsyncedTasks = await tasksCollection
      .query(Q.where('user_id', userId))
      .fetch();
    
    for (const task of unsyncedTasks) {
      if (!task.syncedAt || task._raw.updated_at > task.syncedAt) {
        const { error } = await supabase
          .from('tasks')
          .upsert({
            id: task.id,
            title: task.title,
            description: task.description,
            due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            priority: task.priority,
            project_id: task.projectId,
            label_ids: JSON.parse(task.labelIds || '[]'),
            completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
            user_id: userId,
            recurring_pattern: task.recurringPattern,
            created_at: new Date(task.createdAt).toISOString(),
            updated_at: new Date(task.updatedAt).toISOString(),
          });
        
        if (!error) {
          await task.update((t: any) => {
            t.syncedAt = Date.now();
          });
        }
      }
    }

    // Sync labels
    const labelsCollection = database.get('labels');
    const unsyncedLabels = await labelsCollection
      .query(Q.where('user_id', userId))
      .fetch();
    
    for (const label of unsyncedLabels) {
      if (!label.syncedAt || label._raw.created_at > label.syncedAt) {
        const { error } = await supabase
          .from('labels')
          .upsert({
            id: label.id,
            name: label.name,
            color: label.color,
            user_id: userId,
            created_at: new Date(label.createdAt).toISOString(),
          });
        
        if (!error) {
          await label.update((l: any) => {
            l.syncedAt = Date.now();
          });
        }
      }
    }

    syncStore.setLastSyncedAt(Date.now());
    syncStore.setSyncing(false);
  } catch (error: any) {
    console.error('Error pushing local changes:', error);
    syncStore.setError(error.message);
    syncStore.setSyncing(false);
    throw error;
  }
}

// Pull remote changes from Supabase
export async function pullRemoteChanges(userId: string) {
  const syncStore = getSyncStore();
  syncStore.setSyncing(true);
  syncStore.setError(null);

  try {
    // Pull projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);
    
    if (!projectsError && projects) {
      const projectsCollection = database.get('projects');
      for (const project of projects) {
        const existing = await projectsCollection.find(project.id).catch(() => null);
        if (existing) {
          await existing.update((p: any) => {
            p.name = project.name;
            p.color = project.color;
            p.icon = project.icon;
            p.syncedAt = Date.now();
          });
        } else {
          await projectsCollection.create((p: any) => {
            p._raw.id = project.id;
            p.name = project.name;
            p.color = project.color;
            p.icon = project.icon;
            p.userId = userId;
            p.syncedAt = Date.now();
          });
        }
      }
    }

    // Pull tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (!tasksError && tasks) {
      const tasksCollection = database.get('tasks');
      for (const task of tasks) {
        const existing = await tasksCollection.find(task.id).catch(() => null);
        if (existing) {
          await existing.update((t: any) => {
            t.title = task.title;
            t.description = task.description;
            t.dueDate = task.due_date ? new Date(task.due_date).getTime() : undefined;
            t.priority = task.priority;
            t.projectId = task.project_id;
            t.labelIds = JSON.stringify(task.label_ids || []);
            t.completedAt = task.completed_at ? new Date(task.completed_at).getTime() : undefined;
            t.recurringPattern = task.recurring_pattern;
            t.syncedAt = Date.now();
          });
        } else {
          await tasksCollection.create((t: any) => {
            t._raw.id = task.id;
            t.title = task.title;
            t.description = task.description;
            t.dueDate = task.due_date ? new Date(task.due_date).getTime() : undefined;
            t.priority = task.priority;
            t.projectId = task.project_id;
            t.labelIds = JSON.stringify(task.label_ids || []);
            t.completedAt = task.completed_at ? new Date(task.completed_at).getTime() : undefined;
            t.recurringPattern = task.recurring_pattern;
            t.userId = userId;
            t.syncedAt = Date.now();
          });
        }
      }
    }

    // Pull labels
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId);
    
    if (!labelsError && labels) {
      const labelsCollection = database.get('labels');
      for (const label of labels) {
        const existing = await labelsCollection.find(label.id).catch(() => null);
        if (existing) {
          await existing.update((l: any) => {
            l.name = label.name;
            l.color = label.color;
            l.syncedAt = Date.now();
          });
        } else {
          await labelsCollection.create((l: any) => {
            l._raw.id = label.id;
            l.name = label.name;
            l.color = label.color;
            l.userId = userId;
            l.syncedAt = Date.now();
          });
        }
      }
    }

    syncStore.setLastSyncedAt(Date.now());
    syncStore.setSyncing(false);
  } catch (error: any) {
    console.error('Error pulling remote changes:', error);
    syncStore.setError(error.message);
    syncStore.setSyncing(false);
    throw error;
  }
}

// Full sync: pull then push
export async function sync(userId: string) {
  try {
    await pullRemoteChanges(userId);
    await pushLocalChanges(userId);
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}
