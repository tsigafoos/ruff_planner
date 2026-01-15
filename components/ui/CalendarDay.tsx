import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/components/useTheme';

export interface CalendarDayProps {
  /** The date for this cell */
  date: Date;
  /** Day number to display */
  dayNumber: number;
  /** Whether this day is in the current month */
  isCurrentMonth?: boolean;
  /** Whether this is today */
  isToday?: boolean;
  /** Whether this day is selected */
  isSelected?: boolean;
  /** Number of tasks due on this day */
  taskCount?: number;
  /** Number of projects active on this day */
  projectCount?: number;
  /** Called when day is pressed */
  onPress?: () => void;
}

/**
 * CalendarDay - Reusable calendar day cell component
 */
export default function CalendarDay({
  date,
  dayNumber,
  isCurrentMonth = true,
  isToday = false,
  isSelected = false,
  taskCount = 0,
  projectCount = 0,
  onPress,
}: CalendarDayProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: theme.border },
        !isCurrentMonth && styles.notCurrentMonth,
        isToday && { backgroundColor: theme.primary + '15', borderColor: theme.primary },
        isSelected && { backgroundColor: theme.primary + '08' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayNumber,
          { color: isCurrentMonth ? theme.text : theme.textTertiary },
          isToday && { color: theme.primary, fontWeight: '700' },
        ]}
      >
        {dayNumber}
      </Text>
      
      {taskCount > 0 && (
        <View style={styles.indicator}>
          <View style={[styles.indicatorDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.indicatorText, { color: theme.textSecondary }]}>
            {taskCount}
          </Text>
        </View>
      )}
      
      {projectCount > 0 && (
        <View style={styles.indicator}>
          <View style={[styles.indicatorDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.indicatorText, { color: theme.textSecondary }]}>
            {projectCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '14.28%',
    aspectRatio: Platform.OS === 'web' ? 1.2 : 1,
    borderWidth: 1,
    padding: 8,
    alignItems: 'flex-start',
  },
  notCurrentMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  indicator: {
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
});
