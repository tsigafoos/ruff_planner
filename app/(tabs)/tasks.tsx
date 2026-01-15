import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { useProjectStore } from '@/store/projectStore';
import { useLabelStore } from '@/store/labelStore';
import { PageWrapper } from '@/components/ui';

export default function TasksScreen() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, createTask, updateTask, completeTask, uncompleteTask, deleteTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

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
    }
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedTask(null);
  };

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

  // Filter tasks based on completion status
  const incompleteTasks = tasks.filter((task: any) => !(task.completed_at || task.completedAt));
  const completedTasks = tasks.filter((task: any) => !!(task.completed_at || task.completedAt));
  const displayedTasks = showCompleted ? completedTasks : incompleteTasks;

  return (
    <PageWrapper
      section="Tasks"
      title="All Tasks"
      subtitle={showCompleted ? `${completedTasks.length} completed` : `${incompleteTasks.length} active`}
      loading={loading}
      isEmpty={displayedTasks.length === 0}
      emptyState={{
        icon: 'check-square-o',
        title: showCompleted ? 'No completed tasks' : 'No tasks yet',
        subtitle: showCompleted ? 'Complete some tasks to see them here' : 'Add a task to get started',
      }}
      actions={[
        {
          label: showCompleted ? 'Show Active' : 'Show Completed',
          icon: 'filter',
          onPress: () => setShowCompleted(!showCompleted),
          variant: 'secondary',
        },
        {
          label: '+ New Task',
          icon: 'plus',
          onPress: () => setNewTaskFormVisible(true),
          variant: 'primary',
        },
      ]}
    >
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
      />

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
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
});
