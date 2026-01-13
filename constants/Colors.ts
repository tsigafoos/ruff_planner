// Minimalist modern theme colors matching CSS variables
const tintColorLight = '#0066ff'; // Blue accent
const tintColorDark = '#4d9aff';

export default {
  light: {
    text: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textTertiary: '#717171',
    background: '#ffffff',
    backgroundAlt: '#f8f9fc',
    surface: '#ffffff',
    tint: tintColorLight,
    border: '#e2e2e7',
    tabIconDefault: '#717171',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f0f0f5',
    textSecondary: '#c7c7d1',
    textTertiary: '#8f8fa3',
    background: '#0f0f11',
    backgroundAlt: '#16161a',
    surface: '#16161a',
    tint: tintColorDark,
    border: '#2a2a32',
    tabIconDefault: '#8f8fa3',
    tabIconSelected: tintColorDark,
  },
};
