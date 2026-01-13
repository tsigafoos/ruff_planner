import { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Input from './ui/Input';
import Button from './ui/Button';
import DatePicker from './ui/DatePicker';
import { useTheme } from './useTheme';
import { useProfileStore } from '@/store/profileStore';

interface ProfileFormProps {
  visible: boolean;
  onClose: () => void;
  profile?: any;
  user: any;
}

export default function ProfileForm({ visible, onClose, profile, user }: ProfileFormProps) {
  const theme = useTheme();
  const { updateProfile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', linkedin: '', github: '', website: '' });
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setDateOfBirth(profile.date_of_birth ? new Date(profile.date_of_birth) : undefined);
      setLocation(profile.location || '');
      setPhoneNumber(profile.phone_number || '');
      setAvatarUrl(profile.avatar_url || '');
      setSocialLinks(profile.social_links || { twitter: '', linkedin: '', github: '', website: '' });
      setPreferences(profile.preferences || {});
    } else {
      setFullName('');
      setUsername('');
      setBio('');
      setDateOfBirth(undefined);
      setLocation('');
      setPhoneNumber('');
      setAvatarUrl('');
      setSocialLinks({ twitter: '', linkedin: '', github: '', website: '' });
      setPreferences({});
    }
  }, [profile, visible]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        location: location.trim() || null,
        phone_number: phoneNumber.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        social_links: socialLinks,
        preferences: preferences,
      });
      await fetchProfile(user.id);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      visible={visible}
      animationType={isWeb ? 'fade' : 'slide'}
      transparent={!isWeb}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: isWeb ? 'rgba(0, 0, 0, 0.5)' : 'transparent' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={Platform.OS === 'web' ? 16 : 20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
              
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />

              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                autoCapitalize="none"
              />

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
                <Text style={[styles.readOnlyValue, { color: theme.textTertiary }]}>{user?.email || 'N/A'}</Text>
                <Text style={[styles.hint, { color: theme.textTertiary }]}>Email cannot be changed</Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Bio / About</Text>
                <TextInput
                  style={[styles.textArea, {
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <DatePicker
                label="Date of Birth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
              />

              <Input
                label="Location (City/Country)"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., New York, USA"
              />

              <Input
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />

              <Input
                label="Profile Picture URL"
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="Enter image URL"
                autoCapitalize="none"
              />
            </View>

            {/* Social Links */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Links (Optional)</Text>
              
              <Input
                label="Twitter"
                value={socialLinks.twitter}
                onChangeText={(value) => updateSocialLink('twitter', value)}
                placeholder="https://twitter.com/username"
                autoCapitalize="none"
              />

              <Input
                label="LinkedIn"
                value={socialLinks.linkedin}
                onChangeText={(value) => updateSocialLink('linkedin', value)}
                placeholder="https://linkedin.com/in/username"
                autoCapitalize="none"
              />

              <Input
                label="GitHub"
                value={socialLinks.github}
                onChangeText={(value) => updateSocialLink('github', value)}
                placeholder="https://github.com/username"
                autoCapitalize="none"
              />

              <Input
                label="Website"
                value={socialLinks.website}
                onChangeText={(value) => updateSocialLink('website', value)}
                placeholder="https://yourwebsite.com"
                autoCapitalize="none"
              />
            </View>

            {/* Account Information (Read-only) */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Information</Text>
              
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Account Created</Text>
                <Text style={[styles.readOnlyValue, { color: theme.textTertiary }]}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              title="Save"
              onPress={handleSubmit}
              loading={loading}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? '60%' : '90%',
    maxWidth: Platform.OS === 'web' ? 800 : '90%',
    maxHeight: '90%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 22,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 20 : 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 8,
    padding: 12,
    fontSize: Platform.OS === 'web' ? 13 : 14,
    lineHeight: Platform.OS === 'web' ? 18 : 20,
    borderWidth: 1,
  },
  readOnlyValue: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    paddingVertical: 8,
  },
  hint: {
    fontSize: Platform.OS === 'web' ? 11 : 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 100,
  },
});
