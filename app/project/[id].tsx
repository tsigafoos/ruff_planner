import AgileDashboard from '@/components/dashboards/AgileDashboard';
import MaintenanceDashboard from '@/components/dashboards/MaintenanceDashboard';
import WaterfallDashboard from '@/components/dashboards/WaterfallDashboard';
import WebLayout from '@/components/layout/WebLayout';
import ProjectForm from '@/components/ProjectForm';
import QuickAdd from '@/components/QuickAdd';
import ResourcesView from '@/components/resources/ResourcesView';
import ShareProjectModal from '@/components/ShareProjectModal';
import TaskForm from '@/components/TaskForm';
import TaskCSVImportModal from '@/components/TaskCSVImportModal';
import { DependencyCanvas } from '@/components/visualization';
import { useTheme } from '@/components/useTheme';
import { StatusLane, DraggableTaskCard } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useLabelStore } from '@/store/labelStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

type ProjectView = 'dashboard' | 'dependencies' | 'resources';

type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

const STATUS_LANES: { key: TaskStatus; label: string }[] = [
  { key: 'to_do', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, fetchTasksByProject, createTask, updateTask, updateTaskPhase, completeTask, deleteTask } = useTaskStore();
  const { projects, fetchProjects, updateProject, deleteProject } = useProjectStore();
  const { labels, fetchLabels } = useLabelStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(false);
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [csvImportModalVisible, setCsvImportModalVisible] = useState(false);
  const [currentView, setCurrentView] = useState<ProjectView>('dashboard');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<TaskStatus | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [cancelledExpanded, setCancelledExpanded] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const laneRefs = useRef<{ [key: string]: View | null }>({});
  const cancelledLaneRef = useRef<View | null>(null);
  const theme = useTheme();

  const project = projects.find((p: any) => p.id === id);
  const isTodoProject = project?.is_default || project?.name === 'To-Do List' || project?.name === 'To-Do';

  useEffect(() => {
    if (user?.id && id) {
      fetchProjects(user.id);
      fetchLabels(user.id);
    }
  }, [user?.id, id]);

  // Fetch tasks - all tasks for todo project, project-specific for others
  useEffect(() => {
    if (user?.id && project) {
      if (isTodoProject) {
        fetchTasks(user.id);
      } else {
        fetchTasksByProject(id, user.id);
      }
    }
  }, [user?.id, id, project, isTodoProject]);

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

  // Helper to refresh tasks based on project type
  const refreshTasks = () => {
    if (!user?.id) return;
    if (isTodoProject) {
      fetchTasks(user.id);
    } else if (id) {
      fetchTasksByProject(id, user.id);
    }
  };

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
      refreshTasks();
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
      refreshTasks();
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
      refreshTasks();
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

  const handleDeleteProject = async (projectId: string) => {
    if (!project) return;
    
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await deleteProject(projectId);
              setProjectFormVisible(false);
              router.replace('/(tabs)/projects');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.id) return;
    try {
      await deleteTask(taskId);
      refreshTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete task');
    }
  };

  // Drag and drop handlers using touch/mouse events
  const handleDragStart = (taskId: string, e: any) => {
    const x = Platform.OS === 'web' ? e.clientX : e.nativeEvent.pageX;
    const y = Platform.OS === 'web' ? e.clientY : e.nativeEvent.pageY;
    dragStartPos.current = { x, y };
    setDraggedTaskId(taskId);
    setDragPosition({ x, y });
  };

  const handleDragMove = (e: any) => {
    if (!draggedTaskId) return;
    
    const x = Platform.OS === 'web' ? e.clientX : e.nativeEvent.pageX;
    const y = Platform.OS === 'web' ? e.clientY : e.nativeEvent.pageY;
    
    // Validate coordinates are finite numbers
    if (!isFinite(x) || !isFinite(y)) return;
    
    setDragPosition({ x, y });

    // Check which lane we're over by measuring positions
    if (Platform.OS === 'web') {
      try {
        const element = document.elementFromPoint(x, y);
        if (element) {
          // Find the lane by traversing up the DOM tree
          let current: Element | null = element;
          while (current) {
            const laneKey = current.getAttribute('data-lane-key');
            if (laneKey && (STATUS_LANES.some(l => l.key === laneKey) || laneKey === 'cancelled')) {
              setDragOverLane(laneKey as TaskStatus);
              return;
            }
            current = current.parentElement;
          }
        }
      } catch (error) {
        // Silently handle elementFromPoint errors
        console.warn('Error in elementFromPoint:', error);
      }
    } else {
      // For native, check which lane ref contains the point
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
      setDragPosition(null);
      dragStartPos.current = null;
      return;
    }

    const currentStatus = getTaskStatus(tasks.find(t => t.id === draggedTaskId) || {});
    if (currentStatus === dragOverLane) {
      setDraggedTaskId(null);
      setDragOverLane(null);
      setDragPosition(null);
      dragStartPos.current = null;
      return;
    }

    try {
      await updateTask(draggedTaskId, {
        status: dragOverLane,
        completed: dragOverLane === 'completed',
      });
      refreshTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setDraggedTaskId(null);
      setDragOverLane(null);
      setDragPosition(null);
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
  }, [draggedTaskId, dragOverLane, tasks, user?.id, id]);

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Project not found</Text>
      </View>
    );
  }

  const projectType = project.project_type || project.projectType || 'waterfall';
  const isAgile = projectType === 'agile';
  const isMaintenance = projectType === 'maintenance';
  const incompleteTasks = tasks.filter((task: any) => !(task.completed_at || task.completedAt));

  // Task Lanes Component - using reusable StatusLane and DraggableTaskCard
  const renderTaskLanes = (fullScreen: boolean = false) => (
    <View style={[fullScreen ? styles.lanesSectionFullScreen : styles.lanesSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {!fullScreen && (
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
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={fullScreen ? styles.lanesContainerFullScreen : styles.lanesContainer}
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
              dataLaneKey={lane.key}
              onRefReady={(ref) => {
                laneRefs.current[lane.key] = ref;
              }}
            >
              {laneTasks.map((task: any) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggedTaskId === task.id}
                  dragActive={!!draggedTaskId}
                  onPress={() => {
                    if (!draggedTaskId) {
                      handleEditTask(task);
                    }
                  }}
                  onDragStart={(e) => handleDragStart(task.id, e)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </StatusLane>
          );
        })}
      </ScrollView>
      
      {/* Cancelled Tasks Bar */}
      <View style={styles.cancelledBarContainer}>
        <TouchableOpacity
          style={[styles.cancelledBar, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
          onPress={() => setCancelledExpanded(!cancelledExpanded)}
        >
          <Text style={[styles.cancelledBarText, { color: theme.text }]}>
            {(tasksByStatus['cancelled']?.length || 0)} Cancelled Task{(tasksByStatus['cancelled']?.length || 0) !== 1 ? 's' : ''}
          </Text>
          <FontAwesome 
            name={cancelledExpanded ? "chevron-up" : "chevron-down"} 
            size={14} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        {cancelledExpanded && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.cancelledTasksContainer}
            contentContainerStyle={styles.cancelledTasksContent}
          >
            {(tasksByStatus['cancelled'] || []).map((task: any) => (
              <View key={task.id} style={styles.cancelledTaskWrapper}>
                <DraggableTaskCard
                  task={task}
                  isDragging={draggedTaskId === task.id}
                  dragActive={!!draggedTaskId}
                  onPress={() => {
                    if (!draggedTaskId) {
                      handleEditTask(task);
                    }
                  }}
                  onDragStart={(e) => handleDragStart(task.id, e)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  // Mobile-specific layout
  const renderMobileLayout = () => (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Project Info Sheet */}
      <View style={[styles.mobileProjectSheet, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.mobileProjectHeader}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Back button pressed');
              router.back();
            }} 
            style={[styles.mobileBackButton, { backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border }]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="angle-left" size={18} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.mobileProjectHeaderContent}>
            <View style={[styles.projectIcon, { backgroundColor: (project.color || theme.primary) + '12' }]}>
              <FontAwesome
                name={(project.icon || 'folder-o') as any}
                size={20}
                color={project.color || theme.primary}
              />
            </View>
            <View style={styles.mobileProjectInfo}>
              <Text style={[styles.mobileProjectTitle, { color: theme.text }]}>{project.name}</Text>
              <View style={styles.mobileProjectMeta}>
                <View style={[
                  styles.projectTypeBadge, 
                  { 
                    backgroundColor: isMaintenance ? '#FEF3C7' : theme.primary + '15' 
                  }
                ]}>
                  <Text style={[
                    styles.projectTypeText, 
                    { color: isMaintenance ? '#F59E0B' : theme.primary }
                  ]}>
                    {isMaintenance ? 'Maintenance' : isAgile ? 'Agile' : 'Waterfall'}
                  </Text>
                </View>
                <Text style={[styles.mobileProjectSubtitle, { color: theme.textSecondary }]}>
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.mobileEditButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              console.log('Edit button pressed');
              setProjectFormVisible(true);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="pencil" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.mobileTasksSection}>
        <View style={styles.mobileTasksHeader}>
          <Text style={[styles.mobileTasksTitle, { color: theme.text }]}>Tasks</Text>
          <TouchableOpacity
            style={[styles.mobileAddTaskButton, { backgroundColor: theme.primary }]}
            onPress={() => setNewTaskFormVisible(true)}
          >
            <FontAwesome name="plus" size={14} color="#ffffff" />
            <Text style={styles.mobileAddTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          showsVerticalScrollIndicator={true}
          style={styles.mobileTasksScroll}
          contentContainerStyle={styles.mobileTasksContent}
        >
          {tasks.map((task: any) => {
            const status = getTaskStatus(task);
            const statusColors: Record<TaskStatus, { bg: string; border: string; text: string }> = {
              'to_do': { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' },
              'in_progress': { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' },
              'blocked': { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
              'on_hold': { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
              'completed': { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
              'cancelled': { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
            };
            const colors = statusColors[status] || statusColors['to_do'];
            
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.mobileTaskCard, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={() => handleEditTask(task)}
                activeOpacity={0.7}
              >
                <View style={styles.mobileTaskCardContent}>
                  <Text style={[styles.mobileTaskTitle, { color: colors.text }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={[styles.mobileTaskDescription, { color: colors.text + 'CC' }]} numberOfLines={1}>
                      {task.description}
                    </Text>
                  )}
                  <View style={styles.mobileTaskFooter}>
                    <Text style={[styles.mobileTaskStatusText, { color: colors.text }]}>
                      {status.replace('_', ' ').toUpperCase()}
                    </Text>
                    {task.priority && (
                      <Text style={[styles.mobileTaskPriority, { color: colors.text }]}>
                        {'!'.repeat(task.priority)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Modals */}
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
        onDelete={handleDeleteTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => setProjectFormVisible(false)}
        onSubmit={handleProjectUpdate}
        onDelete={project?.id ? () => handleDeleteProject(project.id) : undefined}
        initialData={project}
      />
    </View>
  );

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border }]}>
          <FontAwesome name="angle-left" size={18} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.projectIcon, { backgroundColor: (project.color || theme.primary) + '12' }]}>
            <FontAwesome
              name={(project.icon || 'folder-o') as any}
              size={18}
              color={project.color || theme.primary}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>{project.name}</Text>
            <View style={styles.headerMeta}>
              <View style={[
                styles.projectTypeBadge, 
                { 
                  backgroundColor: isMaintenance ? '#FEF3C7' : theme.primary + '15' 
                }
              ]}>
                <Text style={[
                  styles.projectTypeText, 
                  { color: isMaintenance ? '#F59E0B' : theme.primary }
                ]}>
                  {isMaintenance ? 'Maintenance' : isAgile ? 'Agile' : 'Waterfall'}
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {incompleteTasks.length} {isMaintenance ? 'open issue' : 'active task'}{incompleteTasks.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary }]}
            onPress={() => setNewTaskFormVisible(true)}
          >
            <FontAwesome name="plus" size={12} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Add Task</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setCsvImportModalVisible(true)}
            >
              <FontAwesome name="upload" size={12} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Import CSV</Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { borderColor: theme.border, backgroundColor: currentView === 'dependencies' ? theme.primary : theme.surfaceSecondary }
              ]}
              onPress={() => setCurrentView(currentView === 'dependencies' ? 'dashboard' : 'dependencies')}
            >
              <FontAwesome name="sitemap" size={12} color={currentView === 'dependencies' ? '#fff' : theme.text} />
              <Text style={[styles.actionButtonText, { color: currentView === 'dependencies' ? '#fff' : theme.text }]}>
                Dependencies
              </Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { borderColor: theme.border, backgroundColor: currentView === 'resources' ? theme.primary : theme.surfaceSecondary }
              ]}
              onPress={() => setCurrentView(currentView === 'resources' ? 'dashboard' : 'resources')}
            >
              <FontAwesome name="folder-open-o" size={12} color={currentView === 'resources' ? '#fff' : theme.text} />
              <Text style={[styles.actionButtonText, { color: currentView === 'resources' ? '#fff' : theme.text }]}>
                Resources
              </Text>
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setShareModalVisible(true)}
            >
              <FontAwesome name="share-alt" size={12} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Share</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.primary, backgroundColor: theme.primary }]}
            onPress={() => setProjectFormVisible(true)}
          >
            <FontAwesome name="pencil" size={12} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Edit Project</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* View Content */}
      {currentView === 'resources' ? (
        <View style={styles.resourcesContainer}>
          <ResourcesView
            resources={Array.isArray(project.resources) ? project.resources : []}
            onSave={async (resources) => {
              await handleProjectUpdate({ resources });
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        </View>
      ) : currentView === 'dependencies' ? (
        <View style={styles.dependenciesContainer}>
          <DependencyCanvas
            tasks={tasks}
            projectId={id || ''}
            onTaskClick={handleEditTask}
          />
        </View>
      ) : (
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={true}>
          {isMaintenance ? (
            <MaintenanceDashboard
              project={project}
              tasks={tasks}
              onProjectUpdate={handleProjectUpdate}
              onTaskClick={handleEditTask}
              onTaskStatusChange={async (taskId, newStatus) => {
                await updateTask(taskId, { 
                  status: newStatus,
                  completed: newStatus === 'completed',
                });
                // Refresh tasks to update UI
                if (user?.id && id) {
                  await fetchTasksByProject(id, user.id);
                }
              }}
              onAddTask={() => setNewTaskFormVisible(true)}
            />
          ) : isAgile ? (
            <AgileDashboard
              project={project}
              tasks={tasks}
              onProjectUpdate={handleProjectUpdate}
              onTaskClick={handleEditTask}
              onTaskPhaseChange={async (taskId, newPhase) => {
                await updateTaskPhase(taskId, newPhase);
                // Refresh tasks to update UI
                if (user?.id && id) {
                  await fetchTasksByProject(id, user.id);
                }
              }}
              onAddTask={() => setNewTaskFormVisible(true)}
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
              onTaskUpdate={() => {
                if (user?.id && id) {
                  fetchTasksByProject(id, user.id);
                }
              }}
            />
          )}
          
          {/* Task Lanes - Below Dashboard (skip for Maintenance which has its own issue list) */}
          {!isMaintenance && renderTaskLanes()}
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
        onDelete={handleDeleteTask}
        initialData={selectedTask}
        projects={projects}
        labels={labels}
      />

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => setProjectFormVisible(false)}
        onSubmit={handleProjectUpdate}
        onDelete={project?.id ? () => handleDeleteProject(project.id) : undefined}
        initialData={project}
      />

      <ShareProjectModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        projectId={id || ''}
        projectName={project?.name || ''}
      />

      <TaskCSVImportModal
        visible={csvImportModalVisible}
        onClose={() => setCsvImportModalVisible(false)}
        projectId={id || ''}
        onImportComplete={() => {
          if (user?.id && id) {
            fetchTasksByProject(id, user.id);
          }
        }}
      />
    </View>
  );

  // Wrap with WebLayout on web
  if (Platform.OS === 'web') {
    return <WebLayout>{screenContent}</WebLayout>;
  }

  // Return mobile layout for native platforms
  return renderMobileLayout();
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
    width: 36,
    height: 36,
    borderRadius: 6,
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
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 22 : 24,
    fontWeight: '600',
    letterSpacing: -0.015,
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  projectTypeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '500',
    fontSize: 13,
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
  dependenciesContainer: {
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
  lanesSectionFullScreen: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
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
  lanesContainerFullScreen: {
    flex: 1,
  },
  lanesContent: {
    padding: 16,
    gap: 12,
  },
  // Todo Project Styles
  todoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  todoHeader: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: '600',
    textTransform: 'lowercase',
    letterSpacing: -0.5,
  },
  todoAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoLanesContainer: {
    flex: 1,
  },
  cancelledBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  cancelledTasksContainer: {
    marginTop: 12,
  },
  cancelledTasksContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cancelledTaskWrapper: {
    width: Platform.OS === 'web' ? 240 : 220,
  },
  // Mobile-specific styles
  mobileProjectSheet: {
    marginTop: 60,
    padding: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
  },
  mobileProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileProjectHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  mobileProjectInfo: {
    flex: 1,
  },
  mobileProjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  mobileProjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileProjectSubtitle: {
    fontSize: 13,
  },
  mobileBackButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  mobileEditButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  mobileTasksSection: {
    flex: 1,
    paddingTop: 16,
  },
  mobileTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  mobileTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mobileAddTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mobileAddTaskButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  mobileTasksScroll: {
    flex: 1,
  },
  mobileTasksContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  mobileTaskCard: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  mobileTaskCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  mobileTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mobileTaskDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  mobileTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  mobileTaskStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mobileTaskPriority: {
    fontSize: 14,
    fontWeight: '600',
  },
});
