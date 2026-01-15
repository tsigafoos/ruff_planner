import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTheme } from './useTheme';

interface GuestUpgradeBannerProps {
  onDismiss?: () => void;
}

export default function GuestUpgradeBanner({ onDismiss }: GuestUpgradeBannerProps) {
  const theme = useTheme();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    router.push('/profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <FontAwesome name="star" size={16} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Upgrade Your Account
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Create a full account to unlock all features - manage your own projects, invite team members, and more.
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.upgradeButton, { backgroundColor: theme.primary }]}
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeButtonText}>Complete Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
        >
          <Text style={[styles.dismissButtonText, { color: theme.textSecondary }]}>Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: Platform.OS === 'web' ? 16 : 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
