import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Card from './ui/Card';
import { useTheme } from '@/components/useTheme';

interface TaskCardProps {
  task: any;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

export default function TaskCard({ task, onPress, onComplete, onDelete }: TaskCardProps) {
  const theme = useTheme();
  
  // Handle both snake_case (Supabase) and camelCase (WatermelonDB) formats
  const isCompleted = !!(task.completed_at || task.completedAt);
  const dueDateValue = task.due_date || task.dueDate;
  const dueDate = dueDateValue ? new Date(dueDateValue) : null;
  const status = task.status || 'to_do';
  
  // Parse blocked_by field
  const blockedByRaw = task.blocked_by || task.blockedBy;
  const blockedBy: string[] = Array.isArray(blockedByRaw) 
    ? blockedByRaw 
    : (typeof blockedByRaw === 'string' ? JSON.parse(blockedByRaw || '[]') : []);
  const hasBlockers = blockedBy.length > 0;
  
  // Use theme priority colors
  const priorityColorMap: { [key: number]: string } = {
    1: theme.priority?.p1 || '#10B981',
    2: theme.priority?.p2 || '#3B82F6',
    3: theme.priority?.p3 || '#F59E0B',
    4: theme.priority?.p4 || '#EF4444',
  };
  const priorityColor = priorityColorMap[task.priority] || theme.textTertiary;
  
  // Check if task is overdue
  const isOverdue = dueDate && dueDate < new Date() && !isCompleted;
  
  // Status indicator color
  const getStatusColor = () => {
    if (isCompleted) return theme.success;
    if (status === 'blocked') return theme.error;
    if (status === 'on_hold') return theme.warning;
    if (status === 'in_progress') return theme.primary;
    return theme.textTertiary;
  };

  return (
    <Card style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* Status indicator line */}
      <View style={[styles.statusLine, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={onPress} 
          style={styles.taskContent}
          activeOpacity={0.7}
        >
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={(e) => {
                onComplete?.();
              }}
              style={[
                styles.checkbox,
                { borderColor: theme.border },
                isCompleted && { backgroundColor: theme.success, borderColor: theme.success },
              ]}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isCompleted && <FontAwesome name="check" size={12} color="#FFFFFF" />}
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.title,
                  { color: theme.text },
                  isCompleted && styles.titleCompleted,
                  isCompleted && { color: theme.textTertiary },
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description && !isCompleted && (
                <Text
                  style={[
                    styles.description,
                    { color: theme.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
              <View style={styles.meta}>
                {dueDate && (
                  <View style={[
                    styles.metaItem,
                    isOverdue && styles.metaItemOverdue,
                    isOverdue && { backgroundColor: theme.error + '15' },
                  ]}>
                    <FontAwesome 
                      name="calendar" 
                      size={11} 
                      color={isOverdue ? theme.error : theme.textTertiary} 
                    />
                    <Text style={[
                      styles.metaText, 
                      { color: isOverdue ? theme.error : theme.textTertiary },
                      isOverdue && { fontWeight: '600' },
                    ]}>
                      {dueDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15' }]}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    P{task.priority}
                  </Text>
                </View>
                {status === 'blocked' && (
                  <View style={[styles.statusBadge, { backgroundColor: theme.error + '15' }]}>
                    <FontAwesome name="ban" size={10} color={theme.error} />
                    <Text style={[styles.statusText, { color: theme.error }]}>Blocked</Text>
                  </View>
                )}
                {hasBlockers && !isCompleted && (
                  <View style={[styles.blockedByBadge, { backgroundColor: theme.warning + '15' }]}>
                    <FontAwesome name="lock" size={10} color={theme.warning} />
                    <Text style={[styles.blockedByText, { color: theme.warning }]}>
                      Blocked by {blockedBy.length}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity 
            onPress={onDelete} 
            style={styles.deleteButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="trash-o" size={16} color={theme.error} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    minHeight: Platform.OS === 'web' ? 48 : 56, // Better touch target
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: Platform.OS === 'web' ? 22 : 26,
    height: Platform.OS === 'web' ? 22 : 26,
    borderRadius: 13,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: Platform.OS === 'web' ? 20 : 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    marginBottom: 8,
    lineHeight: Platform.OS === 'web' ? 18 : 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  metaItemOverdue: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  blockedByBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  blockedByText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 4,
  },
});
