import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useThemeStore, themes } from '@/store/themeStore';
import { ReactNode, useEffect, useState } from 'react';
import TopBar from './TopBar';

interface WebLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Dashboard', route: '/(tabs)/dashboard', icon: 'home' },
  { name: 'Calendar', route: '/(tabs)/calendar', icon: 'calendar' },
  { name: 'Tasks', route: '/(tabs)/tasks', icon: 'list' },
  { name: 'Projects', route: '/(tabs)/projects', icon: 'folder' },
];

export default function WebLayout({ children }: WebLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme, resolvedTheme } = useThemeStore();
  const theme = themes[resolvedTheme];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Only render on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  useEffect(() => {
    // Initialize theme class on mount
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <TopBar />

      <View style={styles.mainContainer}>
        {/* Sidebar */}
        <View style={[
          styles.sidebar,
          { backgroundColor: theme.sidebar, borderRightColor: theme.border },
          sidebarCollapsed && { width: 64 },
        ]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarHeaderSpacer} />
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <FontAwesome
                name={sidebarCollapsed ? 'angle-right' : 'angle-left'}
                size={16}
                color={theme.sidebarText}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.navSection}>
            {navItems.map((item) => {
              const isActive = pathname === item.route || pathname?.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.navItem,
                    { 
                      backgroundColor: isActive ? theme.sidebarHover : 'transparent',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      paddingHorizontal: sidebarCollapsed ? 12 : 20,
                    },
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <FontAwesome
                    name={item.icon as any}
                    size={18}
                    color={isActive ? theme.sidebarActive : theme.sidebarText}
                  />
                  {!sidebarCollapsed && (
                    <Text
                      style={[
                        styles.navText,
                        {
                          color: isActive ? theme.sidebarTextActive : theme.sidebarText,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <TouchableOpacity
              style={[styles.themeToggle, { justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }]}
              onPress={toggleTheme}
            >
              <FontAwesome
                name={resolvedTheme === 'dark' ? 'sun-o' : 'moon-o'}
                size={16}
                color={theme.sidebarText}
              />
              {!sidebarCollapsed && (
                <Text style={[styles.themeToggleText, { color: theme.sidebarText }]}>
                  {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    height: '100vh',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sidebar: {
    width: 144, // 40% smaller: 240 * 0.6 = 144
    borderRightWidth: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.2s ease',
  },
  sidebarHeader: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Right align collapse button
  },
  sidebarHeaderSpacer: {
    flex: 1, // Pushes collapse button to the right
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  collapseButton: {
    padding: 4,
    borderRadius: 4,
  },
  navSection: {
    flex: 1,
    paddingTop: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    marginHorizontal: 8,
    borderRadius: 6,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
});
