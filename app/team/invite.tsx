import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import WebLayout from '@/components/layout/WebLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TeamRole } from '@/types';

const ROLE_OPTIONS: { value: TeamRole; label: string; description: string; icon: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Can manage members and roles', icon: 'shield' },
  { value: 'member', label: 'Member', description: 'Can work on tasks and assign', icon: 'user' },
  { value: 'guest', label: 'Guest', description: 'Can view and comment only', icon: 'eye' },
];

export default function InviteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { currentTeam, createInvite } = useTeamStore();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('member');
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    if (!currentTeam || !user?.id || !email.trim()) return;
    
    setSending(true);
    setError(null);
    try {
      const invite = await createInvite(currentTeam.id, email.trim(), role, user.id);
      if (invite) {
        // Build the invite link
        const baseUrl = Platform.OS === 'web' 
          ? window.location.origin 
          : 'https://app.barkitdone.com'; // Replace with actual app URL
        const link = `${baseUrl}/invite/${invite.token}`;
        setInviteLink(link);
      } else {
        setError('Failed to create invite. Please try again.');
      }
    } catch (err: any) {
      console.error('Error creating invite:', err);
      setError(err?.message || 'Failed to create invite. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAnother = () => {
    setEmail('');
    setRole('member');
    setInviteLink(null);
    setCopied(false);
    setError(null);
  };

  if (!currentTeam) {
    return null;
  }

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={16} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Invite to {currentTeam.name}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!inviteLink ? (
          // Create Invite Form
          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.iconContainer}>
              <FontAwesome name="envelope-o" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.formTitle, { color: theme.text }]}>Send an Invite</Text>
            <Text style={[styles.formDescription, { color: theme.textSecondary }]}>
              Enter the email address of the person you want to invite to your team
            </Text>

            {error && (
              <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="colleague@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.roleSection}>
              <Text style={[styles.roleLabel, { color: theme.text }]}>Role</Text>
              <View style={styles.roleOptions}>
                {ROLE_OPTIONS.map(option => {
                  const isSelected = role === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: isSelected ? theme.primary + '15' : theme.surfaceSecondary,
                          borderColor: isSelected ? theme.primary : theme.border,
                        }
                      ]}
                      onPress={() => setRole(option.value)}
                    >
                      <View style={styles.roleOptionHeader}>
                        <FontAwesome 
                          name={option.icon as any} 
                          size={14} 
                          color={isSelected ? theme.primary : theme.textSecondary} 
                        />
                        <Text style={[
                          styles.roleOptionLabel,
                          { color: isSelected ? theme.primary : theme.text }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <FontAwesome name="check-circle" size={16} color={theme.primary} />
                        )}
                      </View>
                      <Text style={[styles.roleOptionDesc, { color: theme.textSecondary }]}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Button
              title="Create Invite Link"
              onPress={handleCreateInvite}
              loading={sending}
              disabled={!email.trim()}
              style={styles.submitButton}
            />
          </View>
        ) : (
          // Invite Created - Show Link
          <View style={[styles.successCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.successIcon, { backgroundColor: '#10B981' + '20' }]}>
              <FontAwesome name="check" size={32} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Invite Created!</Text>
            <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
              Share this link with <Text style={{ fontWeight: '600' }}>{email}</Text> to invite them as a{' '}
              <Text style={{ fontWeight: '600' }}>{ROLE_OPTIONS.find(r => r.value === role)?.label}</Text>
            </Text>

            <View style={[styles.linkContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={[styles.linkText, { color: theme.text }]} numberOfLines={1}>
                {inviteLink}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: copied ? '#10B981' : theme.primary }]}
              onPress={handleCopyLink}
            >
              <FontAwesome name={copied ? 'check' : 'copy'} size={14} color="#FFFFFF" />
              <Text style={styles.copyButtonText}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Text>
            </TouchableOpacity>

            <View style={styles.expiryNote}>
              <FontAwesome name="clock-o" size={12} color={theme.textTertiary} />
              <Text style={[styles.expiryText, { color: theme.textTertiary }]}>
                This link expires in 7 days
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Send Another"
                variant="secondary"
                onPress={handleSendAnother}
                style={styles.actionButton}
              />
              <Button
                title="Done"
                onPress={() => router.back()}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return Platform.OS === 'web' ? <WebLayout>{screenContent}</WebLayout> : screenContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 24 : 16,
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  roleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleOptions: {
    gap: 10,
  },
  roleOption: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  roleOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleOptionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  roleOptionDesc: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 22,
  },
  submitButton: {
    marginTop: 8,
  },
  // Success state
  successCard: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  linkContainer: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expiryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  expiryText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
});
