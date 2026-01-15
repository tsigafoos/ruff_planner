import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { DashboardLayout, DashboardRow, DashboardWidget, WidgetType } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';
import DashboardWidgetRenderer from './DashboardWidgetRenderer';

interface DashboardGridProps {
  layout: DashboardLayout;
  tasks?: any[];
  projects?: any[];
  onTaskClick?: (task: any) => void;
  onProjectClick?: (project: any) => void;
}

/**
 * DashboardGrid - Renders the dashboard layout with rows and widgets
 */
export default function DashboardGrid({
  layout,
  tasks = [],
  projects = [],
  onTaskClick,
  onProjectClick,
}: DashboardGridProps) {
  const theme = useTheme();
  const { editMode, removeWidget, removeRow, moveRow, addRow } = useDashboardStore();

  // Convert width string to flex value
  const getWidthStyle = (width: string) => {
    const widthMap: Record<string, number> = {
      '25%': 0.25,
      '33%': 0.33,
      '50%': 0.5,
      '66%': 0.66,
      '75%': 0.75,
      '100%': 1,
    };
    return { flex: widthMap[width] || 1 };
  };

  const renderWidget = (widget: DashboardWidget, isLast: boolean) => {
    return (
      <View 
        key={widget.id} 
        style={[
          styles.widgetContainer,
          getWidthStyle(widget.width),
          !isLast && styles.widgetMarginRight,
        ]}
      >
        {editMode && (
          <View style={[styles.editOverlay, { backgroundColor: theme.primary + '10' }]}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.error }]}
              onPress={() => removeWidget(widget.id)}
            >
              <FontAwesome name="trash" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <DashboardWidgetRenderer
          widget={widget}
          tasks={tasks}
          projects={projects}
          onTaskClick={onTaskClick}
          onProjectClick={onProjectClick}
        />
      </View>
    );
  };

  const renderRow = (row: DashboardRow, rowIndex: number) => {
    const isFirst = rowIndex === 0;
    const isLast = rowIndex === layout.rows.length - 1;

    return (
      <View key={row.id} style={styles.rowWrapper}>
        {editMode && (
          <View style={[styles.rowControls, { backgroundColor: theme.surfaceSecondary }]}>
            <TouchableOpacity
              style={[styles.rowControlButton, { opacity: isFirst ? 0.3 : 1 }]}
              onPress={() => !isFirst && moveRow(row.id, 'up')}
              disabled={isFirst}
            >
              <FontAwesome name="chevron-up" size={12} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rowControlButton, { opacity: isLast ? 0.3 : 1 }]}
              onPress={() => !isLast && moveRow(row.id, 'down')}
              disabled={isLast}
            >
              <FontAwesome name="chevron-down" size={12} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rowControlButton, { backgroundColor: theme.error + '20' }]}
              onPress={() => removeRow(row.id)}
            >
              <FontAwesome name="trash" size={12} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.row}>
          {row.widgets.length > 0 ? (
            row.widgets.map((widget, widgetIndex) => 
              renderWidget(widget, widgetIndex === row.widgets.length - 1)
            )
          ) : (
            <View style={[styles.emptyRow, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.emptyRowText, { color: theme.textTertiary }]}>
                {editMode ? 'Drop widgets here or click + to add' : 'Empty row'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!layout || layout.rows.length === 0) {
    return (
      <View style={[styles.emptyLayout, { borderColor: theme.border }]}>
        <FontAwesome name="th-large" size={48} color={theme.textTertiary} />
        <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
          No widgets configured
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
          Click "Edit Dashboard" to add widgets
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {layout.rows.map((row, index) => renderRow(row, index))}
      
      {editMode && (
        <TouchableOpacity
          style={[styles.addRowButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
          onPress={() => addRow()}
        >
          <FontAwesome name="plus" size={16} color={theme.primary} />
          <Text style={[styles.addRowText, { color: theme.primary }]}>Add Row</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowWrapper: {
    marginBottom: 16,
  },
  rowControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  rowControlButton: {
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  widgetContainer: {
    minHeight: 200,
    position: 'relative',
  },
  widgetMarginRight: {
    marginRight: 16,
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
  },
  emptyRow: {
    flex: 1,
    minHeight: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyRowText: {
    fontSize: 14,
  },
  emptyLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
