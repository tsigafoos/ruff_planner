import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import TaskCard from '@/components/TaskCard';
import { TaskStatus } from '@/types';

export interface KanbanWidgetProps {
  tasks: any[];
  onTaskClick?: (task: any) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  showHeader?: boolean;
  compact?: boolean;
}

const KANBAN_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'to_do', label: 'To Do', color: '#6366F1' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { key: 'blocked', label: 'Blocked', color: '#EF4444' },
  { key: 'on_hold', label: 'On Hold', color: '#F59E0B' },
  { key: 'completed', label: 'Done', color: '#10B981' },
];

/**
 * KanbanWidget - A complete Kanban board widget with drag-and-drop
 */
export default function KanbanWidget({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  showHeader = true,
  compact = false,
}: KanbanWidgetProps) {
  const theme = useTheme();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const columnRefs = useRef<Record<string, View | null>>({});

  // Get task status
  const getTaskStatus = (task: any): TaskStatus => {
    if (task.completed_at || task.completedAt) return 'completed';
    return task.status || 'to_do';
  };

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = getTaskStatus(task);
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, any[]>);

  // Drag handlers
  const handleDragStart = (taskId: string, e: any) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: any, column: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = async (column: TaskStatus) => {
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task) {
      setDraggedTaskId(null);
      setDragOverColumn(null);
      return;
    }

    const currentStatus = getTaskStatus(task);
    if (currentStatus !== column && onTaskStatusChange) {
      onTaskStatusChange(draggedTaskId, column);
    }

    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Web drag-and-drop event handlers
  useEffect(() => {
    if (Platform.OS === 'web' && draggedTaskId) {
      const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
      };

      window.addEventListener('dragend', handleDragEnd);
      return () => window.removeEventListener('dragend', handleDragEnd);
    }
  }, [draggedTaskId]);

  const renderColumn = (column: { key: TaskStatus; label: string; color: string }) => {
    const columnTasks = tasksByStatus[column.key] || [];
    const isDragOver = dragOverColumn === column.key;

    return (
      <View
        key={column.key}
        style={[
          styles.column,
          compact && styles.columnCompact,
          { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          isDragOver && { borderColor: column.color, borderWidth: 2 },
        ]}
        ref={(ref) => { columnRefs.current[column.key] = ref; }}
        // @ts-ignore - Web-specific props
        {...(Platform.OS === 'web' ? {
          onDragOver: (e: any) => handleDragOver(e, column.key),
          onDrop: () => handleDrop(column.key),
          'data-column-key': column.key,
        } : {})}
      >
        {/* Column Header */}
        <View style={[styles.columnHeader, { borderBottomColor: theme.border }]}>
          <View style={[styles.columnDot, { backgroundColor: column.color }]} />
          <Text style={[styles.columnTitle, { color: theme.text }]}>{column.label}</Text>
          <View style={[styles.columnCount, { backgroundColor: column.color + '20' }]}>
            <Text style={[styles.columnCountText, { color: column.color }]}>
              {columnTasks.length}
            </Text>
          </View>
        </View>

        {/* Column Tasks */}
        <ScrollView 
          style={styles.columnContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          {columnTasks.length > 0 ? (
            columnTasks.map((task: any) => (
              <View
                key={task.id}
                style={[
                  styles.taskWrapper,
                  draggedTaskId === task.id && styles.taskDragging,
                ]}
                // @ts-ignore - Web-specific props
                {...(Platform.OS === 'web' ? {
                  draggable: true,
                  onDragStart: (e: any) => {
                    e.dataTransfer.setData('taskId', task.id);
                    handleDragStart(task.id, e);
                  },
                } : {})}
              >
                <TouchableOpacity onPress={() => onTaskClick?.(task)}>
                  <TaskCard task={task} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyColumn}>
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                No tasks
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <FontAwesome name="columns" size={16} color={theme.textSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Kanban Board</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {tasks.length} tasks
          </Text>
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator
        style={styles.columnsContainer}
        contentContainerStyle={styles.columnsContent}
      >
        {KANBAN_COLUMNS.map(renderColumn)}
      </ScrollView>
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
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  columnsContainer: {
    flex: 1,
  },
  columnsContent: {
    padding: 12,
    gap: 12,
  },
  column: {
    width: Platform.OS === 'web' ? 280 : 260,
    minHeight: 300,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  columnCompact: {
    width: Platform.OS === 'web' ? 220 : 200,
    minHeight: 200,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
  },
  columnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  columnCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  columnContent: {
    flex: 1,
    padding: 8,
  },
  taskWrapper: {
    marginBottom: 8,
  },
  taskDragging: {
    opacity: 0.5,
  },
  emptyColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 12,
  },
});
