import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (initialized && user) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, initialized, router]);

  // Show loading or redirect if authenticated
  if (initialized && user) {
    return null; // Will redirect
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome name="check-circle" size={64} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Welcome to BarkItDone</Text>
        <Text style={styles.subtitle}>
          Your minimalist task management companion
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <FontAwesome name="list" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Go to Tasks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/(tabs)/projects')}
          >
            <FontAwesome name="folder" size={20} color="#3B82F6" />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>View Projects</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#3B82F6',
  },
});
