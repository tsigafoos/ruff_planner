import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useSync } from '@/hooks/useSync';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { resolvedTheme } = useThemeStore();
  const { initialized, initialize } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, []);

  // Wait for auth to be initialized, then hide splash
  useEffect(() => {
    if (!initialized) return;

    async function hideSplash() {
      await SplashScreen.hideAsync();
      await new Promise(resolve => setTimeout(resolve, 100));
      setAppIsReady(true);
    }

    hideSplash();
  }, [initialized]);

  // Always show splash screen until app AND auth are ready
  if (!appIsReady || !initialized) {
    const isDark = resolvedTheme === 'dark';
    return (
      <View style={[styles.splashContainer, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
        <Text style={[styles.splashText, { color: isDark ? '#F1F5F9' : '#1F2937' }]}>BarkItDone!!</Text>
      </View>
    );
  }

  return <RootLayoutNav />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Auto-sync data from Supabase when user is logged in
  useSync();

  // Handle auth routing - auth is already initialized by RootLayout
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to dashboard if authenticated and in auth group
      router.replace('/(tabs)/dashboard');
    }
  }, [user, initialized, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
