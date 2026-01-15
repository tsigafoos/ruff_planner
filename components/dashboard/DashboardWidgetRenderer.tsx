import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { DashboardWidget } from '@/types';
import { 
  GanttChart, 
  BurndownChart, 
  DependencyFlowchart, 
  StatusLane,
  DraggableTaskCard,
  MiniCalendar,
  InfoCard,
} from '@/components/ui';
import TaskCard from '@/components/TaskCard';

interface DashboardWidgetRendererProps {
  widget: DashboardWidget;
  tasks?: any[];
  projects?: any[];
  onTaskClick?: (task: any) => void;
  onProjectClick?: (project: any) => void;
}

/**
 * DashboardWidgetRenderer - Renders a widget based on its type
 */
export default function DashboardWidgetRenderer({
  widget,
  tasks = [],
  projects = [],
  onTaskClick,
  onProjectClick,
}: DashboardWidgetRendererProps) {
  const theme = useTheme();

  // Get task status helper
  const getTaskStatus = (task: any) => {
    if (task.completed_at || task.completedAt) return 'completed';
    return task.status || 'to_do';
  };

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = getTaskStatus(task);
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = (tasksByStatus['completed'] || []).length;
  const inProgressTasks = (tasksByStatus['in_progress'] || []).length;
  const blockedTasks = (tasksByStatus['blocked'] || []).length;
  const overdueTasks = tasks.filter((t: any) => {
    const dueDate = t.due_date || t.dueDate;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !(t.completed_at || t.completedAt);
  }).length;

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'gantt':
        return (
          <GanttChart
            tasks={tasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              startDate: t.start_date || t.startDate,
              dueDate: t.due_date || t.dueDate,
              createdAt: t.created_at || t.createdAt,
              priority: t.priority,
              isCompleted: !!(t.completed_at || t.completedAt),
            }))}
            onTaskClick={(task) => {
              const fullTask = tasks.find((t: any) => t.id === task.id);
              if (fullTask) onTaskClick?.(fullTask);
            }}
          />
        );

      case 'burndown':
        return (
          <BurndownChart
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            sprintDays={14}
          />
        );

      case 'dependency-flow':
        return (
          <DependencyFlowchart
            tasks={tasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              blockedBy: t.blocked_by || t.blockedBy,
              isCompleted: !!(t.completed_at || t.completedAt),
            }))}
            onTaskClick={(task) => {
              const fullTask = tasks.find((t: any) => t.id === task.id);
              if (fullTask) onTaskClick?.(fullTask);
            }}
          />
        );

      case 'status-lanes':
        const statusLanes = [
          { key: 'to_do', label: 'To Do' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'blocked', label: 'Blocked' },
          { key: 'completed', label: 'Completed' },
        ];
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.lanesContainer}>
              {statusLanes.map((lane, index) => {
                const laneTasks = tasksByStatus[lane.key] || [];
                return (
                  <StatusLane
                    key={lane.key}
                    laneKey={lane.key}
                    label={lane.label}
                    count={laneTasks.length}
                    colorIndex={index}
                  >
                    {laneTasks.slice(0, 5).map((task: any) => (
                      <TouchableOpacity 
                        key={task.id} 
                        onPress={() => onTaskClick?.(task)}
                        style={styles.taskCardWrapper}
                      >
                        <TaskCard task={task} />
                      </TouchableOpacity>
                    ))}
                    {laneTasks.length > 5 && (
                      <Text style={[styles.moreText, { color: theme.textSecondary }]}>
                        +{laneTasks.length - 5} more
                      </Text>
                    )}
                  </StatusLane>
                );
              })}
            </View>
          </ScrollView>
        );

      case 'task-list':
        return (
          <ScrollView style={styles.taskList} showsVerticalScrollIndicator>
            {tasks.slice(0, 10).map((task: any) => (
              <TouchableOpacity 
                key={task.id} 
                onPress={() => onTaskClick?.(task)}
                style={styles.taskCardWrapper}
              >
                <TaskCard task={task} />
              </TouchableOpacity>
            ))}
            {tasks.length > 10 && (
              <Text style={[styles.moreText, { color: theme.textSecondary }]}>
                +{tasks.length - 10} more tasks
              </Text>
            )}
            {tasks.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No tasks</Text>
            )}
          </ScrollView>
        );

      case 'mini-calendar':
        return (
          <MiniCalendar
            tasks={tasks}
            onViewFullCalendar={() => {}}
          />
        );

      case 'calendar':
        return (
          <View style={styles.placeholderWidget}>
            <FontAwesome name="calendar" size={32} color={theme.textTertiary} />
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Full Calendar Widget
            </Text>
            <Text style={[styles.placeholderSubtext, { color: theme.textTertiary }]}>
              Coming soon
            </Text>
          </View>
        );

      case 'info-cards':
        return (
          <View style={styles.infoCardsContainer}>
            <InfoCard
              icon="tasks"
              iconColor={theme.primary}
              label="Total Tasks"
              value={totalTasks}
            />
            <InfoCard
              icon="check-circle"
              iconColor="#10B981"
              label="Completed"
              value={completedTasks}
              subtext={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
            />
            <InfoCard
              icon="spinner"
              iconColor="#3B82F6"
              label="In Progress"
              value={inProgressTasks}
            />
            <InfoCard
              icon="ban"
              iconColor="#F59E0B"
              label="Blocked"
              value={blockedTasks}
            />
            <InfoCard
              icon="clock-o"
              iconColor="#EF4444"
              label="Overdue"
              value={overdueTasks}
            />
          </View>
        );

      case 'project-list':
        return (
          <ScrollView style={styles.projectList} showsVerticalScrollIndicator>
            {projects.slice(0, 8).map((project: any) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectItem, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                onPress={() => onProjectClick?.(project)}
              >
                <View style={[styles.projectIcon, { backgroundColor: (project.color || theme.primary) + '20' }]}>
                  <FontAwesome 
                    name={(project.icon || 'folder') as any} 
                    size={14} 
                    color={project.color || theme.primary} 
                  />
                </View>
                <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
              </TouchableOpacity>
            ))}
            {projects.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No projects</Text>
            )}
          </ScrollView>
        );

      case 'kanban':
        return (
          <View style={styles.placeholderWidget}>
            <FontAwesome name="columns" size={32} color={theme.textTertiary} />
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Kanban Board Widget
            </Text>
            <Text style={[styles.placeholderSubtext, { color: theme.textTertiary }]}>
              Use Agile Dashboard for full Kanban
            </Text>
          </View>
        );

      case 'team-quick':
      case 'team-waiting':
        return (
          <View style={styles.placeholderWidget}>
            <FontAwesome name="users" size={32} color={theme.textTertiary} />
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              {widget.type === 'team-quick' ? 'Team Quick Actions' : 'Team Waiting List'}
            </Text>
            <Text style={[styles.placeholderSubtext, { color: theme.textTertiary }]}>
              Enable Team Mode in settings
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.placeholderWidget}>
            <FontAwesome name="puzzle-piece" size={32} color={theme.textTertiary} />
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Unknown Widget: {widget.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {widget.title && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{widget.title}</Text>
        </View>
      )}
      <View style={styles.content}>
        {renderWidgetContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  lanesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 12,
  },
  taskCardWrapper: {
    marginBottom: 8,
  },
  taskList: {
    flex: 1,
  },
  projectList: {
    flex: 1,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  projectIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moreText: {
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
  placeholderWidget: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});
