import { useThemeStore } from '@/store/themeStore';

/** Matches web: navigation and RN primitives follow themeStore (light/dark toggle). */
export function useColorScheme(): 'light' | 'dark' {
  return useThemeStore((state) => state.resolvedTheme);
}
