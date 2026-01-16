import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useTheme } from '@/components/useTheme';
import WebLayout from '@/components/layout/WebLayout';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import ProfileForm from '@/components/ProfileForm';
import TeamSettings from '@/components/settings/TeamSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, loading, fetchProfile } = useProfileStore();
  const theme = useTheme();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Please sign in to view your profile</Text>
      </View>
    );
  }

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={Platform.OS === 'web' ? 16 : 20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={() => setEditMode(true)}
        >
          <FontAwesome name="edit" size={Platform.OS === 'web' ? 14 : 18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS === 'web' && styles.contentContainerWeb
          ]}
        >
          <View style={[styles.profileBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Avatar Section */}
          <View style={[styles.avatarSection, { borderColor: 'transparent', backgroundColor: 'transparent' }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                <FontAwesome name="user" size={48} color={theme.primary} />
              </View>
            )}
            <Text style={[styles.name, { color: theme.text }]}>
              {profile?.full_name || user.email?.split('@')[0] || 'User'}
            </Text>
            {profile?.username && (
              <Text style={[styles.username, { color: theme.textSecondary }]}>@{profile.username}</Text>
            )}
          </View>

          {/* Profile Information */}
          <View style={[styles.section, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
            
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.full_name || 'Not set'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Username</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.username ? `@${profile.username}` : 'Not set'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email Address</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {user.email || 'Not set'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Bio</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.bio || 'No bio available'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Date of Birth</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.date_of_birth ? format(new Date(profile.date_of_birth), 'MMMM d, yyyy') : 'Not set'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Location</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.location || 'Not set'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Phone Number</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.phone_number || 'Not set'}
              </Text>
            </View>
          </View>

          {/* Account Information */}
          <View style={[styles.section, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Information</Text>
            
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Account Created</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'N/A'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Last Login</Text>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMMM d, yyyy h:mm a') : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Social Links */}
          {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Links</Text>
              {Object.entries(profile.social_links).map(([platform, url]) => (
                <View key={platform} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{platform}</Text>
                  <Text style={[styles.fieldValue, { color: theme.primary }]}>{url as string}</Text>
                </View>
              ))}
            </View>
          )}
          </View>
          
          {/* Appearance Settings */}
          <View style={Platform.OS === 'web' ? { width: '100%', maxWidth: 900, alignSelf: 'center' } : undefined}>
            <AppearanceSettings />
          </View>
          
          {/* Team & Collaboration Settings - Outside profileBox for better modal rendering */}
          <View style={Platform.OS === 'web' ? { width: '100%', maxWidth: 900, alignSelf: 'center' } : undefined}>
            <TeamSettings
              onManageTeam={() => {
                router.push('/team');
              }}
            />
          </View>
        </ScrollView>
      )}

      <ProfileForm
        visible={editMode}
        onClose={() => setEditMode(false)}
        profile={profile}
        user={user}
      />
    </View>
  );

  if (Platform.OS === 'web') {
    return <WebLayout>{screenContent}</WebLayout>;
  }

  return screenContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 28,
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 24 : 16,
    flexGrow: 1,
  },
  contentContainerWeb: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileBox: {
    width: Platform.OS === 'web' ? '100%' : '100%',
    maxWidth: Platform.OS === 'web' ? 900 : '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 32 : 24,
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
  },
  section: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: Platform.OS === 'web' ? 15 : 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
