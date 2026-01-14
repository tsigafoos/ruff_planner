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
    // Mood colors for states (subtle, pastel-like)
    mood: {
      brainstorm: '#8B5CF6', // Purple - creative
      design: '#06B6D4',     // Cyan - visual
      logic: '#3B82F6',      // Blue - technical
      polish: '#10B981',     // Green - refinement
      done: '#6B7280',       // Gray - complete
      blocked: '#EF4444',    // Red - attention
      onHold: '#F59E0B',     // Amber - paused
      inProgress: '#3B82F6', // Blue - active
    },
    // Priority colors (consistent across app)
    priority: {
      p1: '#10B981', // Low - green
      p2: '#3B82F6', // Medium - blue
      p3: '#F59E0B', // High - amber
      p4: '#EF4444', // Urgent - red
    },
    // Status badge backgrounds (very subtle)
    statusBg: {
      success: '#ECFDF5',
      warning: '#FFFBEB',
      error: '#FEF2F2',
      info: '#EFF6FF',
      neutral: '#F3F4F6',
    },
  },
  dark: {
    background: '#0f0f11',
    surface: '#16161a',
    surfaceSecondary: '#1a1a1f',
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
    // Mood colors for states (slightly muted for dark mode)
    mood: {
      brainstorm: '#A78BFA', // Purple - creative
      design: '#22D3EE',     // Cyan - visual
      logic: '#60A5FA',      // Blue - technical
      polish: '#34D399',     // Green - refinement
      done: '#9CA3AF',       // Gray - complete
      blocked: '#F87171',    // Red - attention
      onHold: '#FBBF24',     // Amber - paused
      inProgress: '#60A5FA', // Blue - active
    },
    // Priority colors (consistent across app)
    priority: {
      p1: '#34D399', // Low - green
      p2: '#60A5FA', // Medium - blue
      p3: '#FBBF24', // High - amber
      p4: '#F87171', // Urgent - red
    },
    // Status badge backgrounds (very subtle, dark-adjusted)
    statusBg: {
      success: '#064E3B20',
      warning: '#78350F20',
      error: '#7F1D1D20',
      info: '#1E3A8A20',
      neutral: '#37415120',
    },
  },
};
