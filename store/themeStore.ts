import { create } from 'zustand';
import { Platform } from 'react-native';

// Simplified theme: only dark or light. No system option. Keep it simple.
export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  themeMode: ThemeMode;
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarPinned: (pinned: boolean) => void;
  toggleSidebarPinned: () => void;
}

// Load saved theme from localStorage
const loadSavedTheme = (): ThemeMode => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
  }
  return 'dark'; // Default to dark
};

// Save theme to localStorage
const saveTheme = (theme: ThemeMode) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore localStorage errors
    }
  }
};

// Load sidebar state from localStorage if available
const loadSidebarState = () => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const collapsed = localStorage.getItem('sidebarCollapsed');
      const pinned = localStorage.getItem('sidebarPinned');
      return {
        collapsed: collapsed === 'true',
        pinned: pinned === 'true',
      };
    } catch {
      return { collapsed: true, pinned: false };
    }
  }
  return { collapsed: true, pinned: false };
};

// Save sidebar state to localStorage
const saveSidebarState = (collapsed: boolean, pinned: boolean) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
      localStorage.setItem('sidebarPinned', String(pinned));
    } catch {
      // Ignore localStorage errors
    }
  }
};

// Apply theme to document
const applyThemeToDocument = (theme: ThemeMode) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark', 'light-theme', 'dark-theme');
    document.documentElement.classList.add(theme);
  }
};

export const useThemeStore = create<ThemeStore>((set, get) => {
  // Initialize with saved preference (defaults to dark)
  const savedTheme = loadSavedTheme();
  const sidebarState = loadSidebarState();
  
  // Apply theme on initial load
  applyThemeToDocument(savedTheme);
  
  return {
    themeMode: savedTheme,
    sidebarCollapsed: sidebarState.collapsed,
    sidebarPinned: sidebarState.pinned,
    setThemeMode: (mode: ThemeMode) => {
      set({ themeMode: mode });
      saveTheme(mode);
      applyThemeToDocument(mode);
    },
    toggleTheme: () => {
      const current = get().themeMode;
      const newTheme = current === 'light' ? 'dark' : 'light';
      set({ themeMode: newTheme });
      saveTheme(newTheme);
      applyThemeToDocument(newTheme);
    },
    setSidebarCollapsed: (collapsed: boolean) => {
      set({ sidebarCollapsed: collapsed });
      saveSidebarState(collapsed, get().sidebarPinned);
    },
    toggleSidebarCollapsed: () => {
      const newCollapsed = !get().sidebarCollapsed;
      set({ sidebarCollapsed: newCollapsed });
      saveSidebarState(newCollapsed, get().sidebarPinned);
    },
    setSidebarPinned: (pinned: boolean) => {
      set({ sidebarPinned: pinned });
      saveSidebarState(get().sidebarCollapsed, pinned);
    },
    toggleSidebarPinned: () => {
      const newPinned = !get().sidebarPinned;
      set({ sidebarPinned: newPinned });
      saveSidebarState(get().sidebarCollapsed, newPinned);
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
