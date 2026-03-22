import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useThemeStore, themes } from '@/store/themeStore';
import { useState, useRef, useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';

// House logo SVG component
const HouseLogo = ({ size = 24, color = '#0066ff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.25V20C3 20.5523 3.44772 21 4 21H9V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21H20C20.5523 21 21 20.5523 21 20V10.25"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 12L11.3292 3.61209C11.7058 3.30445 12.2426 3.30232 12.6218 3.60701L23 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface DropdownItem {
  label: string;
  icon: string;
  onPress: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
  theme: typeof themes.light;
}

const DropdownMenu = ({ items, isOpen, onClose, theme }: DropdownMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <View style={[styles.dropdownMenu, { 
      backgroundColor: theme.surface, 
      borderColor: theme.border,
      shadowColor: theme.text,
    }]}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.dropdownItem,
            index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
          ]}
          onPress={() => {
            item.onPress();
            onClose();
          }}
        >
          <FontAwesome 
            name={item.icon as any} 
            size={13} 
            color={item.danger ? theme.error : theme.textSecondary} 
          />
          <Text style={[
            styles.dropdownItemText, 
            { color: item.danger ? theme.error : theme.text }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function TopNavbar() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { resolvedTheme } = useThemeStore();
  const theme = themes[resolvedTheme];
  const teamModeEnabled = profile?.team_mode_enabled;

  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const teamMenuRef = useRef<View>(null);
  const accountMenuRef = useRef<View>(null);

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (teamMenuRef.current && !(teamMenuRef.current as any).contains(event.target)) {
        setTeamMenuOpen(false);
      }
      if (accountMenuRef.current && !(accountMenuRef.current as any).contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const closeAllMenus = () => {
    setTeamMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const toggleTeamMenu = () => {
    closeAllMenus();
    setTeamMenuOpen(!teamMenuOpen);
  };

  const toggleAccountMenu = () => {
    closeAllMenus();
    setAccountMenuOpen(!accountMenuOpen);
  };

  const teamItems: DropdownItem[] = [
    {
      label: 'Manage Teams',
      icon: 'users',
      onPress: () => router.push('/team'),
    },
    {
      label: 'Invite Member',
      icon: 'user-plus',
      onPress: () => router.push('/team/invite'),
    },
  ];

  const accountItems: DropdownItem[] = [
    {
      label: 'Profile',
      icon: 'user-circle-o',
      onPress: () => router.push('/profile'),
    },
    {
      label: 'Insights (widgets)',
      icon: 'th-large',
      onPress: () => router.push('/(tabs)/dashboard'),
    },
    {
      label: 'Sign out',
      icon: 'sign-out',
      onPress: handleSignOut,
      danger: true,
    },
  ];

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.surface, 
      borderBottomColor: theme.border 
    }]}>
      {/* Left Section - Logo + Title */}
      <TouchableOpacity
        style={styles.logoSection}
        onPress={() => router.push('/(tabs)/projects')}
      >
        <HouseLogo size={24} color={theme.primary} />
        <Text style={[styles.appTitle, { color: theme.text }]}>BarkItDone</Text>
      </TouchableOpacity>

      <View style={styles.navSection}>
        {teamModeEnabled ? (
          <View ref={teamMenuRef} style={styles.dropdownContainer}>
            <TouchableOpacity
              style={[styles.navItem, teamMenuOpen && { backgroundColor: theme.surfaceTertiary }]}
              onPress={toggleTeamMenu}
            >
              <FontAwesome name="users" size={15} color={theme.textSecondary} />
              <Text style={[styles.navText, { color: theme.textSecondary }]}>Team</Text>
              <FontAwesome
                name={teamMenuOpen ? 'chevron-up' : 'chevron-down'}
                size={10}
                color={theme.textTertiary}
                style={styles.chevron}
              />
            </TouchableOpacity>
            <DropdownMenu
              items={teamItems}
              isOpen={teamMenuOpen}
              onClose={() => setTeamMenuOpen(false)}
              theme={theme}
            />
          </View>
        ) : null}

        <View ref={accountMenuRef} style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.navItem, accountMenuOpen && { backgroundColor: theme.surfaceTertiary }]}
            onPress={toggleAccountMenu}
          >
            <FontAwesome name="user-o" size={15} color={theme.textSecondary} />
            <Text style={[styles.navText, { color: theme.textSecondary }]}>Account</Text>
            <FontAwesome
              name={accountMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={10}
              color={theme.textTertiary}
              style={styles.chevron}
            />
          </TouchableOpacity>
          <DropdownMenu
            items={accountItems}
            isOpen={accountMenuOpen}
            onClose={() => setAccountMenuOpen(false)}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.02,
  },
  navSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownContainer: {
    position: 'relative',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 2,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 180,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
