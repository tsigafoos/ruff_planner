import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Card from './ui/Card';
import { useTheme } from '@/components/useTheme';

const priorityColors: { [key: number]: string } = {
  1: '#10B981',
  2: '#3B82F6',
  3: '#F59E0B',
  4: '#EF4444',
};

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
  const priorityColor = priorityColors[task.priority] || theme.textTertiary;

  return (
    <Card style={styles.card}>
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
                isCompleted && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              activeOpacity={0.8}
            >
              {isCompleted && <FontAwesome name="check" size={12} color="#FFFFFF" />}
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.title,
                  { color: theme.text },
                  isCompleted && { color: theme.textTertiary },
                ]}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={[
                    styles.description,
                    { color: theme.textSecondary },
                    isCompleted && { color: theme.textTertiary },
                  ]}
                >
                  {task.description}
                </Text>
              )}
              <View style={styles.meta}>
                {dueDate && (
                  <View style={styles.metaItem}>
                    <FontAwesome name="calendar" size={12} color={theme.textTertiary} />
                    <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                      {dueDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    P{task.priority}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity 
            onPress={onDelete} 
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="trash" size={16} color={theme.error} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: Platform.OS === 'web' ? 11 : 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
