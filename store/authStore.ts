import { create } from 'zustand';
import * as auth from '../lib/supabase/auth';

type SignUpResult = Awaited<ReturnType<typeof auth.signUp>>;

let authListenerRegistered = false;

interface AuthState {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),
  
  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const data = await auth.signUp(email, password);
      // If email confirmation is on, session is null — do not treat as signed in
      // or onAuthStateChange will clear user and bounce you back to login.
      if (data.session?.user) {
        set({ user: data.session.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const data = await auth.signIn(email, password);
      const nextUser = data.user ?? data.session?.user ?? null;
      set({ user: nextUser, loading: false });
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
    if (!authListenerRegistered) {
      authListenerRegistered = true;
      auth.onAuthStateChange((user) => {
        set({ user });
      });
    }
    if (get().initialized) return;

    try {
      const session = await auth.getSession();
      set({ user: session?.user ?? null, loading: false, initialized: true });
    } catch (error) {
      console.error('Auth initialize:', error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
