import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function formatAuthError(error: any): string {
  const msg = error?.message || String(error);
  if (/email not confirmed|confirm your email/i.test(msg)) {
    return 'Email not confirmed yet. Check your inbox or turn off “Confirm email” under Supabase → Authentication → Providers (for local dev).';
  }
  if (/invalid login credentials/i.test(msg)) {
    return 'Wrong email or password, or the account needs email confirmation before sign-in.';
  }
  return msg;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const params = useLocalSearchParams<{ notice?: string | string[] }>();
  const notice = Array.isArray(params.notice) ? params.notice[0] : params.notice;
  
  const router = useRouter();
  const { signIn, signInWithMagicLink } = useAuthStore();
  const theme = useTheme();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      const msg = 'Please enter email and password';
      setFormError(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/projects');
    } catch (error: any) {
      const msg = formatAuthError(error);
      setFormError(msg);
      if (Platform.OS === 'web') window.alert(`Login failed\n\n${msg}`);
      else Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!magicLinkEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithMagicLink(magicLinkEmail);
      Alert.alert(
        'Check your email',
        'We sent you a magic link to sign in. Click the link in the email to continue.'
      );
      setShowMagicLink(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Sign in</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {showMagicLink ? 'Enter your email to receive a magic link' : 'Enter your credentials to continue'}
        </Text>

        {notice === 'verify' ? (
          <Text style={[styles.banner, { color: theme.textSecondary, borderColor: theme.border, backgroundColor: theme.surface }]}>
            Account created. Confirm the email Supabase sent you, then sign in below. For dev, you can disable email confirmation in the Supabase dashboard.
          </Text>
        ) : null}

        {formError ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}

        {!showMagicLink ? (
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setFormError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View style={styles.passwordFieldWrap}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={theme.textTertiary}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setFormError(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowMagicLink(true)}
            >
              <Text style={[styles.linkText, { color: theme.primary }]}>Use magic link instead</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textTertiary}
              value={magicLinkEmail}
              onChangeText={setMagicLinkEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleMagicLink}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowMagicLink(false)}
            >
              <Text style={[styles.linkText, { color: theme.primary }]}>Use password instead</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Don't have an account? <Text style={{ color: theme.primary }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordFieldWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  banner: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'left',
  },
});
