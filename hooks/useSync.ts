import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { useSyncStore } from '../store/syncStore';
import { useAuthStore } from '../store/authStore';

export function useSync() {
  const { user } = useAuthStore();
  const { syncing, setSyncing } = useSyncStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  const performSync = useCallback(async () => {
    // Only sync on native (web uses Supabase directly)
    if (Platform.OS === 'web' || !user?.id || syncing) return;
    
    // Debounce: don't sync more than once every 2 seconds
    const now = Date.now();
    if (now - lastSyncRef.current < 2000) {
      // Clear existing timeout and set a new one
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        performSync();
      }, 2000);
      return;
    }
    
    lastSyncRef.current = now;
    
    try {
      // Lazy load sync function only on native
      const { sync } = await import('../lib/supabase/sync');
      setSyncing(true);
      await sync(user.id);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [user?.id, syncing, setSyncing]);

  useEffect(() => {
    // Only sync on native (web uses Supabase directly)
    if (Platform.OS === 'web' || !user?.id) return;

    // Initial sync
    performSync();

    // Set up realtime subscriptions
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => {
          performSync();
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        () => {
          performSync();
        }
      )
      .subscribe();

    const labelsChannel = supabase
      .channel('labels-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'labels', filter: `user_id=eq.${user.id}` },
        () => {
          performSync();
        }
      )
      .subscribe();

    return () => {
      tasksChannel.unsubscribe();
      projectsChannel.unsubscribe();
      labelsChannel.unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user?.id, performSync]);

  return { performSync, syncing };
}
