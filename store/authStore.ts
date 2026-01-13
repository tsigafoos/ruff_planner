import { create } from 'zustand';
import * as auth from '../lib/supabase/auth';

interface AuthState {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),
  
  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const data = await auth.signUp(email, password);
      set({ user: data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const data = await auth.signIn(email, password);
      set({ user: data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signInWithMagicLink: async (email: string) => {
    set({ loading: true });
    try {
      await auth.signInWithMagicLink(email);
      set({ loading: false });
      // Magic link doesn't immediately sign in - user needs to click email
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ loading: true });
    try {
      await auth.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  initialize: async () => {
    try {
      const user = await auth.getCurrentUser();
      set({ user, loading: false, initialized: true });
      
      // Subscribe to auth changes
      auth.onAuthStateChange((user) => {
        set({ user });
      });
    } catch (error) {
      set({ loading: false, initialized: true });
    }
  },
}));
