import { useEffect } from 'react';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import TaskCard from '@/components/TaskCard';
import QuickAdd from '@/components/QuickAdd';
import { PageWrapper } from '@/components/ui';

export default function UpcomingScreen() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasksDueUpcoming } = useTaskStore();

  useEffect(() => {
    if (user?.id) {
      fetchTasksDueUpcoming(user.id);
    }
  }, [user?.id]);

  const handleAddTask = async (title: string) => {
    // QuickAdd handles this
  };

  return (
    <PageWrapper
      section="Tasks"
      title="Upcoming"
      subtitle={`${tasks.length} tasks`}
      loading={loading}
      isEmpty={tasks.length === 0}
      emptyState={{
        icon: 'calendar',
        title: 'No upcoming tasks',
        subtitle: 'Add a task to get started',
      }}
    >
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
      />

      <QuickAdd onAdd={handleAddTask} />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
});
