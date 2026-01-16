import { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface MobileTaskRowProps {
  task: any;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const SWIPE_THRESHOLD = 80;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * MobileTaskRow - Compact task row with swipe actions for mobile
 */
export default function MobileTaskRow({ 
  task, 
  onPress, 
  onComplete, 
  onDelete,
  onEdit,
}: MobileTaskRowProps) {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  // Task data handling
  const isCompleted = !!(task.completed_at || task.completedAt);
  const dueDateValue = task.due_date || task.dueDate;
  const dueDate = dueDateValue ? new Date(dueDateValue) : null;
  const status = task.status || 'to_do';
  const hasRecurrence = task.recurrence?.enabled;

  // Priority colors
  const priorityColors: Record<number, string> = {
    1: '#10B981', // Green - High
    2: '#3B82F6', // Blue - Medium  
    3: '#F59E0B', // Yellow - Low
    4: '#6B7280', // Gray - None
  };
  const priorityColor = priorityColors[task.priority] || priorityColors[4];

  // Status color
  const getStatusColor = () => {
    if (isCompleted) return theme.success;
    if (status === 'blocked') return theme.error;
    if (status === 'in_progress') return theme.primary;
    return priorityColor;
  };

  // Format due date compactly
  const formatDueDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = dueDate && isPast(dueDate) && !isCompleted && !isToday(dueDate);

  // Pan responder for swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -SWIPE_THRESHOLD - 40));
        } else if (isSwipedOpen) {
          translateX.setValue(Math.min(0, -SWIPE_THRESHOLD + gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD / 2) {
          // Open actions
          Animated.spring(translateX, {
            toValue: -SWIPE_THRESHOLD,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwipedOpen(true);
        } else {
          // Close actions
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwipedOpen(false);
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsSwipedOpen(false);
  };

  const handleComplete = () => {
    closeSwipe();
    onComplete?.();
  };

  const handleDelete = () => {
    closeSwipe();
    onDelete?.();
  };

  const handleEdit = () => {
    closeSwipe();
    onEdit?.();
  };

  return (
    <View style={styles.container}>
      {/* Background actions (revealed on swipe) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editAction, { backgroundColor: theme.primary }]}
          onPress={handleEdit}
        >
          <FontAwesome name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteAction, { backgroundColor: theme.error }]}
          onPress={handleDelete}
        >
          <FontAwesome name="trash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main row content (slides on swipe) */}
      <Animated.View 
        style={[
          styles.rowContent, 
          { 
            backgroundColor: theme.surface,
            transform: [{ translateX }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.row}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Status/Priority indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />

          {/* Checkbox */}
          <TouchableOpacity
            onPress={handleComplete}
            style={[
              styles.checkbox,
              { borderColor: isCompleted ? theme.success : theme.border },
              isCompleted && { backgroundColor: theme.success },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {isCompleted && <FontAwesome name="check" size={10} color="#fff" />}
          </TouchableOpacity>

          {/* Task info */}
          <View style={styles.taskInfo}>
            <Text 
              style={[
                styles.title, 
                { color: theme.text },
                isCompleted && { textDecorationLine: 'line-through', color: theme.textTertiary },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {/* Compact meta row */}
            <View style={styles.metaRow}>
              {dueDate && (
                <Text style={[
                  styles.metaText,
                  { color: isOverdue ? theme.error : theme.textTertiary },
                  isOverdue && { fontWeight: '600' },
                ]}>
                  {formatDueDate(dueDate)}
                </Text>
              )}
              {hasRecurrence && (
                <FontAwesome name="refresh" size={10} color={theme.textTertiary} style={styles.metaIcon} />
              )}
              {status === 'blocked' && (
                <FontAwesome name="ban" size={10} color={theme.error} style={styles.metaIcon} />
              )}
            </View>
          </View>

          {/* Priority dot */}
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />

          {/* Chevron */}
          <FontAwesome name="chevron-right" size={12} color={theme.textTertiary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {},
  deleteAction: {},
  rowContent: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  statusIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
  },
  metaIcon: {
    marginLeft: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
});
