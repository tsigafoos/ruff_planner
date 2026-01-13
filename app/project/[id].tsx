import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import QuickAdd from '@/components/QuickAdd';
import TaskForm from '@/components/TaskForm';
import ProjectForm from '@/components/ProjectForm';
import WaterfallDashboard from '@/components/dashboards/WaterfallDashboard';
import AgileDashboard from '@/components/dashboards/AgileDashboard';
import { useLabelStore } from '@/store/labelStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import WebLayout from '@/components/layout/WebLayout';
import { useTheme } from '@/components/useTheme';
import ResourcesView from '@/components/resources/ResourcesView';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasksByProject, createTask, updateTask, completeTask, deleteTask } = useTaskStore();
  const { projects, fetchProjects, updateProject } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [resourcesVisible, setResourcesVisible] = useState(false);
  const theme = useTheme();

  const project = projects.find((p: any) => p.id === id);

  useEffect(() => {
    if (user?.id && id) {
      fetchProjects(user.id);
      fetchLabels(user.id);
      fetchTasksByProject(id, user.id);
    }
  }, [user?.id, id]);

  const handleAddTaskQuick = async (title: string) => {
    if (!user?.id || !id) return;
    try {
      await createTask({
        title,
        userId: user.id,
        projectId: id,
        priority: 1,
        labelIds: [],
      });
      fetchTasksByProject(id, user.id);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddTask = async (taskData: any) => {
    if (!user?.id || !id) return;
    try {
      await createTask({
        ...taskData,
        userId: user.id,
        projectId: id,
      });
      setNewTaskFormVisible(false);
      fetchTasksByProject(id, user.id);
    } catch (error) {
      console.error('Error creating task:', error);
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
    setTaskFormVisible(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask?.id || !user?.id) return;
    try {
      await updateTask(selectedTask.id, {
        ...taskData,
        userId: user.id,
      });
      setTaskFormVisible(false);
      setSelectedTask(null);
      if (id) fetchTasksByProject(id, user.id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCloseTaskForm = () => {
    setTaskFormVisible(false);
    setSelectedTask(null);
  };

  const handleProjectUpdate = async (updates: any) => {
    if (!id || !user?.id) return;
    try {
      console.log('Updating project with:', updates);
      await updateProject(id, updates);
      // Close form first, then refresh
      setProjectFormVisible(false);
      await fetchProjects(user.id);
    } catch (error) {
      console.error('Error updating project:', error);
      // Don't re-throw - let form handle error display
    }
  };

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Project not found</Text>
      </View>
    );
  }

  const isAgile = project.project_type === 'agile';
  const incompleteTasks = tasks.filter((task: any) => !(task.completed_at || task.completedAt));

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={Platform.OS === 'web' ? 16 : 20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.projectIcon, { backgroundColor: (project.color || theme.accent) + '20' }]}>
            <FontAwesome
              name={(project.icon || 'folder') as any}
              size={Platform.OS === 'web' ? 20 : 24}
              color={project.color || theme.accent}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>{project.name}</Text>
            <View style={styles.headerMeta}>
              <Text style={[styles.projectType, { color: theme.primary }]}>
                {project.project_type === 'agile' ? 'Agile' : 'Waterfall'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>• {incompleteTasks.length} active tasks</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
              onPress={() => setNewTaskFormVisible(true)}
            >
              <FontAwesome name="plus" size={Platform.OS === 'web' ? 14 : 18} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>Add Task</Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
              onPress={() => setResourcesVisible(true)}
            >
              <FontAwesome name="folder-open" size={Platform.OS === 'web' ? 14 : 18} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>Resource</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
            onPress={() => setProjectFormVisible(true)}
          >
            <FontAwesome name="edit" size={Platform.OS === 'web' ? 14 : 18} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resources View or Dashboard */}
      {resourcesVisible ? (
        <View style={styles.resourcesContainer}>
          <ResourcesView
            resources={Array.isArray(project.resources) ? project.resources : []}
            onSave={async (resources) => {
              await handleProjectUpdate({ resources });
            }}
            onBack={() => setResourcesVisible(false)}
          />
        </View>
      ) : (
        <>
          {isAgile ? (
            <AgileDashboard
              project={project}
              tasks={tasks}
              onProjectUpdate={handleProjectUpdate}
            />
          ) : (
            <WaterfallDashboard
              project={project}
              tasks={tasks}
              onProjectUpdate={handleProjectUpdate}
              onAddTask={() => setNewTaskFormVisible(true)}
              onTeamClick={() => {/* TODO: Navigate to team view */}}
              onToolsClick={() => {/* TODO: Navigate to tools view */}}
              onTaskClick={handleEditTask}
            />
          )}
        </>
      )}

      {Platform.OS !== 'web' && (
        <QuickAdd onAdd={handleAddTaskQuick} />
      )}

      <TaskForm
        visible={newTaskFormVisible}
        onClose={() => setNewTaskFormVisible(false)}
        onSubmit={handleAddTask}
        projects={projects}
        labels={labels}
      />

      <TaskForm
        visible={taskFormVisible}
        onClose={handleCloseTaskForm}
        onSubmit={handleUpdateTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => setProjectFormVisible(false)}
        onSubmit={handleProjectUpdate}
        initialData={project}
      />
    </View>
  );

  // Wrap with WebLayout on web
  if (Platform.OS === 'web') {
    return <WebLayout>{screenContent}</WebLayout>;
  }

  return screenContent;
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
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectIcon: {
    width: Platform.OS === 'web' ? 40 : 48,
    height: Platform.OS === 'web' ? 40 : 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectType: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  resourcesContainer: {
    flex: 1,
    padding: Platform.OS === 'web' ? 24 : 16,
  },
});
