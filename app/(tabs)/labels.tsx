import { useEffect } from 'react';
import { FlatList, View, StyleSheet, Platform } from 'react-native';
import { useLabelStore } from '@/store/labelStore';
import { useAuthStore } from '@/store/authStore';
import { PageWrapper, LabelCard } from '@/components/ui';

export default function LabelsScreen() {
  const { user } = useAuthStore();
  const { labels, loading, fetchLabels } = useLabelStore();

  useEffect(() => {
    if (user?.id) {
      fetchLabels(user.id);
    }
  }, [user?.id]);

  return (
    <PageWrapper
      section="Settings"
      title="Labels"
      subtitle={`${labels.length} labels`}
      loading={loading}
      isEmpty={labels.length === 0}
      emptyState={{
        icon: 'tags',
        title: 'No labels yet',
        subtitle: 'Create a label to get started',
      }}
      actions={[
        {
          label: 'Add Label',
          icon: 'plus',
          onPress: () => console.log('Add Label - coming soon'),
          variant: 'primary',
        },
      ]}
    >
      <FlatList
        data={labels}
        keyExtractor={(item: any) => item.id}
        numColumns={Platform.OS === 'web' ? 4 : 2}
        renderItem={({ item }) => (
          <View style={styles.labelWrapper}>
            <LabelCard
              id={item.id}
              name={item.name}
              color={item.color}
            />
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
      />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  labelWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: Platform.OS === 'web' ? '22%' : '48%',
  },
});
