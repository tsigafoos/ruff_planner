import { create } from 'zustand';

interface SyncStore {
  syncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (timestamp: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  syncing: false,
  lastSyncedAt: null,
  error: null,

  setSyncing: (syncing: boolean) => set({ syncing }),
  setLastSyncedAt: (timestamp: number) => set({ lastSyncedAt: timestamp }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ syncing: false, error: null }),
}));
