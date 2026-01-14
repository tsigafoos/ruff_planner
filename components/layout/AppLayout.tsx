import { View, StyleSheet, Platform } from 'react-native';
import { ReactNode, useEffect } from 'react';
import { useThemeStore, themes } from '@/store/themeStore';
import TopNavbar from './TopNavbar';
import Sidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './Sidebar';
import Footer, { FOOTER_HEIGHT } from './Footer';

// Layout constants
export const NAVBAR_HEIGHT = 56;
export const CONTENT_MARGIN_TOP = 10;
export const CONTENT_MARGIN_LEFT = 20;

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
    height: '100vh',
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    overflow: 'auto',
  },
  contentInner: {
    flex: 1,
    marginTop: CONTENT_MARGIN_TOP,
    marginLeft: CONTENT_MARGIN_LEFT,
    marginRight: CONTENT_MARGIN_LEFT,
    marginBottom: 0,
  },
});
