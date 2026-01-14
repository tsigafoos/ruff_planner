import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import WebLayout from '@/components/layout/WebLayout';
import Button from '@/components/ui/Button';
import { TeamInvite, TeamRole } from '@/types';

const ROLE_CONFIG: Record<TeamRole, { label: string; description: string }> = {
  owner: { label: 'Owner', description: 'Full control of the team' },
  admin: { label: 'Admin', description: 'Manage members and roles' },
  member: { label: 'Member', description: 'Work on tasks and assign' },
  guest: { label: 'Guest', description: 'View and comment only' },
};

export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuthStore();
  const { getInviteByToken, acceptInvite } = useTeamStore();

  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      try {
        const inviteData = await getInviteByToken(token);
        if (!inviteData) {
          setError('Invite not found or has been revoked');
        } else if (inviteData.status === 'accepted') {
          setError('This invite has already been used');
        } else if (inviteData.status === 'expired' || new Date(inviteData.expiresAt) < new Date()) {
          setError('This invite has expired');
        } else if (inviteData.status === 'revoked') {
          setError('This invite has been revoked');
        } else {
          setInvite(inviteData);
        }
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Failed to load invite');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !user?.id) return;

    setAccepting(true);
    setError(null);

    try {
      const result = await acceptInvite(token, user.id);
      if (result.success) {
        setSuccess(true);
        // Redirect to team page after a short delay
        setTimeout(() => {
          router.replace('/team');
        }, 2000);
      } else {
        setError(result.error || 'Failed to accept invite');
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  const handleLogin = () => {
    // Store the invite token in session storage to redirect back after login
    if (Platform.OS === 'web' && token) {
      sessionStorage.setItem('pendingInviteToken', token);
    }
    router.push('/auth/login');
  };

  const handleSignup = () => {
    // Store the invite token in session storage to redirect back after signup
    if (Platform.OS === 'web' && token) {
      sessionStorage.setItem('pendingInviteToken', token);
    }
    router.push('/auth/signup');
  };

  // Loading state
  if (loading || authLoading) {
    const content = (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading invite...
          </Text>
        </View>
      </View>
    );
    return Platform.OS === 'web' ? <WebLayout>{content}</WebLayout> : content;
  }

  // Error state
  if (error) {
    const content = (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <View style={[styles.iconCircle, { backgroundColor: '#EF4444' + '20' }]}>
            <FontAwesome name="times" size={32} color="#EF4444" />
          </View>
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to Join</Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>{error}</Text>
          <Button
            title="Go to Dashboard"
            onPress={() => router.replace('/')}
            style={styles.button}
          />
        </View>
      </View>
    );
    return Platform.OS === 'web' ? <WebLayout>{content}</WebLayout> : content;
  }

  // Success state
  if (success) {
    const content = (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <View style={[styles.iconCircle, { backgroundColor: '#10B981' + '20' }]}>
            <FontAwesome name="check" size={32} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: theme.text }]}>Welcome to the Team!</Text>
          <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
            You've successfully joined {invite?.team?.name}
          </Text>
          <Text style={[styles.redirectText, { color: theme.textTertiary }]}>
            Redirecting to team...
          </Text>
        </View>
      </View>
    );
    return Platform.OS === 'web' ? <WebLayout>{content}</WebLayout> : content;
  }

  // Not logged in - show login/signup options
  if (!user) {
    const content = (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.teamBadge, { backgroundColor: theme.primary + '15' }]}>
              <FontAwesome name="users" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.inviteTitle, { color: theme.text }]}>
              You're Invited!
            </Text>
            <Text style={[styles.inviteMessage, { color: theme.textSecondary }]}>
              You've been invited to join <Text style={{ fontWeight: '600' }}>{invite?.team?.name}</Text> as a{' '}
              <Text style={{ fontWeight: '600' }}>{ROLE_CONFIG[invite?.role || 'member'].label}</Text>
            </Text>
            
            <View style={[styles.roleInfo, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.roleInfoText, { color: theme.textSecondary }]}>
                {ROLE_CONFIG[invite?.role || 'member'].description}
              </Text>
            </View>

            <Text style={[styles.authPrompt, { color: theme.text }]}>
              Sign in or create an account to accept this invite
            </Text>

            <View style={styles.authButtons}>
              <Button
                title="Sign In"
                variant="secondary"
                onPress={handleLogin}
                style={styles.authButton}
              />
              <Button
                title="Create Account"
                onPress={handleSignup}
                style={styles.authButton}
              />
            </View>
          </View>
        </View>
      </View>
    );
    return Platform.OS === 'web' ? <WebLayout>{content}</WebLayout> : content;
  }

  // Logged in - show accept button
  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.centerContent}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.teamBadge, { backgroundColor: theme.primary + '15' }]}>
            <FontAwesome name="users" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.inviteTitle, { color: theme.text }]}>
            Join {invite?.team?.name}
          </Text>
          <Text style={[styles.inviteMessage, { color: theme.textSecondary }]}>
            You've been invited to join as a{' '}
            <Text style={{ fontWeight: '600' }}>{ROLE_CONFIG[invite?.role || 'member'].label}</Text>
          </Text>

          <View style={[styles.roleCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <View style={styles.roleCardHeader}>
              <FontAwesome name="shield" size={16} color={theme.primary} />
              <Text style={[styles.roleCardTitle, { color: theme.text }]}>
                {ROLE_CONFIG[invite?.role || 'member'].label}
              </Text>
            </View>
            <Text style={[styles.roleCardDesc, { color: theme.textSecondary }]}>
              {ROLE_CONFIG[invite?.role || 'member'].description}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userInfoLabel, { color: theme.textSecondary }]}>
              Joining as
            </Text>
            <Text style={[styles.userInfoEmail, { color: theme.text }]}>
              {user.email}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Decline"
              variant="secondary"
              onPress={() => router.replace('/')}
              style={styles.actionButton}
            />
            <Button
              title="Accept Invite"
              onPress={handleAccept}
              loading={accepting}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return Platform.OS === 'web' ? <WebLayout>{screenContent}</WebLayout> : screenContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 12,
  },
  button: {
    minWidth: 160,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  teamBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  inviteMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  roleInfo: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  roleInfoText: {
    fontSize: 13,
    textAlign: 'center',
  },
  authPrompt: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authButton: {
    flex: 1,
  },
  roleCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleCardDesc: {
    fontSize: 13,
    marginLeft: 26,
  },
  userInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  userInfoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
