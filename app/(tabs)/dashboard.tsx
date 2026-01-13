import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { useLabelStore } from '@/store/labelStore';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import ProjectForm from '@/components/ProjectForm';
import { useTheme } from '@/components/useTheme';
import { useThemeStore } from '@/store/themeStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

const STATUS_LANES: { key: TaskStatus; label: string }[] = [
  { key: 'to_do', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// Fixed lane colors - Light mode HSL(225, 2%, 95%→70%), Dark mode HSL(225, 2%, 5%→30%)
const LIGHT_LANE_COLORS = [
  { background: 'hsl(225, 2%, 95%)', stroke: 'hsl(225, 2%, 85%)' },
  { background: 'hsl(225, 2%, 90%)', stroke: 'hsl(225, 2%, 80%)' },
  { background: 'hsl(225, 2%, 85%)', stroke: 'hsl(225, 2%, 75%)' },
  { background: 'hsl(225, 2%, 80%)', stroke: 'hsl(225, 2%, 70%)' },
  { background: 'hsl(225, 2%, 75%)', stroke: 'hsl(225, 2%, 65%)' },
  { background: 'hsl(225, 2%, 70%)', stroke: 'hsl(225, 2%, 60%)' },
];

const DARK_LANE_COLORS = [
  { background: 'hsl(225, 2%, 5%)', stroke: 'hsl(225, 2%, 15%)' },
  { background: 'hsl(225, 2%, 10%)', stroke: 'hsl(225, 2%, 20%)' },
  { background: 'hsl(225, 2%, 15%)', stroke: 'hsl(225, 2%, 25%)' },
  { background: 'hsl(225, 2%, 20%)', stroke: 'hsl(225, 2%, 30%)' },
  { background: 'hsl(225, 2%, 25%)', stroke: 'hsl(225, 2%, 35%)' },
  { background: 'hsl(225, 2%, 30%)', stroke: 'hsl(225, 2%, 40%)' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tasks, loading: tasksLoading, fetchTasks, createTask, updateTask } = useTaskStore();
  const { projects, loading: projectsLoading, fetchProjects, createProject } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const theme = useTheme();
  const { resolvedTheme } = useThemeStore();
  // Detect dark mode by checking if background is dark (lightness < 50%)
  const isDark = theme.background === '#0f0f11' || resolvedTheme === 'dark';
  
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: any[] }>({});
  
  // Mini calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchProjects(user.id);
      fetchLabels(user.id);
    }
  }, [user?.id]);

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

  // Get tasks for a specific date (for mini calendar)
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task: any) => {
      const dueDate = task.due_date || task.dueDate;
      if (!dueDate) return false;
      const taskDate = format(new Date(dueDate), 'yyyy-MM-dd');
      return taskDate === dateStr && !(task.completed_at || task.completedAt);
    });
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
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

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

  const handleCreateProject = async (projectData: any) => {
    if (!user?.id) return;
    try {
      await createProject({
        ...projectData,
        userId: user.id,
      });
      setProjectFormVisible(false);
      fetchProjects(user.id);
    } catch (error) {
      console.error('Error creating project:', error);
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
      if (!projectTasks[projectId] && user?.id) {
        try {
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
    return userId === user?.id ? user.email || 'You' : userId;
  };

  // Mini Calendar Component
  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <View style={[styles.miniCalendar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.miniCalendarHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setCalendarDate(subMonths(calendarDate, 1))}>
            <FontAwesome name="angle-left" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.miniCalendarTitle, { color: theme.text }]}>
            {format(calendarDate, 'MMM yyyy')}
          </Text>
          <TouchableOpacity onPress={() => setCalendarDate(addMonths(calendarDate, 1))}>
            <FontAwesome name="angle-right" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.miniCalendarWeekDays}>
          {weekDays.map((day, idx) => (
            <Text key={idx} style={[styles.miniCalendarWeekDay, { color: theme.textTertiary }]}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.miniCalendarGrid}>
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, calendarDate);
            const isToday = isSameDay(day, new Date());
            const dayTasks = getTasksForDate(day);
            const hasTasks = dayTasks.length > 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.miniCalendarDay,
                  !isCurrentMonth && { opacity: 0.3 },
                  isToday && { backgroundColor: theme.primary + '20', borderRadius: 4 },
                ]}
                onPress={() => router.push('/(tabs)/calendar')}
              >
                <Text
                  style={[
                    styles.miniCalendarDayText,
                    { color: isCurrentMonth ? theme.text : theme.textTertiary },
                    isToday && { color: theme.primary, fontWeight: '700' },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {hasTasks && (
                  <View style={[styles.miniCalendarDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity 
          style={[styles.miniCalendarLink, { borderTopColor: theme.border }]}
          onPress={() => router.push('/(tabs)/calendar')}
        >
          <Text style={[styles.miniCalendarLinkText, { color: theme.primary }]}>View Full Calendar</Text>
          <FontAwesome name="angle-right" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Projects and Mini Calendar Row */}
      <View style={styles.topSection}>
        {/* Projects List Section */}
        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Projects</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => setProjectFormVisible(true)}
              >
                <FontAwesome name="plus" size={12} color="#ffffff" />
                <Text style={styles.actionButtonText}>New Project</Text>
              </TouchableOpacity>
            </View>
          </View>

          {projectsLoading ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Loading projects...</Text>
          ) : projects.length > 0 ? (
            <ScrollView 
              style={[styles.projectsListContainer, { borderColor: theme.border }]} 
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
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
                            {formatDate(project.created_at || project.createdAt)}
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
                      <View style={[styles.projectTasksContainer, { borderTopColor: theme.border }]}>
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
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No projects yet</Text>
              <TouchableOpacity
                style={[styles.emptyButton, { borderColor: theme.primary }]}
                onPress={() => setProjectFormVisible(true)}
              >
                <Text style={[styles.emptyButtonText, { color: theme.primary }]}>Create your first project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Mini Calendar */}
        {Platform.OS === 'web' && renderMiniCalendar()}
      </View>

      {/* Task Lanes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => setNewTaskFormVisible(true)}
            >
              <FontAwesome name="plus" size={12} color="#ffffff" />
              <Text style={styles.actionButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
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
            {STATUS_LANES.map((lane, index) => {
              const laneTasks = tasksByStatus[lane.key] || [];
              const laneColors = isDark ? DARK_LANE_COLORS[index] : LIGHT_LANE_COLORS[index];
              
              return (
                <View 
                  key={lane.key} 
                  style={[
                    styles.lane, 
                    { 
                      backgroundColor: laneColors.background,
                      borderColor: laneColors.stroke,
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
        )}
      </View>

      {/* Edit Task Form */}
      <TaskForm
        visible={taskFormVisible}
        onClose={handleCloseTaskForm}
        onSubmit={handleUpdateTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />

      {/* New Task Form */}
      <TaskForm
        visible={newTaskFormVisible}
        onClose={() => setNewTaskFormVisible(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        labels={labels}
      />

      {/* Project Form */}
      <ProjectForm
        visible={projectFormVisible}
        onClose={() => setProjectFormVisible(false)}
        onSubmit={handleCreateProject}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingTop: 24,
    gap: 24,
    alignItems: Platform.OS === 'web' ? 'flex-start' : undefined,
  },
  projectsSection: {
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 0 : 24,
    maxHeight: Platform.OS === 'web' ? 420 : undefined,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: '700',
    letterSpacing: -0.015,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  // Mini Calendar Styles
  miniCalendar: {
    width: Platform.OS === 'web' ? 280 : '100%',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  miniCalendarTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  miniCalendarWeekDays: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  miniCalendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  miniCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  miniCalendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniCalendarDayText: {
    fontSize: 12,
  },
  miniCalendarDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  miniCalendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  miniCalendarLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Project styles
  projectsListContainer: {
    flex: 1,
    maxHeight: Platform.OS === 'web' ? 360 : undefined,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectsList: {
    gap: 12,
    padding: 12,
  },
  projectItem: {
    borderWidth: 1,
    borderRadius: 10,
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
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  openButtonText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  projectTasksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
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
    letterSpacing: 0.5,
  },
  projectTaskRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableCellText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 14 : 14,
  },
  // Lane styles
  lanesContainer: {
    flexGrow: 0,
  },
  lanesContent: {
    paddingRight: Platform.OS === 'web' ? 40 : 16,
  },
  lane: {
    width: Platform.OS === 'web' ? 280 : 260,
    marginRight: 16,
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: Platform.OS === 'web' ? '60vh' : 500,
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
    paddingHorizontal: 10,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
