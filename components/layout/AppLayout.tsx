import { View, StyleSheet, Platform } from 'react-native';
import { ReactNode, useEffect } from 'react';
import { useThemeStore, themes } from '@/store/themeStore';
import TopNavbar from './TopNavbar';
import Sidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './Sidebar';
import Footer, { FOOTER_HEIGHT } from './Footer';

// Layout constants
export const NAVBAR_HEIGHT = 52;
export const CONTENT_MARGIN_TOP = 8;
export const CONTENT_MARGIN_LEFT = 14;

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { 
    resolvedTheme, 
    sidebarCollapsed, 
    sidebarPinned,
    toggleSidebarCollapsed,
    toggleSidebarPinned,
  } = useThemeStore();
  const theme = themes[resolvedTheme];

  // Only render full layout on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Initialize theme class on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark', 'light-theme', 'dark-theme');
      document.documentElement.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Navigation Bar */}
      <TopNavbar />

      {/* Main Body - Sidebar + Content */}
      <View style={styles.body}>
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          pinned={sidebarPinned}
          onToggleCollapse={toggleSidebarCollapsed}
          onTogglePin={toggleSidebarPinned}
        />

        {/* Main Content Area */}
        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          <View style={styles.contentInner}>
            {children}
          </View>
        </View>
      </View>

      {/* Footer */}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web'
      ? {
          overflowY: 'auto' as any,
          overflowX: 'hidden' as any,
          WebkitOverflowScrolling: 'touch' as any,
        }
      : {}),
  },
  // Do not use flex:1 here — height follows page content so mainContent can scroll (web).
  contentInner: {
    alignSelf: 'stretch',
    marginTop: CONTENT_MARGIN_TOP,
    marginLeft: CONTENT_MARGIN_LEFT,
    marginRight: CONTENT_MARGIN_LEFT,
    marginBottom: CONTENT_MARGIN_TOP,
    ...(Platform.OS === 'web'
      ? {
          width: '100%' as any,
          minHeight: '100%' as any,
          paddingBottom: 16,
        }
      : {}),
  },
});
