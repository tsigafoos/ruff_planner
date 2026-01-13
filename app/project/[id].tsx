import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
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
import { useThemeStore } from '@/store/themeStore';
import ResourcesView from '@/components/resources/ResourcesView';
import TaskCard from '@/components/TaskCard';

type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

const STATUS_LANES: { key: TaskStatus; label: string }[] = [
  { key: 'to_do', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// Grayscale backgrounds for lanes
const getLaneBackground = (index: number, isDark: boolean) => {
  if (isDark) {
    // Dark mode: 95% down to 70% (To Do=95, In Progress=90, Blocked=85, On Hold=80, Completed=75, Cancelled=70)
    const lightness = 95 - (index * 5);
    return `hsl(0, 0%, ${lightness}%)`;
  } else {
    // Light mode: 75% down to 50% (shifted down 10% from previous 85%→60%)
    const lightness = 75 - (index * 5);
    return `hsl(0, 0%, ${lightness}%)`;
  }
};

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
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const project = projects.find((p: any) => p.id === id);

  useEffect(() => {
    if (user?.id && id) {
      fetchProjects(user.id);
      fetchLabels(user.id);
      fetchTasksByProject(id, user.id);
    }
  }, [user?.id, id]);

  // Derive task status
  const getTaskStatus = (task: any): TaskStatus => {
    if (task.completed_at || task.completedAt) return 'completed';
    return task.status || 'to_do';
  };

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = getTaskStatus(task);
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, any[]>);

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
      setProjectFormVisible(false);
      await fetchProjects(user.id);
    } catch (error) {
      console.error('Error updating project:', error);
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

  // Task Lanes Component
  const renderTaskLanes = () => (
    <View style={[styles.lanesSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.lanesSectionHeader}>
        <Text style={[styles.lanesSectionTitle, { color: theme.text }]}>Task Board</Text>
        <TouchableOpacity
          style={[styles.addTaskButton, { backgroundColor: theme.primary }]}
          onPress={() => setNewTaskFormVisible(true)}
        >
          <FontAwesome name="plus" size={12} color="#ffffff" />
          <Text style={styles.addTaskButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.lanesContainer}
        contentContainerStyle={styles.lanesContent}
      >
        {STATUS_LANES.map((lane, index) => {
          const laneTasks = tasksByStatus[lane.key] || [];
          const laneBackground = getLaneBackground(index, isDark);
          
          return (
            <View 
              key={lane.key} 
              style={[
                styles.lane, 
                { 
                  backgroundColor: laneBackground,
                  borderColor: theme.border,
                }
              ]}
            >
              <View style={[styles.laneHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.laneTitle, { color: isDark ? theme.text : '#1a1a1a' }]}>{lane.label}</Text>
                <View style={[styles.laneCount, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                  <Text style={[styles.laneCountText, { color: isDark ? theme.text : '#1a1a1a' }]}>{laneTasks.length}</Text>
                </View>
              </View>
              <ScrollView 
                style={styles.laneContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {laneTasks.length > 0 ? (
                  laneTasks.map((task: any) => (
                    <View key={task.id} style={styles.laneTaskWrapper}>
                      <TaskCard
                        task={task}
                        onPress={() => handleEditTask(task)}
                      />
                    </View>
                  ))
                ) : (
                  <View style={styles.laneEmpty}>
                    <Text style={[styles.laneEmptyText, { color: isDark ? theme.textTertiary : '#717171' }]}>No tasks</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surfaceSecondary }]}>
          <FontAwesome name="arrow-left" size={16} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.projectIcon, { backgroundColor: (project.color || theme.primary) + '15' }]}>
            <FontAwesome
              name={(project.icon || 'folder') as any}
              size={20}
              color={project.color || theme.primary}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>{project.name}</Text>
            <View style={styles.headerMeta}>
              <View style={[styles.projectTypeBadge, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.projectTypeText, { color: theme.primary }]}>
                  {project.project_type === 'agile' ? 'Agile' : 'Waterfall'}
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {incompleteTasks.length} active task{incompleteTasks.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setNewTaskFormVisible(true)}
            >
              <FontAwesome name="plus" size={14} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Add Task</Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setResourcesVisible(true)}
            >
              <FontAwesome name="folder-open" size={14} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Resources</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary }]}
            onPress={() => setProjectFormVisible(true)}
          >
            <FontAwesome name="edit" size={14} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Edit Project</Text>
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
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={true}>
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
          
          {/* Task Lanes - Below Dashboard */}
          {renderTaskLanes()}
        </ScrollView>
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
  mainContent: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 22 : 24,
    fontWeight: '700',
    letterSpacing: -0.015,
    marginBottom: 6,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
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
  // Task Lanes Styles
  lanesSection: {
    margin: Platform.OS === 'web' ? 24 : 16,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lanesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  lanesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  lanesContainer: {
    flexGrow: 0,
  },
  lanesContent: {
    padding: 16,
    gap: 12,
  },
  lane: {
    width: Platform.OS === 'web' ? 260 : 240,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: Platform.OS === 'web' ? 400 : 350,
  },
  laneHeader: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  laneTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  laneCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  laneCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  laneContent: {
    flex: 1,
    padding: 8,
  },
  laneTaskWrapper: {
    marginBottom: 8,
  },
  laneEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  laneEmptyText: {
    fontSize: 13,
  },
});
