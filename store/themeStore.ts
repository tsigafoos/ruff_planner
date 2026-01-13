import { create } from 'zustand';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>((set, get) => {
  // Initialize with system preference
  const systemTheme = getSystemTheme();
  
  return {
    themeMode: 'system',
    resolvedTheme: systemTheme,
    setThemeMode: (mode: ThemeMode) => {
      const resolved = mode === 'system' ? getSystemTheme() : mode;
      set({ themeMode: mode, resolvedTheme: resolved });
      
      // Update document class for web
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
      }
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const newTheme = current === 'light' ? 'dark' : 'light';
      set({ themeMode: newTheme, resolvedTheme: newTheme });
      
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      }
    },
  };
});

// Supabase-inspired theme colors
export const themes = {
        light: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          surfaceSecondary: '#F9FAFB',
          border: '#E5E7EB',
          borderLight: '#F3F4F6',
          text: '#1F2937',
          textSecondary: '#6B7280',
          textTertiary: '#9CA3AF',
          primary: '#10B981', // Green accent like Supabase
          primaryHover: '#059669',
          accent: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          sidebar: '#F9FAFB',
          sidebarHover: '#F3F4F6',
          sidebarActive: '#10B981',
          sidebarText: '#6B7280',
          sidebarTextActive: '#1F2937',
        },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#334155',
    borderLight: '#475569',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    primary: '#10B981',
    primaryHover: '#059669',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    sidebar: '#0F172A',
    sidebarHover: '#1E293B',
    sidebarActive: '#10B981',
    sidebarText: '#94A3B8',
    sidebarTextActive: '#FFFFFF',
  },
};
