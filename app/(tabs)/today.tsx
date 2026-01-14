import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import TaskCard from '@/components/TaskCard';
import QuickAdd from '@/components/QuickAdd';
import { useTheme } from '@/components/useTheme';
import { PageHeader, commonActions } from '@/components/layout';

export default function TodayScreen() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasksDueToday, completeTask, deleteTask } = useTaskStore();
  const theme = useTheme();
  const [quickAddVisible, setQuickAddVisible] = useState(false);

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {Platform.OS === 'web' ? (
        <PageHeader
          section="Tasks"
          pageName="Today"
          subtitle={`${tasks.length} tasks due today`}
          actions={[
            commonActions.addTask(() => setQuickAddVisible(true)),
          ]}
        />
      ) : (
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Today</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{tasks.length} tasks due today</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
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
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks due today</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Add a task to get started</Text>
            </View>
          }
        />
      )}

      <QuickAdd onAdd={handleAddTask} visible={quickAddVisible} onToggle={() => setQuickAddVisible(!quickAddVisible)} />
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
