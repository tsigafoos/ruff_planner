import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import MobileTaskRow from './MobileTaskRow';

interface MobileTaskListProps {
  tasks: any[];
  projects?: any[];
  loading?: boolean;
  onRefresh?: () => void;
  onTaskPress?: (task: any) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: any) => void;
  onAddTask?: () => void;
  title?: string;
  showProjectFilter?: boolean;
  emptyMessage?: string;
}

type FilterType = 'all' | 'active' | 'completed' | 'today';

/**
 * MobileTaskList - Full mobile task list with filters, FAB, and pull-to-refresh
 */
export default function MobileTaskList({
  tasks,
  projects = [],
  loading = false,
  onRefresh,
  onTaskPress,
  onTaskComplete,
  onTaskDelete,
  onTaskEdit,
  onAddTask,
  title = 'Tasks',
  showProjectFilter = false,
  emptyMessage = 'No tasks yet',
}: MobileTaskListProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterType>('active');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const isCompleted = !!(task.completed_at || task.completedAt);
    const dueDateValue = task.due_date || task.dueDate;
    const dueDate = dueDateValue ? new Date(dueDateValue) : null;
    const isToday = dueDate && new Date().toDateString() === dueDate.toDateString();

    // Project filter
    if (selectedProjectId && task.project_id !== selectedProjectId) {
      return false;
    }

    // Status filter
    switch (filter) {
      case 'active':
        return !isCompleted;
      case 'completed':
        return isCompleted;
      case 'today':
        return isToday && !isCompleted;
      default:
        return true;
    }
  });

  // Sort: incomplete first, then by priority, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aCompleted = !!(a.completed_at || a.completedAt);
    const bCompleted = !!(b.completed_at || b.completedAt);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const aDue = a.due_date || a.dueDate;
    const bDue = b.due_date || b.dueDate;
    if (aDue && bDue) return new Date(aDue).getTime() - new Date(bDue).getTime();
    return aDue ? -1 : 1;
  });

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const renderTask = ({ item }: { item: any }) => (
    <MobileTaskRow
      task={item}
      onPress={() => onTaskPress?.(item)}
      onComplete={() => onTaskComplete?.(item.id)}
      onDelete={() => onTaskDelete?.(item.id)}
      onEdit={() => onTaskEdit?.(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="check-circle" size={48} color={theme.textTertiary} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {filter === 'completed' ? 'No completed tasks' : emptyMessage}
      </Text>
      {filter !== 'completed' && onAddTask && (
        <TouchableOpacity
          style={[styles.emptyButton, { borderColor: theme.primary }]}
          onPress={onAddTask}
        >
          <Text style={[styles.emptyButtonText, { color: theme.primary }]}>
            Add your first task
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'active', label: 'Active', icon: 'circle-o' },
    { key: 'today', label: 'Today', icon: 'sun-o' },
    { key: 'completed', label: 'Done', icon: 'check-circle' },
    { key: 'all', label: 'All', icon: 'list' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filter === f.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <FontAwesome 
              name={f.icon as any} 
              size={14} 
              color={filter === f.key ? theme.primary : theme.textTertiary} 
            />
            <Text style={[
              styles.filterText,
              { color: filter === f.key ? theme.primary : theme.textSecondary },
              filter === f.key && { fontWeight: '600' },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Project Filter (optional) */}
      {showProjectFilter && projects.length > 0 && (
        <View style={[styles.projectFilter, { backgroundColor: theme.surfaceSecondary }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: 'All Projects' }, ...projects]}
            keyExtractor={(item) => item.id || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.projectChip,
                  { 
                    backgroundColor: selectedProjectId === item.id ? theme.primary : theme.surface,
                    borderColor: selectedProjectId === item.id ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedProjectId(item.id)}
              >
                <Text style={[
                  styles.projectChipText,
                  { color: selectedProjectId === item.id ? '#fff' : theme.text },
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.projectFilterContent}
          />
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={sortedTasks.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB (Floating Action Button) */}
      {onAddTask && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={onAddTask}
          activeOpacity={0.8}
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 13,
  },
  projectFilter: {
    paddingVertical: 8,
  },
  projectFilterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  projectChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  projectChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
