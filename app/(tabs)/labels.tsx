import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLabelStore } from '@/store/labelStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/useTheme';
import { PageHeader } from '@/components/layout';

export default function LabelsScreen() {
  const { user } = useAuthStore();
  const { labels, loading, fetchLabels } = useLabelStore();
  const theme = useTheme();

  useEffect(() => {
    if (user?.id) {
      fetchLabels(user.id);
    }
  }, [user?.id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {Platform.OS === 'web' ? (
        <PageHeader
          section="Settings"
          pageName="Labels"
          subtitle={`${labels.length} labels`}
          actions={[
            {
              label: 'Add Label',
              icon: 'plus',
              onPress: () => console.log('Add Label - coming soon'),
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Labels</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{labels.length} labels</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={labels}
          keyExtractor={(item: any) => item.id}
          numColumns={Platform.OS === 'web' ? 4 : 2}
          renderItem={({ item }) => (
            <View style={styles.labelWrapper}>
              <TouchableOpacity
                style={[
                  styles.labelCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: item.color || theme.primary },
                  ]}
                />
                <Text style={[styles.labelName, { color: theme.text }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No labels yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Create a label to get started</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  labelWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: Platform.OS === 'web' ? '22%' : '48%',
  },
  labelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  labelName: {
    fontSize: 16,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
