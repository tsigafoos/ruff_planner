import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { 
  addMonths, 
  eachDayOfInterval, 
  endOfMonth, 
  endOfWeek, 
  format, 
  isSameDay, 
  isSameMonth, 
  startOfMonth, 
  startOfWeek, 
  subMonths 
} from 'date-fns';
import { useState } from 'react';

export interface MiniCalendarProps {
  /** Tasks to display on calendar */
  tasks?: any[];
  /** Called when a date is pressed */
  onDatePress?: (date: Date) => void;
  /** Called when "View Full Calendar" is pressed */
  onViewFullCalendar?: () => void;
  /** Initial date to display */
  initialDate?: Date;
}

/**
 * MiniCalendar - Compact calendar widget for dashboards
 * Shows task indicators on dates with tasks due
 */
export default function MiniCalendar({
  tasks = [],
  onDatePress,
  onViewFullCalendar,
  initialDate = new Date(),
}: MiniCalendarProps) {
  const theme = useTheme();
  const [calendarDate, setCalendarDate] = useState(initialDate);

  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => setCalendarDate(subMonths(calendarDate, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="angle-left" size={14} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {format(calendarDate, 'MMM yyyy')}
        </Text>
        <TouchableOpacity 
          onPress={() => setCalendarDate(addMonths(calendarDate, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="angle-right" size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Week days header */}
      <View style={styles.weekDays}>
        {weekDays.map((day, idx) => (
          <Text key={idx} style={[styles.weekDay, { color: theme.textTertiary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, calendarDate);
          const isToday = isSameDay(day, new Date());
          const dayTasks = getTasksForDate(day);
          const hasTasks = dayTasks.length > 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.day,
                !isCurrentMonth && { opacity: 0.3 },
                isToday && { backgroundColor: theme.primary + '20', borderRadius: 4 },
              ]}
              onPress={() => onDatePress?.(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isCurrentMonth ? theme.text : theme.textTertiary },
                  isToday && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasTasks && (
                <View style={[styles.taskDot, { backgroundColor: theme.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* View Full Calendar link */}
      {onViewFullCalendar && (
        <TouchableOpacity 
          style={[styles.link, { borderTopColor: theme.border }]}
          onPress={onViewFullCalendar}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>View Full Calendar</Text>
          <FontAwesome name="angle-right" size={14} color={theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'web' ? 280 : '100%' as any,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: Platform.OS === 'web' ? 'flex-end' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  day: {
    width: '14.28%' as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 12,
  },
  taskDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
