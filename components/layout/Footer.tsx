import { View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeStore, themes } from '@/store/themeStore';
import { useSyncStore } from '@/store/syncStore';

// Layout constant
export const FOOTER_HEIGHT = 18;

interface FooterProps {
  message?: string;
}

export default function Footer({ message }: FooterProps) {
  const { resolvedTheme } = useThemeStore();
  const theme = themes[resolvedTheme];
  const { syncing: isSyncing, lastSyncedAt: lastSyncTime } = useSyncStore();

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Format last sync time
  const getStatusText = () => {
    if (message) return message;
    if (isSyncing) return 'Syncing...';
    if (lastSyncTime) {
      const date = new Date(lastSyncTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just synced';
      if (diffMins < 60) return `Synced ${diffMins}m ago`;
      return `Synced at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return '';
  };

  const statusText = getStatusText();

  return (
    <View style={[styles.footer, { 
      backgroundColor: theme.surfaceSecondary, 
      borderTopColor: theme.border 
    }]}>
      <View style={styles.leftSection}>
        {/* Placeholder for future system messages */}
      </View>
      
      <View style={styles.rightSection}>
        {statusText && (
          <View style={styles.syncStatus}>
            {isSyncing && (
              <View style={[styles.syncIndicator, { backgroundColor: theme.primary }]} />
            )}
            <Text style={[styles.statusText, { color: theme.textTertiary }]}>
              {statusText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '400',
  },
});
