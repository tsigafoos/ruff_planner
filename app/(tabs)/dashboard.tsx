import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProjectForm from '@/components/ProjectForm';
import TaskForm from '@/components/TaskForm';
import { useTheme } from '@/components/useTheme';
import { StatusLane, DraggableTaskCard, MiniCalendar, PageWrapper } from '@/components/ui';
import { DynamicDashboard } from '@/components/dashboard';
import DashboardCreationModal from '@/components/dashboard/DashboardCreationModal';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { useLabelStore } from '@/store/labelStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useThemeStore } from '@/store/themeStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import { TemplateTask } from '@/lib/projectTemplates';
type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

type InsightsTab = 'overview' | string;

const STATUS_LANES: { key: TaskStatus; label: string }[] = [
  { key: 'to_do', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { user } = useAuthStore();
  const { tasks, loading: tasksLoading, fetchTasks, createTask, updateTask } = useTaskStore();
  const { projects, loading: projectsLoading, fetchProjects, createProject } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const theme = useTheme();
  const { resolvedTheme } = useThemeStore();
  // Detect dark mode by checking if background is dark (lightness < 50%)
  const isDark = resolvedTheme === 'dark';
  
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: any[] }>({});
  const [insightsTab, setInsightsTab] = useState<InsightsTab>('overview');
  const [creationModalVisible, setCreationModalVisible] = useState(false);

  const dashboards = useDashboardStore((s) => s.dashboards);
  const setEditMode = useDashboardStore((s) => s.setEditMode);
  const saveDashboard = useDashboardStore((s) => s.saveDashboard);
  const addRow = useDashboardStore((s) => s.addRow);
  const editMode = useDashboardStore((s) => s.editMode);
  const createSignal = useDashboardStore((s) => s.insightsCreateDashboardSignal);
  const dashboardsLoading = useDashboardStore((s) => s.loading);

  /** Custom dashboards only (global scope), in tab order — after Overview */
  const globalDashboards = useMemo(() => {
    const list = dashboards.filter((d) => d.scope === 'global');
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dashboards]);

  const handledCreateRef = useRef(0);
  
  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<TaskStatus | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const laneRefs = useRef<{ [key: string]: View | null }>({});

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchProjects(user.id);
      fetchLabels(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    // Call via getState so this effect does not depend on `loadDashboards` identity (avoids re-run loops).
    useDashboardStore.getState().loadDashboards(user.id);
  }, [user?.id]);

  useEffect(() => {
    const t = params.tab;
    if (t === undefined || t === null) return;
    const tabStr = Array.isArray(t) ? t[0] : t;
    if (tabStr === 'overview') setInsightsTab('overview');
    else if (tabStr) setInsightsTab(tabStr);
  }, [params.tab]);

  useEffect(() => {
    if (createSignal > handledCreateRef.current) {
      handledCreateRef.current = createSignal;
      setCreationModalVisible(true);
    }
  }, [createSignal]);

  /** Sync store active layout to selected tab — only depend on `insightsTab` (stable). */
  useEffect(() => {
    if (insightsTab === 'overview') {
      const { editMode: em } = useDashboardStore.getState();
      if (em) useDashboardStore.getState().setEditMode(false);
      return;
    }
    useDashboardStore.getState().setActiveDashboard(insightsTab);
  }, [insightsTab]);

  /** If the tab id is not a global dashboard, fall back to Overview (e.g. stale URL or race before load). */
  useEffect(() => {
    if (insightsTab === 'overview') return;
    if (dashboardsLoading) return;
    const globals = dashboards.filter((d) => d.scope === 'global');
    if (globals.length === 0) {
      setInsightsTab('overview');
      return;
    }
    if (!globals.some((d) => d.id === insightsTab)) {
      setInsightsTab('overview');
    }
  }, [dashboards, dashboardsLoading, insightsTab]);

  /** After load, store leaves no active custom dash (Overview default); sync when a custom tab is selected. */
  useEffect(() => {
    if (dashboardsLoading || insightsTab === 'overview') return;
    const globals = dashboards.filter((d) => d.scope === 'global');
    if (!globals.some((d) => d.id === insightsTab)) return;
    useDashboardStore.getState().setActiveDashboard(insightsTab);
  }, [dashboardsLoading, insightsTab, dashboards]);

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

  // Handler for creating project from template with tasks
  const handleCreateProjectWithTasks = async (
    projectData: any, 
    templateTasks: Array<TemplateTask & { dueDate: Date; startDate?: Date }>
  ) => {
    if (!user?.id) return;
    try {
      // Create the project first
      const newProject = await createProject({
        ...projectData,
        userId: user.id,
      });
      
      // If project was created successfully, create all the tasks
      if (newProject?.id) {
        for (const templateTask of templateTasks) {
          await createTask({
            title: templateTask.title,
            description: templateTask.description || '',
            priority: templateTask.priority,
            status: templateTask.status || 'to_do',
            dueDate: templateTask.dueDate,
            startDate: templateTask.startDate,
            phase: templateTask.phase,
            category: templateTask.category,
            projectId: newProject.id,
            userId: user.id,
          });
        }
      }
      
      setProjectFormVisible(false);
      fetchProjects(user.id);
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error creating project with tasks:', error);
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

  // Drag and drop handlers
  const handleDragStart = (taskId: string, e: any) => {
    const x = Platform.OS === 'web' ? e.clientX : e.nativeEvent.pageX;
    const y = Platform.OS === 'web' ? e.clientY : e.nativeEvent.pageY;
    dragStartPos.current = { x, y };
    setDraggedTaskId(taskId);
  };

  const handleDragMove = (e: any) => {
    if (!draggedTaskId) return;
    
    const x = Platform.OS === 'web' ? e.clientX : e.nativeEvent.pageX;
    const y = Platform.OS === 'web' ? e.clientY : e.nativeEvent.pageY;
    
    // Validate coordinates are finite numbers
    if (!isFinite(x) || !isFinite(y)) return;

    // Check which lane we're over
    if (Platform.OS === 'web') {
      try {
        const element = document.elementFromPoint(x, y);
        if (element) {
          let current: Element | null = element;
          while (current) {
            const laneKey = current.getAttribute('data-lane-key');
            if (laneKey && STATUS_LANES.some(l => l.key === laneKey)) {
              setDragOverLane(laneKey as TaskStatus);
              return;
            }
            current = current.parentElement;
          }
        }
      } catch (error) {
        console.warn('Error in elementFromPoint:', error);
      }
    } else {
      Object.keys(laneRefs.current).forEach((laneKey) => {
        const laneRef = laneRefs.current[laneKey];
        if (laneRef) {
          laneRef.measure((fx, fy, width, height, px, py) => {
            if (x >= px && x <= px + width && y >= py && y <= py + height) {
              setDragOverLane(laneKey as TaskStatus);
            }
          });
        }
      });
    }
  };

  const handleDragEnd = async () => {
    if (!draggedTaskId || !user?.id || !dragOverLane) {
      setDraggedTaskId(null);
      setDragOverLane(null);
      dragStartPos.current = null;
      return;
    }

    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task) {
      setDraggedTaskId(null);
      setDragOverLane(null);
      dragStartPos.current = null;
      return;
    }

    const currentStatus = getTaskStatus(task);
    if (currentStatus === dragOverLane) {
      setDraggedTaskId(null);
      setDragOverLane(null);
      dragStartPos.current = null;
      return;
    }

    try {
      await updateTask(draggedTaskId, {
        status: dragOverLane,
        completed: dragOverLane === 'completed',
      });
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setDraggedTaskId(null);
      setDragOverLane(null);
      dragStartPos.current = null;
    }
  };

  // Set up global mouse/touch move and end handlers for web
  useEffect(() => {
    if (Platform.OS === 'web' && draggedTaskId) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e);
      };

      const handleMouseUp = () => {
        handleDragEnd();
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedTaskId, dragOverLane, tasks, user?.id]);

  const handleSaveLayout = async () => {
    await saveDashboard();
    setEditMode(false);
  };

  const insightsChrome = (
    <View style={[styles.insightsChrome, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.insightsTabScroll}
        contentContainerStyle={styles.insightsTabRow}
      >
        <TouchableOpacity
          style={[
            styles.insightsTab,
            {
              backgroundColor: insightsTab === 'overview' ? theme.primary + '18' : theme.surfaceSecondary,
              borderColor: insightsTab === 'overview' ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setInsightsTab('overview')}
        >
          <FontAwesome
            name="th-large"
            size={12}
            color={insightsTab === 'overview' ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.insightsTabText,
              { color: insightsTab === 'overview' ? theme.primary : theme.text },
            ]}
            numberOfLines={1}
          >
            Overview
          </Text>
        </TouchableOpacity>
        {globalDashboards.map((d) => {
          const active = insightsTab === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.insightsTab,
                {
                  backgroundColor: active ? theme.primary + '18' : 'transparent',
                  borderColor: active ? theme.primary : 'transparent',
                },
              ]}
              onPress={() => setInsightsTab(d.id)}
              accessibilityLabel={d.name}
            >
              {d.emoji ? (
                <Text style={styles.insightsTabEmoji}>{d.emoji}</Text>
              ) : (
                <FontAwesome name="th-large" size={12} color={active ? theme.primary : theme.textSecondary} />
              )}
              <Text
                style={[styles.insightsTabText, { color: active ? theme.primary : theme.text }]}
                numberOfLines={1}
              >
                {d.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[
            styles.insightsTabTrailingPlus,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
          onPress={() => setCreationModalVisible(true)}
          accessibilityLabel="Create new dashboard"
          accessibilityRole="button"
        >
          <FontAwesome name="plus" size={11} color={theme.primary} />
        </TouchableOpacity>
      </ScrollView>
      {insightsTab !== 'overview' && (
        <View style={styles.insightsEditCluster}>
          {editMode ? (
            <>
              <TouchableOpacity
                style={[styles.insightsEditBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => addRow()}
              >
                <FontAwesome name="plus" size={11} color={theme.text} />
                <Text style={[styles.insightsEditBtnText, { color: theme.text }]}>Add lane</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.insightsEditBtn, { backgroundColor: theme.success, borderColor: theme.success }]}
                onPress={handleSaveLayout}
              >
                <FontAwesome name="check" size={11} color="#fff" />
                <Text style={[styles.insightsEditBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.insightsEditBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setEditMode(true)}
            >
              <FontAwesome name="pencil" size={11} color="#fff" />
              <Text style={[styles.insightsEditBtnText, { color: '#fff' }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {Platform.OS === 'web' && (
        <View style={styles.insightsActions}>
          <TouchableOpacity
            style={[styles.insightsPrimaryBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setNewTaskFormVisible(true)}
            accessibilityLabel="Add task"
          >
            <FontAwesome name="plus" size={12} color="#fff" />
            <Text style={styles.insightsPrimaryBtnText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.insightsPrimaryBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setProjectFormVisible(true)}
            accessibilityLabel="Add project"
          >
            <FontAwesome name="plus" size={12} color="#fff" />
            <Text style={styles.insightsPrimaryBtnText}>Add Project</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const overviewBody = (
    <>
      <View style={styles.topSection}>
        {/* Projects List Section */}
        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Projects</Text>
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
        {Platform.OS === 'web' && (
          <MiniCalendar 
            tasks={tasks}
            onViewFullCalendar={() => router.push('/(tabs)/calendar')}
          />
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
            showsHorizontalScrollIndicator={true}
            style={styles.lanesContainer}
            contentContainerStyle={styles.lanesContent}
          >
            {STATUS_LANES.map((lane, index) => {
              const laneTasks = tasksByStatus[lane.key] || [];
              const isDragOver = dragOverLane === lane.key;
              
              return (
                <StatusLane
                  key={lane.key}
                  laneKey={lane.key}
                  label={lane.label}
                  count={laneTasks.length}
                  isDragOver={isDragOver}
                  isDragActive={!!draggedTaskId}
                  colorIndex={index}
                  onRefReady={(ref) => {
                    laneRefs.current[lane.key] = ref;
                  }}
                  dataLaneKey={lane.key}
                >
                  {laneTasks.map((task: any) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      isDragging={draggedTaskId === task.id}
                      dragActive={!!draggedTaskId}
                      onPress={() => handleEditTask(task)}
                      onDragStart={(e) => handleDragStart(task.id, e)}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </StatusLane>
              );
            })}
          </ScrollView>
        )}
        
        {/* Cancelled Tasks Bar */}
        <View style={styles.cancelledBarContainer}>
          <TouchableOpacity
            style={[styles.cancelledBar, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={() => {
              // TODO: Implement cancelled bar expansion
            }}
          >
            <Text style={[styles.cancelledBarText, { color: theme.text }]}>
              {(tasksByStatus['cancelled']?.length || 0)} Cancelled Task{(tasksByStatus['cancelled']?.length || 0) !== 1 ? 's' : ''}
            </Text>
            <FontAwesome 
              name="chevron-down" 
              size={14} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <PageWrapper
      section="Overview"
      title="Insights"
      subtitle={`${tasks.length} tasks · ${projects.length} projects`}
      hideHeader={Platform.OS === 'web'}
      padded={false}
      belowHeader={Platform.OS === 'web' ? insightsChrome : undefined}
      actions={
        Platform.OS === 'web'
          ? []
          : [
              {
                label: 'Add Task',
                icon: 'plus',
                onPress: () => setNewTaskFormVisible(true),
                variant: 'primary',
              },
              {
                label: 'Add Project',
                icon: 'plus',
                onPress: () => setProjectFormVisible(true),
                variant: 'primary',
              },
            ]
      }
    >
      {Platform.OS !== 'web' && insightsChrome}

      {insightsTab === 'overview' ? (
        Platform.OS === 'web' ? (
          <View style={styles.overviewWebRoot}>{overviewBody}</View>
        ) : (
          <ScrollView style={styles.scrollContent}>{overviewBody}</ScrollView>
        )
      ) : user?.id ? (
        <DynamicDashboard
          userId={user.id}
          tasks={tasks}
          projects={projects}
          resources={[]}
          onTaskClick={handleEditTask}
          onProjectClick={(project) => router.push(`/project/${project.id}`)}
          showTabs={false}
          showToolbar={false}
          showCreationModal={false}
          embedded
          onRequestCreateDashboard={() => useDashboardStore.getState().requestInsightsCreateDashboard()}
        />
      ) : null}

      {user?.id ? (
        <DashboardCreationModal
          visible={creationModalVisible}
          onClose={() => setCreationModalVisible(false)}
          onCreated={(id) => setInsightsTab(id)}
          projects={projects}
          userId={user.id}
        />
      ) : null}

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
        onCreateWithTasks={handleCreateProjectWithTasks}
      />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  insightsChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    minHeight: 44,
    flexShrink: 0,
  },
  insightsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
    paddingLeft: 4,
    flexShrink: 0,
  },
  insightsPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  insightsPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  overviewWebRoot: {
    width: '100%' as any,
    alignSelf: 'stretch',
    paddingBottom: 32,
  },
  insightsTabScroll: {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  insightsTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingRight: 8,
  },
  insightsTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 220,
  },
  /** After custom dashboard tabs — opens create-dashboard flow */
  insightsTabTrailingPlus: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 32,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 2,
  },
  insightsTabEmoji: {
    fontSize: 13,
  },
  insightsTabText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  insightsEditCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingLeft: 4,
    flexShrink: 0,
  },
  insightsEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  insightsEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  topSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingLeft: Platform.OS === 'web' ? 28 : 14,
    paddingRight: Platform.OS === 'web' ? 28 : 14,
    paddingTop: Platform.OS === 'web' ? 16 : 20,
    maxWidth: Platform.OS === 'web' ? 1300 : '100%',
    gap: Platform.OS === 'web' ? 16 : 20,
    alignItems: Platform.OS === 'web' ? 'flex-start' : undefined,
  },
  projectsSection: {
    flex: 1,
    marginRight: Platform.OS === 'web' ? 16 : 0,
    marginBottom: Platform.OS === 'web' ? 0 : 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: Platform.OS === 'web' ? 28 : 14,
    maxWidth: Platform.OS === 'web' ? 1350 : '100%',
    paddingTop: Platform.OS === 'web' ? 16 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 22,
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  // Project styles
  projectsListContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectsList: {
    gap: 8,
    padding: 9,
  },
  projectItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: Platform.OS === 'web' ? 15 : 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectMetaText: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  openButtonText: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
    fontWeight: '600',
  },
  projectTasksContainer: {
    marginTop: 12,
    paddingTop: 12,
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
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  tableCellText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  // Lane styles (layout containers only - component styles are in StatusLane)
  lanesContainer: {
    flexGrow: 0,
  },
  lanesContent: {
    paddingRight: Platform.OS === 'web' ? 28 : 14,
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
  cancelledBarContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 28 : 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  cancelledBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  cancelledBarText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
