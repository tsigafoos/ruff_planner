import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { useLabelStore } from '@/store/labelStore';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { useTheme } from '@/components/useTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';

type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

const STATUS_LANES: { key: TaskStatus; label: string }[] = [
  { key: 'to_do', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tasks, loading: tasksLoading, fetchTasks, updateTask } = useTaskStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const theme = useTheme();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: any[] }>({});

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchProjects(user.id);
      fetchLabels(user.id);
    }
  }, [user?.id]);

  // Derive task status (for now, completed_at = completed, otherwise to_do)
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
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCloseTaskForm = () => {
    setTaskFormVisible(false);
    setSelectedTask(null);
  };

  const toggleProjectExpanded = async (projectId: string) => {
    if (expandedProjects.has(projectId)) {
      setExpandedProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    } else {
      setExpandedProjects(prev => new Set(prev).add(projectId));
      // Fetch tasks for this project if not already loaded
      if (!projectTasks[projectId] && user?.id) {
        try {
          // We'll need to get tasks by project - for now use filtered tasks
          const projectTasksList = tasks.filter((t: any) => (t.project_id || t.projectId) === projectId);
          setProjectTasks(prev => ({ ...prev, [projectId]: projectTasksList }));
        } catch (error) {
          console.error('Error fetching project tasks:', error);
        }
      }
    }
  };

  const formatDate = (dateString: string | Date | number | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const getUserEmail = (userId: string) => {
    // For now, just show user ID. In the future, could fetch user details
    return userId === user?.id ? user.email || 'You' : userId;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Projects List Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Projects</Text>
        </View>

        {projectsLoading ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Loading projects...</Text>
        ) : projects.length > 0 ? (
          <View style={styles.projectsList}>
            {projects.map((project: any) => {
              const isExpanded = expandedProjects.has(project.id);
              const projectTasksList = projectTasks[project.id] || tasks.filter((t: any) => (t.project_id || t.projectId) === project.id);
              const projectTeam = project.team_roles ? (Array.isArray(project.team_roles) ? project.team_roles : []) : [];
              const teamDisplay = projectTeam.length > 0 ? `${projectTeam.length} member${projectTeam.length !== 1 ? 's' : ''}` : 'No team';

              return (
                <View key={project.id} style={[styles.projectItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.projectRow}>
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
                      <View style={styles.projectMeta}>
                        <Text style={[styles.projectMetaText, { color: theme.textSecondary }]}>
                          Initiated: {formatDate(project.created_at || project.createdAt)}
                        </Text>
                        <Text style={[styles.projectMetaText, { color: theme.textSecondary }]}>•</Text>
                        <Text style={[styles.projectMetaText, { color: theme.textSecondary }]}>{teamDisplay}</Text>
                      </View>
                    </View>
                    <View style={styles.projectActions}>
                      <TouchableOpacity
                        style={[styles.expandButton, { backgroundColor: theme.surfaceSecondary }]}
                        onPress={() => toggleProjectExpanded(project.id)}
                      >
                        <FontAwesome 
                          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                          size={14} 
                          color={theme.textSecondary} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.openButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push(`/project/${project.id}`)}
                      >
                        <Text style={[styles.openButtonText, { color: '#FFFFFF' }]}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.projectTasksContainer}>
                      {projectTasksList.length > 0 ? (
                        <View style={styles.projectTasksTable}>
                          <View style={[styles.projectTasksHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>Name</Text>
                            <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>Owner</Text>
                            <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>Status</Text>
                            <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>Due Date</Text>
                          </View>
                          {projectTasksList.map((task: any) => {
                            const taskStatus = getTaskStatus(task);
                            const dueDate = task.due_date || task.dueDate;
                            const ownerId = task.user_id || task.userId;
                            return (
                              <TouchableOpacity
                                key={task.id}
                                style={[styles.projectTaskRow, { borderBottomColor: theme.border }]}
                                onPress={() => handleEditTask(task)}
                              >
                                <Text style={[styles.tableCellText, { color: theme.text }]} numberOfLines={1}>
                                  {task.title}
                                </Text>
                                <Text style={[styles.tableCellText, { color: theme.textSecondary }]} numberOfLines={1}>
                                  {getUserEmail(ownerId)}
                                </Text>
                                <Text style={[styles.tableCellText, { color: theme.textSecondary }]}>
                                  {STATUS_LANES.find(l => l.key === taskStatus)?.label || 'To Do'}
                                </Text>
                                <Text style={[styles.tableCellText, { color: theme.textSecondary }]}>
                                  {dueDate ? formatDate(dueDate) : '-'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks in this project</Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No projects yet</Text>
        )}
      </View>

      {/* Task Lanes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
        </View>

        {tasksLoading ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Loading tasks...</Text>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.lanesContainer}
            contentContainerStyle={styles.lanesContent}
          >
            {STATUS_LANES.map((lane) => {
              const laneTasks = tasksByStatus[lane.key] || [];
              return (
                <View key={lane.key} style={[styles.lane, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.laneHeader, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.laneTitle, { color: theme.text }]}>{lane.label}</Text>
                    <View style={[styles.laneCount, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.laneCountText, { color: theme.textSecondary }]}>{laneTasks.length}</Text>
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
                        <Text style={[styles.laneEmptyText, { color: theme.textTertiary }]}>No tasks</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <TaskForm
        visible={taskFormVisible}
        onClose={handleCloseTaskForm}
        onSubmit={handleUpdateTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingTop: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 24,
    fontWeight: '700',
  },
  projectsList: {
    gap: 12,
  },
  projectItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
    marginRight: 16,
  },
  projectName: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectMetaText: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  openButtonText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  projectTasksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  projectTasksTable: {
    width: '100%',
  },
  projectTasksHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 12 : 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectTaskRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableCellText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  lanesContainer: {
    flexGrow: 0,
  },
  lanesContent: {
    paddingRight: Platform.OS === 'web' ? 24 : 16,
  },
  lane: {
    width: Platform.OS === 'web' ? 300 : 280,
    marginRight: 16,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: Platform.OS === 'web' ? '70vh' : 600,
  },
  laneHeader: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  laneTitle: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
  },
  laneCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  laneCountText: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
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
    padding: 24,
    alignItems: 'center',
  },
  laneEmptyText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  emptyText: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
