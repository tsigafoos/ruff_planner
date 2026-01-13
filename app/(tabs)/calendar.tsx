import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/useTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
} from 'date-fns';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const { tasks, loading: tasksLoading, fetchTasks } = useTaskStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
  const theme = useTheme();
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchProjects(user.id);
    }
  }, [user?.id]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task: any) => {
      const dueDate = task.due_date || task.dueDate;
      if (!dueDate) return false;
      const taskDate = format(new Date(dueDate), 'yyyy-MM-dd');
      return taskDate === dateStr && !(task.completed_at || task.completedAt);
    });
  };

  // Get projects for a specific date (projects with start/end dates)
  const getProjectsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return projects.filter((project: any) => {
      const startDate = project.start_date || project.startDate;
      const endDate = project.end_date || project.endDate;
      if (!startDate || !endDate) return false;
      const start = format(new Date(startDate), 'yyyy-MM-dd');
      const end = format(new Date(endDate), 'yyyy-MM-dd');
      return dateStr >= start && dateStr <= end;
    });
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <ScrollView style={styles.monthContainer} contentContainerStyle={styles.monthContainerContent}>
        <View style={styles.weekDayRow}>
          {weekDays.map((day) => (
            <View key={day} style={[styles.weekDayCell, { borderBottomColor: theme.border }]}>
              <Text style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const dayTasks = getTasksForDate(day);
            const dayProjects = getProjectsForDate(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  { borderColor: theme.border },
                  !isCurrentMonth && { opacity: 0.3 },
                  isToday && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
                  isSelected && { backgroundColor: theme.primary + '10' },
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isCurrentMonth ? theme.text : theme.textTertiary },
                    isToday && { color: theme.primary, fontWeight: 'bold' },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {dayTasks.length > 0 && (
                  <View style={styles.dayIndicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.indicatorText, { color: theme.textSecondary }]}>
                      {dayTasks.length}
                    </Text>
                  </View>
                )}
                {dayProjects.length > 0 && (
                  <View style={styles.dayIndicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.indicatorText, { color: theme.textSecondary }]}>
                      {dayProjects.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekContainer}>
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const dayTasks = getTasksForDate(day);
            const dayProjects = getProjectsForDate(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDayColumn,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  isToday && { borderColor: theme.primary, borderWidth: 2 },
                  isSelected && { backgroundColor: theme.primary + '10' },
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <View style={[styles.weekDayHeader, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.weekDayName, { color: theme.textSecondary }]}>
                    {weekDays[index]}
                  </Text>
                  <Text
                    style={[
                      styles.weekDayNumber,
                      { color: theme.text },
                      isToday && { color: theme.primary, fontWeight: 'bold' },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                <ScrollView style={styles.weekDayContent}>
                  {dayTasks.map((task: any) => (
                    <View
                      key={task.id}
                      style={[styles.weekEvent, { backgroundColor: theme.accent + '20', borderLeftColor: theme.accent }]}
                    >
                      <Text style={[styles.weekEventText, { color: theme.text }]} numberOfLines={2}>
                        {task.title}
                      </Text>
                    </View>
                  ))}
                  {dayProjects.map((project: any) => (
                    <View
                      key={project.id}
                      style={[styles.weekEvent, { backgroundColor: theme.primary + '20', borderLeftColor: theme.primary }]}
                    >
                      <Text style={[styles.weekEventText, { color: theme.text }]} numberOfLines={2}>
                        {project.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const dayProjects = getProjectsForDate(currentDate);

    return (
      <ScrollView style={styles.dayContainer}>
        <View style={[styles.dayHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.dayDateText, { color: theme.text }]}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        <View style={styles.dayContent}>
          {dayTasks.length > 0 && (
            <View style={styles.daySection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks ({dayTasks.length})</Text>
              {dayTasks.map((task: any) => (
                <View
                  key={task.id}
                  style={[styles.dayItem, { backgroundColor: theme.surface, borderLeftColor: theme.accent }]}
                >
                  <Text style={[styles.dayItemTitle, { color: theme.text }]}>{task.title}</Text>
                  {task.description && (
                    <Text style={[styles.dayItemDescription, { color: theme.textSecondary }]}>
                      {task.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {dayProjects.length > 0 && (
            <View style={styles.daySection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Projects ({dayProjects.length})
              </Text>
              {dayProjects.map((project: any) => (
                <View
                  key={project.id}
                  style={[styles.dayItem, { backgroundColor: theme.surface, borderLeftColor: theme.primary }]}
                >
                  <Text style={[styles.dayItemTitle, { color: theme.text }]}>{project.name}</Text>
                  {project.objective && (
                    <Text style={[styles.dayItemDescription, { color: theme.textSecondary }]}>
                      {project.objective}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {dayTasks.length === 0 && dayProjects.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks or projects for this day</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderMonthView();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.viewModeSelector}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                { backgroundColor: theme.surfaceSecondary },
                viewMode === 'day' && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setViewMode('day')}
            >
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === 'day' ? theme.sidebarTextActive : theme.text },
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                { backgroundColor: theme.surfaceSecondary },
                viewMode === 'week' && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setViewMode('week')}
            >
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === 'week' ? theme.sidebarTextActive : theme.text },
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                { backgroundColor: theme.surfaceSecondary },
                viewMode === 'month' && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setViewMode('month')}
            >
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === 'month' ? theme.sidebarTextActive : theme.text },
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: theme.primary }]}
            onPress={goToToday}
          >
            <Text style={[styles.todayButtonText, { color: theme.sidebarTextActive }]}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBottom}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <FontAwesome name="chevron-left" size={20} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : viewMode === 'week'
              ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM d, yyyy')}
          </Text>

          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <FontAwesome name="chevron-right" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {renderView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 20 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewModeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthContainer: {
    flex: 1,
  },
  weekDayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  weekDayCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 1,
    padding: 8,
    alignItems: 'flex-start',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  indicatorText: {
    fontSize: 10,
  },
  weekContainer: {
    flexDirection: 'row',
    minHeight: 400,
  },
  weekDayColumn: {
    width: Platform.OS === 'web' ? 200 : 120,
    borderWidth: 1,
    borderRightWidth: 0,
  },
  weekDayHeader: {
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekDayContent: {
    flex: 1,
    padding: 8,
  },
  weekEvent: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  weekEventText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayContainer: {
    flex: 1,
  },
  dayHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  dayDateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dayContent: {
    padding: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  dayItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayItemDescription: {
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
