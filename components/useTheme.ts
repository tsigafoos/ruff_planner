import { useThemeStore, themes } from '@/store/themeStore';

export function useTheme() {
  const { themeMode } = useThemeStore();
  return themes[themeMode];
}

export function useThemeMode() {
  return useThemeStore((state) => state.themeMode);
}

export function useResolvedTheme() {
  return useThemeStore((state) => state.themeMode);
}
