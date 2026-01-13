import { useThemeStore, themes } from '@/store/themeStore';

export function useTheme() {
  const { resolvedTheme } = useThemeStore();
  return themes[resolvedTheme];
}

export function useThemeMode() {
  return useThemeStore((state) => state.themeMode);
}

export function useResolvedTheme() {
  return useThemeStore((state) => state.resolvedTheme);
}
