import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/useTheme';
import { useState, useRef, useEffect } from 'react';

export default function TopBar() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const theme = useTheme();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const accountMenuRef = useRef<View>(null);
  const profileMenuRef = useRef<View>(null);

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (accountMenuRef.current && !(accountMenuRef.current as any).contains(event.target)) {
        setAccountMenuOpen(false);
      }
      if (profileMenuRef.current && !(profileMenuRef.current as any).contains(event.target)) {
        setProfileMenuOpen(false);
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

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setAccountMenuOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.appName, { color: theme.text }]}>BarkItDone</Text>
      </View>
      
      <View style={styles.navSection}>
        <View ref={accountMenuRef} style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={toggleAccountMenu}
          >
            <FontAwesome name="user" size={16} color={theme.textSecondary} />
            <Text style={[styles.navText, { color: theme.textSecondary }]}>Account</Text>
            <FontAwesome 
              name={accountMenuOpen ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={theme.textSecondary} 
              style={styles.chevron}
            />
          </TouchableOpacity>
          {accountMenuOpen && (
            <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.text }]}>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  // Navigate to account settings (placeholder for now)
                  setAccountMenuOpen(false);
                  console.log('Account Settings clicked');
                }}
              >
                <FontAwesome name="cog" size={14} color={theme.textSecondary} />
                <Text style={[styles.dropdownItemText, { color: theme.text }]}>Account Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setAccountMenuOpen(false);
                  handleSignOut();
                }}
              >
                <FontAwesome name="sign-out" size={14} color={theme.error} />
                <Text style={[styles.dropdownItemText, { color: theme.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            // Navigate to team (placeholder)
            console.log('Team clicked');
          }}
        >
          <FontAwesome name="users" size={16} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Team</Text>
        </TouchableOpacity>

        <View ref={profileMenuRef} style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={toggleProfileMenu}
          >
            <FontAwesome name="id-card" size={16} color={theme.textSecondary} />
            <Text style={[styles.navText, { color: theme.textSecondary }]}>Profile</Text>
            <FontAwesome 
              name={profileMenuOpen ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={theme.textSecondary} 
              style={styles.chevron}
            />
          </TouchableOpacity>
          {profileMenuOpen && (
            <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.text }]}>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setProfileMenuOpen(false);
                  router.push('/profile');
                }}
              >
                <FontAwesome name="user-circle" size={14} color={theme.textSecondary} />
                <Text style={[styles.dropdownItemText, { color: theme.text }]}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setProfileMenuOpen(false);
                  router.push('/profile');
                  // TODO: Open edit mode when navigating to profile
                }}
              >
                <FontAwesome name="edit" size={14} color={theme.textSecondary} />
                <Text style={[styles.dropdownItemText, { color: theme.text }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            // Navigate to management (placeholder)
            console.log('Management clicked');
          }}
        >
          <FontAwesome name="cog" size={16} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Management</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        {user?.email && (
          <Text style={[styles.userEmail, { color: theme.textTertiary }]}>{user.email}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 1000,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  navSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginLeft: 'auto',
  },
  dropdownContainer: {
    position: 'relative',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 180,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userEmail: {
    fontSize: 14,
  },
});
