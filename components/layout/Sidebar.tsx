import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useThemeStore, themes } from '@/store/themeStore';
import { useProfileStore } from '@/store/profileStore';
import { useTeamStore } from '@/store/teamStore';

// Layout constants
export const SIDEBAR_COLLAPSED_WIDTH = 52;
export const SIDEBAR_EXPANDED_WIDTH = 220;

interface NavItem {
  name: string;
  route: string;
  icon: string;
  teamOnly?: boolean;
}

/** Core project workflow — always visible first */
const primaryNav: NavItem[] = [
  { name: 'Projects', route: '/(tabs)/projects', icon: 'folder' },
  { name: 'Tasks', route: '/(tabs)/tasks', icon: 'list' },
  { name: 'Calendar', route: '/(tabs)/calendar', icon: 'calendar-o' },
];

/** Power-user / legacy views — tucked under “More tools” */
const moreNav: NavItem[] = [
  { name: 'Insights', route: '/(tabs)/dashboard', icon: 'th-large' },
  { name: 'Today', route: '/(tabs)/today', icon: 'calendar' },
  { name: 'Upcoming', route: '/(tabs)/upcoming', icon: 'calendar-check-o' },
  { name: 'Labels', route: '/(tabs)/labels', icon: 'tags' },
  { name: 'Team', route: '/team', icon: 'users', teamOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  pinned: boolean;
  onToggleCollapse: () => void;
  onTogglePin: () => void;
}

function filterTeam(items: NavItem[], teamModeEnabled: boolean | undefined) {
  return items.filter((item) => !item.teamOnly || teamModeEnabled);
}

export default function Sidebar({
  collapsed,
  pinned,
  onToggleCollapse,
  onTogglePin,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme, resolvedTheme } = useThemeStore();
  const theme = themes[resolvedTheme];
  const { profile } = useProfileStore();
  const { currentTeam } = useTeamStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const teamModeEnabled = profile?.team_mode_enabled;
  const primary = filterTeam(primaryNav, teamModeEnabled);
  const more = filterTeam(moreNav, teamModeEnabled);

  if (Platform.OS !== 'web') {
    return null;
  }

  const isActive = (route: string) => {
    const normalized = route.replace('/(tabs)', '');
    if (pathname === route) return true;
    if (pathname?.startsWith(normalized) && normalized.length > 1) return true;
    return false;
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.route);
    return (
      <TouchableOpacity
        key={item.route + item.name}
        style={[
          styles.navItem,
          {
            backgroundColor: active ? theme.surfaceTertiary : 'transparent',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingHorizontal: collapsed ? 0 : 16,
          },
        ]}
        onPress={() => router.push(item.route as any)}
        accessibilityLabel={collapsed ? item.name : undefined}
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
    );
  };

  const collapsedMore = collapsed ? more : [];

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
      <View style={[styles.sidebarHeader, collapsed && styles.sidebarHeaderCollapsed]}>
        {!collapsed && (
          <TouchableOpacity
            style={[styles.pinButton, pinned && { backgroundColor: theme.surfaceTertiary }]}
            onPress={onTogglePin}
            accessibilityLabel={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
          >
            <FontAwesome
              name="thumb-tack"
              size={12}
              color={pinned ? theme.primary : theme.textTertiary}
              style={pinned ? {} : { transform: [{ rotate: '45deg' }] }}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={onToggleCollapse}
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FontAwesome
            name={collapsed ? 'angle-right' : 'angle-left'}
            size={16}
            color={theme.sidebarText}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.navSection}>
        {!collapsed && (
          <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>Workspace</Text>
        )}
        {primary.map((item) => renderNavItem(item))}

        {collapsed && collapsedMore.map((item) => renderNavItem(item))}

        {!collapsed && (
          <>
            <TouchableOpacity
              style={styles.moreToggle}
              onPress={() => setMoreOpen((o) => !o)}
              accessibilityRole="button"
              accessibilityState={{ expanded: moreOpen }}
            >
              <FontAwesome
                name={moreOpen ? 'chevron-down' : 'chevron-right'}
                size={12}
                color={theme.textTertiary}
              />
              <Text style={[styles.moreToggleText, { color: theme.textTertiary }]}>
                {moreOpen ? 'Hide extra tools' : 'More tools'}
              </Text>
            </TouchableOpacity>

            {moreOpen ? (
              <View style={styles.moreBlock}>
                {more.map((item) => renderNavItem(item))}
              </View>
            ) : null}
          </>
        )}
      </View>

      {teamModeEnabled && currentTeam && !collapsed && (
        <TouchableOpacity
          style={[
            styles.teamIndicator,
            { backgroundColor: theme.surfaceTertiary, borderColor: theme.border },
          ]}
          onPress={() => router.push('/team')}
        >
          <FontAwesome name="building" size={14} color={theme.primary} />
          <View style={styles.teamIndicatorText}>
            <Text style={[styles.teamLabel, { color: theme.textTertiary }]}>Team</Text>
            <Text style={[styles.teamName, { color: theme.text }]} numberOfLines={1}>
              {currentTeam.name}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={[styles.sidebarFooter, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.footerItem,
            { justifyContent: collapsed ? 'center' : 'flex-start' },
          ]}
          onPress={toggleTheme}
          accessibilityLabel={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
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
    marginTop: 2,
    marginBottom: 6,
    marginLeft: 14,
  },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
    marginLeft: 14,
    paddingVertical: 4,
  },
  moreToggleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moreBlock: {
    paddingBottom: 4,
  },
  navSection: {
    flex: 1,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    marginBottom: 1,
    borderRadius: 8,
    gap: 10,
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
    padding: 8,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  teamIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  teamIndicatorText: {
    flex: 1,
  },
  teamLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
