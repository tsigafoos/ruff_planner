import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface KanbanColumnProps {
  /** Column identifier */
  columnKey: string;
  /** Display label */
  label: string;
  /** Number of items in column */
  count: number;
  /** Primary color for the column */
  color: string;
  /** Background color (lighter version) */
  bgColor: string;
  /** Children (task cards) */
  children: React.ReactNode;
  /** Whether this column is being dragged over */
  isDragOver?: boolean;
  /** Called when add button is pressed */
  onAdd?: () => void;
  /** Web drop handler */
  onDrop?: (e: any) => void;
  /** Web drag over handler */
  onDragOver?: (e: any) => void;
  /** Web drag leave handler */
  onDragLeave?: () => void;
}

/**
 * KanbanColumn - Reusable column component for Kanban boards
 * Used in Agile dashboard for phase-based task organization
 */
export default function KanbanColumn({
  columnKey,
  label,
  count,
  color,
  bgColor,
  children,
  isDragOver = false,
  onAdd,
  onDrop,
  onDragOver,
  onDragLeave,
}: KanbanColumnProps) {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  const columnContent = (
    <View 
      style={[
        styles.column, 
        { backgroundColor: bgColor + '40' },
        isDragOver && [styles.columnDragOver, { borderColor: color }]
      ]}
    >
      {/* Column Header */}
      <View style={[styles.columnHeader, { borderBottomColor: color + '30' }]}>
        <View style={[styles.columnColorBar, { backgroundColor: color }]} />
        <Text style={[styles.columnTitle, { color }]}>{label}</Text>
        <View style={[styles.columnCount, { backgroundColor: color + '20' }]}>
          <Text style={[styles.columnCountText, { color }]}>{count}</Text>
        </View>
        {onAdd && (
          <TouchableOpacity 
            onPress={onAdd}
            style={[styles.addButton, { backgroundColor: color + '15' }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome name="plus" size={10} color={color} />
          </TouchableOpacity>
        )}
      </View>

      {/* Column Tasks */}
      <ScrollView 
        style={styles.columnTasks} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {count === 0 ? (
          <View style={[
            styles.emptyColumn,
            isDragOver && styles.emptyColumnDragOver
          ]}>
            <FontAwesome 
              name={isDragOver ? "arrow-down" : "inbox"} 
              size={24} 
              color={isDragOver ? color : theme.textTertiary} 
            />
            <Text style={[
              styles.emptyColumnText, 
              { color: isDragOver ? color : theme.textTertiary }
            ]}>
              {isDragOver ? 'Drop here' : 'No tasks'}
            </Text>
          </View>
        ) : (
          children
        )}
      </ScrollView>
    </View>
  );

  // Web: Wrap column in drop zone div
  if (isWeb && onDrop) {
    return (
      // @ts-ignore - Using div for web-specific drop zone
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{ display: 'flex' }}
      >
        {columnContent}
      </div>
    );
  }

  return columnContent;
}

const styles = StyleSheet.create({
  column: {
    width: Platform.OS === 'web' ? 240 : 220,
    minHeight: 400,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 6,
  },
  columnDragOver: {
    borderStyle: 'dashed' as any,
    transform: [{ scale: 1.02 }],
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  columnColorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  columnTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnTasks: {
    flex: 1,
    padding: 8,
  },
  emptyColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    margin: 4,
  },
  emptyColumnDragOver: {
    borderStyle: 'dashed' as any,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  emptyColumnText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
