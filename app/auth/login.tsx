import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { signIn, signInWithMagicLink } = useAuthStore();
  const theme = useTheme();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
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
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
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
});
