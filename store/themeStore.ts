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
        document.documentElement.classList.remove('light', 'dark', 'light-theme', 'dark-theme');
        document.documentElement.classList.add(resolved);
      }
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const newTheme = current === 'light' ? 'dark' : 'light';
      set({ themeMode: newTheme, resolvedTheme: newTheme });
      
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark', 'light-theme', 'dark-theme');
        document.documentElement.classList.add(newTheme);
      }
    },
  };
});

// Minimalist modern theme colors matching CSS variables
export const themes = {
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSecondary: '#f8f9fc',
    surfaceTertiary: '#f0f1f5',
    border: '#e2e2e7',
    borderLight: '#f0f1f5',
    text: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textTertiary: '#717171',
    primary: '#0066ff',
    primaryHover: '#0055d4',
    accent: '#0066ff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    sidebar: '#f8f9fc',
    sidebarHover: '#f0f1f5',
    sidebarActive: '#0066ff',
    sidebarText: '#4a4a4a',
    sidebarTextActive: '#1a1a1a',
  },
  dark: {
    background: '#0f0f11',
    surface: '#16161a',
    surfaceSecondary: '#16161a',
    surfaceTertiary: '#222228',
    border: '#2a2a32',
    borderLight: '#333340',
    text: '#f0f0f5',
    textSecondary: '#c7c7d1',
    textTertiary: '#8f8fa3',
    primary: '#4d9aff',
    primaryHover: '#3d7fe6',
    accent: '#4d9aff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    sidebar: '#0f0f11',
    sidebarHover: '#16161a',
    sidebarActive: '#4d9aff',
    sidebarText: '#8f8fa3',
    sidebarTextActive: '#ffffff',
  },
};
