import { useEffect } from 'react';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import TaskCard from '@/components/TaskCard';
import QuickAdd from '@/components/QuickAdd';
import { PageWrapper } from '@/components/ui';

export default function TodayScreen() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasksDueToday, completeTask, deleteTask } = useTaskStore();

  useEffect(() => {
    if (user?.id) {
      fetchTasksDueToday(user.id);
    }
  }, [user?.id]);

  const handleAddTask = async (title: string) => {
    // QuickAdd handles this
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      if (user?.id) fetchTasksDueToday(user.id);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      if (user?.id) fetchTasksDueToday(user.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <PageWrapper
      section="Tasks"
      title="Today"
      subtitle={`${tasks.length} tasks due today`}
      loading={loading}
      isEmpty={tasks.length === 0}
      emptyState={{
        icon: 'calendar-check-o',
        title: 'No tasks due today',
        subtitle: 'Add a task to get started',
      }}
    >
      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={() => handleComplete(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <QuickAdd onAdd={handleAddTask} />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: Platform.OS === 'web' ? 40 : 100,
  },
});
