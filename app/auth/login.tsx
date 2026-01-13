import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { signIn, signInWithMagicLink } = useAuthStore();

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
    <View style={styles.container}>
      <Text style={styles.title}>BarkItDone</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      {!showMagicLink ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
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
            <Text style={styles.linkText}>Use magic link instead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={magicLinkEmail}
            onChangeText={setMagicLinkEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
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
            <Text style={styles.linkText}>Use password instead</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/auth/signup')}
      >
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
  },
});
