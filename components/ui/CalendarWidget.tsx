import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

export interface CalendarWidgetProps {
  tasks: any[];
  onDayClick?: (date: Date, tasks: any[]) => void;
  onTaskClick?: (task: any) => void;
  showHeader?: boolean;
  showTaskList?: boolean;
}

/**
 * CalendarWidget - Full calendar view with task indicators
 */
export default function CalendarWidget({
  tasks,
  onDayClick,
  onTaskClick,
  showHeader = true,
  showTaskList = true,
}: CalendarWidgetProps) {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: any) => {
      const dueDate = task.due_date || task.dueDate;
      if (!dueDate) return false;
      return isSameDay(new Date(dueDate), date);
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Get priority color
  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1: return '#EF4444';
      case 2: return '#F59E0B';
      case 3: return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayTasks = getTasksForDate(date);
    onDayClick?.(date, dayTasks);
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    
    // Group by priority for indicator dots
    const priorityGroups = dayTasks.reduce((acc, task) => {
      const p = task.priority || 4;
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          { backgroundColor: theme.surface, borderColor: theme.border },
          !isCurrentMonth && styles.dayCellMuted,
          isSelected && { backgroundColor: theme.primary + '15', borderColor: theme.primary },
          isTodayDate && !isSelected && { borderColor: theme.primary },
        ]}
        onPress={() => handleDayClick(date)}
      >
        <Text
          style={[
            styles.dayNumber,
            { color: isCurrentMonth ? theme.text : theme.textTertiary },
            isTodayDate && { color: theme.primary, fontWeight: '700' },
            isSelected && { color: theme.primary },
          ]}
        >
          {format(date, 'd')}
        </Text>
        
        {/* Task indicators */}
        {dayTasks.length > 0 && (
          <View style={styles.indicators}>
            {Object.entries(priorityGroups).slice(0, 3).map(([priority, count]) => (
              <View 
                key={priority}
                style={[
                  styles.indicator, 
                  { backgroundColor: getPriorityColor(Number(priority)) }
                ]}
              />
            ))}
            {dayTasks.length > 3 && (
              <Text style={[styles.moreIndicator, { color: theme.textTertiary }]}>
                +{dayTasks.length - 3}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <FontAwesome name="calendar" size={16} color={theme.textSecondary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Task Calendar</Text>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <FontAwesome name="chevron-left" size={12} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <FontAwesome name="chevron-right" size={12} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.calendar}>
        {/* Week day headers */}
        <View style={styles.weekDayRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.daysGrid}>
          {calendarDays.map(renderDay)}
        </View>
      </View>

      {/* Selected day tasks */}
      {showTaskList && selectedDate && (
        <View style={[styles.taskList, { backgroundColor: theme.surfaceSecondary, borderTopColor: theme.border }]}>
          <View style={styles.taskListHeader}>
            <Text style={[styles.taskListTitle, { color: theme.text }]}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Text>
            <View style={[styles.taskCount, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.taskCountText, { color: theme.primary }]}>
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <ScrollView 
            style={styles.taskScrollView}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task: any) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => onTaskClick?.(task)}
                >
                  <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {(task.completed_at || task.completedAt) && (
                    <FontAwesome name="check-circle" size={14} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noTasks, { color: theme.textTertiary }]}>
                No tasks due on this day
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  calendar: {
    padding: 8,
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 2,
  },
  dayCellMuted: {
    opacity: 0.4,
  },
  dayNumber: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    alignItems: 'center',
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  moreIndicator: {
    fontSize: 8,
    marginLeft: 1,
  },
  taskList: {
    borderTopWidth: 1,
    padding: 12,
    maxHeight: 200,
  },
  taskListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskListTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskScrollView: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  taskPriority: {
    width: 4,
    height: '100%',
    minHeight: 20,
    borderRadius: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
  },
  noTasks: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
