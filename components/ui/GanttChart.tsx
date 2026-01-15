import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface GanttTask {
  id: string;
  title: string;
  startDate?: Date | string;
  dueDate?: Date | string;
  createdAt?: Date | string;
  priority?: number;
  isCompleted?: boolean;
}

export interface GanttChartProps {
  /** Tasks to display */
  tasks: GanttTask[];
  /** Project start date (optional, calculated from tasks if not provided) */
  projectStart?: Date;
  /** Project end date (optional, calculated from tasks if not provided) */
  projectEnd?: Date;
  /** Called when a task is clicked */
  onTaskClick?: (task: GanttTask) => void;
  /** Show the priority legend */
  showLegend?: boolean;
  /** Show milestones section */
  milestones?: string[];
  /** Show today marker */
  showTodayMarker?: boolean;
}

// Priority colors
const PRIORITY_COLORS: { [key: number]: string } = {
  1: '#10B981', // Green - Low
  2: '#3B82F6', // Blue - Medium
  3: '#F59E0B', // Orange - High
  4: '#EF4444', // Red - Urgent
};

/**
 * GanttChart - Reusable Gantt chart component
 * Displays tasks as horizontal bars on a timeline
 */
export default function GanttChart({
  tasks,
  projectStart: projectStartProp,
  projectEnd: projectEndProp,
  onTaskClick,
  showLegend = true,
  milestones = [],
  showTodayMarker = true,
}: GanttChartProps) {
  const theme = useTheme();

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="bar-chart" size={24} color={theme.textTertiary} />
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
          No tasks to display
        </Text>
      </View>
    );
  }

  // Calculate date range
  let projectStart: Date;
  let projectEnd: Date;

  if (projectStartProp && projectEndProp) {
    projectStart = new Date(projectStartProp);
    projectEnd = new Date(projectEndProp);
  } else {
    const taskDates = tasks
      .flatMap((task) => {
        const dates: Date[] = [];
        if (task.startDate) dates.push(new Date(task.startDate));
        if (task.dueDate) dates.push(new Date(task.dueDate));
        if (task.createdAt) dates.push(new Date(task.createdAt));
        return dates;
      })
      .filter((d) => !isNaN(d.getTime()));

    if (taskDates.length === 0) {
      projectStart = new Date();
      projectEnd = new Date();
      projectEnd.setDate(projectEnd.getDate() + 30);
    } else {
      projectStart = new Date(Math.min(...taskDates.map((d) => d.getTime())));
      projectEnd = new Date(Math.max(...taskDates.map((d) => d.getTime())));
      projectEnd.setDate(projectEnd.getDate() + 7);
    }
  }

  const totalDays = Math.ceil(
    (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (totalDays <= 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
          Invalid date range
        </Text>
      </View>
    );
  }

  // Today marker
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPosition =
    ((today.getTime() - projectStart.getTime()) /
      (projectEnd.getTime() - projectStart.getTime())) *
    100;
  const showMarker = showTodayMarker && todayPosition >= 0 && todayPosition <= 100;

  // Middle date for axis
  const middleDate = new Date(
    projectStart.getTime() + (projectEnd.getTime() - projectStart.getTime()) / 2
  );

  return (
    <View style={styles.container}>
      {/* Priority Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIORITY_COLORS[1] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIORITY_COLORS[2] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIORITY_COLORS[3] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIORITY_COLORS[4] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Urgent</Text>
          </View>
        </View>
      )}

      {/* Task Bars */}
      {tasks.map((task, idx) => {
        const startDate = task.startDate
          ? new Date(task.startDate)
          : task.createdAt
          ? new Date(task.createdAt)
          : projectStart;
        const dueDate = task.dueDate ? new Date(task.dueDate) : projectEnd;

        const taskStart = startDate < projectStart ? projectStart : startDate;
        const taskEnd = dueDate > projectEnd ? projectEnd : dueDate;

        const daysFromStart = Math.max(
          0,
          Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
        );
        const taskDuration = Math.max(
          1,
          Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
        );
        const leftPercent = (daysFromStart / totalDays) * 100;
        const widthPercent = Math.min((taskDuration / totalDays) * 100, 100 - leftPercent);

        const priority = task.priority || 4;
        const taskColor = PRIORITY_COLORS[priority] || PRIORITY_COLORS[4];

        return (
          <View key={task.id || idx} style={styles.row}>
            <TouchableOpacity
              style={styles.taskInfo}
              onPress={() => onTaskClick?.(task)}
              activeOpacity={0.7}
            >
              {task.isCompleted && (
                <FontAwesome
                  name="check-circle"
                  size={14}
                  color="#10B981"
                  style={styles.checkIcon}
                />
              )}
              <Text
                style={[
                  styles.taskName,
                  { color: theme.text },
                  task.isCompleted && styles.taskNameCompleted,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
            <View style={[styles.barContainer, { backgroundColor: theme.border + '30' }]}>
              {/* Today marker */}
              {showMarker && (
                <View
                  style={[
                    styles.todayMarker,
                    { left: `${todayPosition}%`, backgroundColor: theme.primary },
                  ]}
                />
              )}
              {/* Task bar */}
              <View
                style={[
                  styles.bar,
                  {
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: task.isCompleted ? taskColor + '60' : taskColor,
                    borderColor: taskColor,
                    borderWidth: task.isCompleted ? 2 : 0,
                  },
                ]}
              >
                {task.isCompleted && (
                  <View style={styles.barCompleted}>
                    <FontAwesome name="check" size={10} color={taskColor} />
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {/* Milestones */}
      {milestones.length > 0 && (
        <View style={styles.milestones}>
          <Text style={[styles.milestonesLabel, { color: theme.textSecondary }]}>
            Milestones:
          </Text>
          <View style={styles.milestonesList}>
            {milestones.slice(0, 3).map((milestone, idx) => (
              <View key={idx} style={styles.milestoneItem}>
                <FontAwesome name="flag" size={12} color={theme.warning} />
                <Text style={[styles.milestoneText, { color: theme.text }]} numberOfLines={1}>
                  {milestone}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Date Axis */}
      <View style={[styles.dateAxis, { borderTopColor: theme.border }]}>
        <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
          {projectStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <View style={styles.dateAxisCenter}>
          {showMarker ? (
            <View style={styles.todayLabel}>
              <View style={[styles.todayDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.todayText, { color: theme.primary }]}>Today</Text>
            </View>
          ) : (
            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
              {middleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
        <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
          {projectEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
  },
  row: {
    marginBottom: 12,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkIcon: {
    marginRight: 6,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  barContainer: {
    height: 24,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayMarker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    zIndex: 1,
  },
  milestones: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  milestonesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestonesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  milestoneText: {
    fontSize: 13,
    maxWidth: 150,
  },
  dateAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dateAxisCenter: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
  },
  todayLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
