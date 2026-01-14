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
        {Platform.OS === 'web' ? (
          // @ts-ignore - SVG elements for web
          <svg width="32" height="32" viewBox="0 0 500 500" style={{ marginRight: 8 }}>
            <path d="M476.7,199.1l-2.2-12.5c-.7-4-3.4-7.4-7.2-9l-106.6-45.2,7.9-33.1c7.2,1.2,19.8,1.8,30-5.6,9.6-7,14.6-19.2,14.6-36.2,0-15.2-4.3-25.3-13-30-13.3-7.2-31.6,1.3-40,6-6.1-7-20.3-20.9-36-20.2-9.8.4-18.3,6.3-25.1,17.3-6.8,11.2-8.5,22-4.9,32.1,5.5,15.5,21.8,24.7,29.9,28.5l-6,23-123.4-52.3c-5.1-2.1-10.9-.6-14.3,3.8L35.1,255.3c-2.2,2.9-3,6.6-2.1,10.1h0c2.1,8.7,12.6,12.2,19.5,6.4l2.6-2.2c.7-.6,1.3-1.2,1.8-1.9l22.4-29.2,40.2,83.9c.3,2.9.6,5.4.9,7.3-7.6,5.1-25.9,19.2-27.2,36.7-.7,10,4.1,19.1,14.2,27.1,10.8,8.6,21.2,11.4,30.9,8.3,6.1-1.9,11.1-6,15-10.7-.2.2-.4.5-.5.7l16.2,34c2.4,8.7,9.4,14.6,17.4,14.8l82.2,1.4,9.8,6.2c.9.6,1.9.8,2.9.8s1.4-.1,2.1-.4c1.6-.7,2.8-2.1,3.2-3.8l.6-2.5,54.5.9c9.7.2,17.8-8.3,18.8-19.3l50.9-229.5,36.9,18.5c2,1,4.2,1.4,6.4,1.2l11.3-1c7-.6,12-7.1,10.8-14.1ZM277.7,435l-115-72.3c-.9-.6-1.9-.8-2.9-.8s-1.3.1-1.9.4c-1.6.6-2.8,1.9-3.3,3.5-1.8,6-8.8,22.4-19.7,25.8-6,1.9-13-.3-20.8-6.5-7.2-5.7-10.5-11.6-10.1-17.9.8-12,15.4-23.9,23-28.9l.3.5c1-.6,1.6-1,1.6-1,0,0,0-.2-.1-.6.1,0,.2-.1.3-.2,2-1.2,3.1-3.6,2.6-5.9,0-.3-6.1-28.4,4.1-42.9,4.3-4.7,10.4-7.9,19.3-8.2.3,0,.5,0,.7,0,5.3.4,9.3,2.3,12.1,5.8,8.8,11,4.9,35.5,2.6,44.1-.6,2.4.4,4.9,2.5,6.1l79,45.6c1.4.8,3,.9,4.5.4l.7.4.2-.8c1.2-.7,2.1-1.9,2.5-3.3l75.9-289c.7-2.7-.8-5.5-3.4-6.5-.2,0-22.5-8.2-27.9-23.8-2.5-7-1.2-14.5,3.9-22.8,4.8-7.8,10.2-11.9,16.3-12.2,12.2-.5,25.8,14,30,19.6,1.7,2.3,4.9,2.9,7.3,1.3,5.6-3.7,23.7-13.1,33.1-8.1,4.9,2.7,7.4,9.5,7.3,20.4,0,13.4-3.4,22.6-10.1,27.5-10.3,7.5-25.9,2.8-26,2.7-1.4-.5-3-.3-4.3.4-1.3.7-2.3,2-2.6,3.5l-81.6,343.4Z" fill={theme.text} />
          </svg>
        ) : null}
        <Text style={[styles.appName, { color: theme.text }]}>BarkItDone</Text>
      </View>
      
      <View style={styles.navSection}>
        <View ref={accountMenuRef} style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={toggleAccountMenu}
          >
            <FontAwesome name="user-o" size={15} color={theme.textSecondary} />
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
                <FontAwesome name="cog" size={13} color={theme.textSecondary} />
                <Text style={[styles.dropdownItemText, { color: theme.text }]}>Account Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setAccountMenuOpen(false);
                  handleSignOut();
                }}
              >
                <FontAwesome name="sign-out" size={13} color={theme.error} />
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
            <FontAwesome name="users" size={15} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Team</Text>
        </TouchableOpacity>

        <View ref={profileMenuRef} style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={toggleProfileMenu}
          >
            <FontAwesome name="id-card-o" size={15} color={theme.textSecondary} />
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
                <FontAwesome name="user-circle-o" size={13} color={theme.textSecondary} />
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
                <FontAwesome name="pencil" size={13} color={theme.textSecondary} />
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
            <FontAwesome name="cog" size={15} color={theme.textSecondary} />
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
    fontWeight: '600',
    letterSpacing: -0.015,
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
    fontWeight: '450',
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
    fontWeight: '450',
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
