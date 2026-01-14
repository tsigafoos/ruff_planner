import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useThemeStore, themes } from '@/store/themeStore';

// Layout constants
export const SIDEBAR_COLLAPSED_WIDTH = 60;
export const SIDEBAR_EXPANDED_WIDTH = 240;

interface NavItem {
  name: string;
  route: string;
  icon: string;
  section?: string; // Group header
}

const navItems: NavItem[] = [
  { name: 'Dashboard', route: '/(tabs)/dashboard', icon: 'home' },
  { name: 'Today', route: '/(tabs)/today', icon: 'calendar', section: 'Tasks' },
  { name: 'Upcoming', route: '/(tabs)/upcoming', icon: 'calendar-check-o' },
  { name: 'All Tasks', route: '/(tabs)/tasks', icon: 'list' },
  { name: 'Projects', route: '/(tabs)/projects', icon: 'folder', section: 'Organize' },
  { name: 'Calendar', route: '/(tabs)/calendar', icon: 'calendar-o' },
  { name: 'Resources', route: '/(tabs)/projects', icon: 'file-o', section: 'Manage' }, // Placeholder route
  { name: 'Labels', route: '/(tabs)/labels', icon: 'tags' },
];

interface SidebarProps {
  collapsed: boolean;
  pinned: boolean;
  onToggleCollapse: () => void;
  onTogglePin: () => void;
}

export default function Sidebar({ 
  collapsed, 
  pinned, 
  onToggleCollapse, 
  onTogglePin 
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme, resolvedTheme } = useThemeStore();
  const theme = themes[resolvedTheme];

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const isActive = (route: string) => {
    return pathname === route || pathname?.startsWith(route.replace('/(tabs)', ''));
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const active = isActive(item.route);
    const showSection = item.section && !collapsed;
    const prevItem = navItems[index - 1];
    const isFirstInSection = item.section && (!prevItem || prevItem.section !== item.section);

    return (
      <View key={item.route + item.name}>
        {/* Section Header */}
        {isFirstInSection && showSection && (
          <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>
            {item.section}
          </Text>
        )}
        
        {/* Nav Item */}
        <TouchableOpacity
          style={[
            styles.navItem,
            {
              backgroundColor: active ? theme.surfaceTertiary : 'transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
              paddingHorizontal: collapsed ? 0 : 16,
            },
          ]}
          onPress={() => router.push(item.route as any)}
          title={collapsed ? item.name : undefined}
        >
          <View style={[styles.iconContainer, collapsed && styles.iconContainerCollapsed]}>
            <FontAwesome
              name={item.icon as any}
              size={18}
              color={active ? theme.primary : theme.sidebarText}
            />
          </View>
          {!collapsed && (
            <Text
              style={[
                styles.navText,
                {
                  color: active ? theme.text : theme.sidebarText,
                  fontWeight: active ? '600' : '500',
                },
              ]}
            >
              {item.name}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          backgroundColor: theme.sidebar,
          borderRightColor: theme.border,
        },
      ]}
    >
      {/* Sidebar Header with Toggle */}
      <View style={[styles.sidebarHeader, collapsed && styles.sidebarHeaderCollapsed]}>
        {!collapsed && (
          <TouchableOpacity
            style={[styles.pinButton, pinned && { backgroundColor: theme.surfaceTertiary }]}
            onPress={onTogglePin}
            title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
          >
            <FontAwesome
              name={pinned ? 'thumb-tack' : 'thumb-tack'}
              size={12}
              color={pinned ? theme.primary : theme.textTertiary}
              style={pinned ? {} : { transform: [{ rotate: '45deg' }] }}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FontAwesome
            name={collapsed ? 'angle-right' : 'angle-left'}
            size={16}
            color={theme.sidebarText}
          />
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        {navItems.map((item, index) => renderNavItem(item, index))}
      </View>

      {/* Sidebar Footer */}
      <View style={[styles.sidebarFooter, { borderTopColor: theme.border }]}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[
            styles.footerItem,
            { justifyContent: collapsed ? 'center' : 'flex-start' },
          ]}
          onPress={toggleTheme}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <View style={[styles.iconContainer, collapsed && styles.iconContainerCollapsed]}>
            <FontAwesome
              name={resolvedTheme === 'dark' ? 'sun-o' : 'moon-o'}
              size={16}
              color={theme.sidebarText}
            />
          </View>
          {!collapsed && (
            <Text style={[styles.footerText, { color: theme.sidebarText }]}>
              {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    transition: 'width 0.2s ease',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  sidebarHeaderCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  pinButton: {
    padding: 8,
    borderRadius: 6,
  },
  collapseButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  navSection: {
    flex: 1,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginBottom: 2,
    borderRadius: 8,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCollapsed: {
    width: 'auto',
  },
  navText: {
    fontSize: 14,
  },
  sidebarFooter: {
    padding: 12,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
