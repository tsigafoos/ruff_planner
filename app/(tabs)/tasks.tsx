import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { useProjectStore } from '@/store/projectStore';
import { useLabelStore } from '@/store/labelStore';
import { useTheme } from '@/components/useTheme';
import { PageHeader, commonActions } from '@/components/layout';

export default function TasksScreen() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, createTask, updateTask, completeTask, uncompleteTask, deleteTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchProjects(user.id);
      fetchLabels(user.id);
    }
  }, [user?.id]);

  const handleCreateTask = async (taskData: any) => {
    if (!user?.id) return;
    try {
      await createTask({
        ...taskData,
        userId: user.id,
      });
      setNewTaskFormVisible(false);
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      if (user?.id) fetchTasks(user.id);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      if (user?.id) fetchTasks(user.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: any) => {
    // Normalize task data from Supabase format (snake_case) to TaskForm format (camelCase)
    const normalizedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      startDate: task.start_date ? task.start_date : (task.startDate ? task.startDate : undefined),
      dueDate: task.due_date ? task.due_date : (task.dueDate ? task.dueDate : undefined),
      priority: task.priority,
      projectId: task.project_id || task.projectId,
      labelIds: typeof task.label_ids === 'string' ? JSON.parse(task.label_ids || '[]') : (task.label_ids || task.labelIds || []),
      completed: !!(task.completed_at || task.completedAt),
      completed_at: task.completed_at || task.completedAt,
      status: task.status || (task.completed_at || task.completedAt ? 'completed' : 'to_do'),
    };
    setSelectedTask(normalizedTask);
    setFormVisible(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask?.id || !user?.id) return;
    try {
      await updateTask(selectedTask.id, {
        ...taskData,
        userId: user.id,
      });
      fetchTasks(user.id);
      setFormVisible(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please check the console for details.');
    }
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedTask(null);
  };

  // Filter tasks based on completion status
  // Handle both snake_case (Supabase) and camelCase (WatermelonDB) formats
  const incompleteTasks = tasks.filter((task: any) => !(task.completed_at || task.completedAt));
  const completedTasks = tasks.filter((task: any) => !!(task.completed_at || task.completedAt));
  const displayedTasks = showCompleted ? completedTasks : incompleteTasks;

  const handleToggleComplete = async (taskId: string) => {
    try {
      if (showCompleted) {
        await uncompleteTask(taskId);
      } else {
        await completeTask(taskId);
      }
      if (user?.id) fetchTasks(user.id);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {Platform.OS === 'web' ? (
        <PageHeader
          section="Tasks"
          pageName="All Tasks"
          subtitle={showCompleted ? `${completedTasks.length} completed` : `${incompleteTasks.length} active`}
          actions={[
            {
              label: showCompleted ? 'Show Active' : 'Show Completed',
              icon: 'filter',
              onPress: () => setShowCompleted(!showCompleted),
              variant: 'secondary',
            },
            commonActions.addTask(() => setNewTaskFormVisible(true)),
          ]}
        />
      ) : (
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Tasks</Text>
            <View style={styles.headerMeta}>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {showCompleted ? `${completedTasks.length} completed` : `${incompleteTasks.length} active`}
              </Text>
              <TouchableOpacity
                style={[styles.filterButton, { borderColor: theme.border }]}
                onPress={() => setShowCompleted(!showCompleted)}
              >
                <Text style={[styles.filterButtonText, { color: theme.primary }]}>
                  {showCompleted ? 'Show Active' : 'Show Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setNewTaskFormVisible(true)}
          >
            <Text style={styles.addButtonText}>+ New Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedTasks}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => handleEditTask(item)}
              onComplete={() => handleToggleComplete(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {showCompleted ? 'No completed tasks' : 'No tasks yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                {showCompleted ? 'Complete some tasks to see them here' : 'Add a task to get started'}
              </Text>
            </View>
          }
        />
      )}

      <TaskForm
        visible={newTaskFormVisible}
        onClose={() => setNewTaskFormVisible(false)}
        onSubmit={handleCreateTask}
        initialData={null}
        projects={projects}
        labels={labels}
      />

      <TaskForm
        visible={formVisible}
        onClose={handleCloseForm}
        onSubmit={handleUpdateTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 13 : 16,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
    fontWeight: '600',
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
    fontSize: Platform.OS === 'web' ? 14 : 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
  },
});
