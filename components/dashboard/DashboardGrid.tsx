import { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { DashboardLayout, DashboardRow, DashboardWidget, WidgetType, WidgetColumns } from '@/types';
import { useDashboardStore, WIDGET_CATALOG, columnsToWidth } from '@/store/dashboardStore';
import DashboardWidgetRenderer from './DashboardWidgetRenderer';

interface DashboardGridProps {
  layout: DashboardLayout;
  tasks?: any[];
  projects?: any[];
  resources?: any[];
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
  resources = [],
  onTaskClick,
  onProjectClick,
}: DashboardGridProps) {
  const theme = useTheme();
  const { editMode, removeWidget, removeRow, moveRow, addRow, addWidgetToRow, resizeWidget } = useDashboardStore();
  
  const [widgetPickerVisible, setWidgetPickerVisible] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);

  // Convert columns to flex value (12 column grid)
  const getWidthStyle = (widget: DashboardWidget): { flex?: number; width?: string } => {
    const columns = widget.columns || 12;
    // Use flex for layout in a row
    return { 
      flex: columns / 12,
    };
  };

  const openWidgetPicker = (rowId: string) => {
    setSelectedRowId(rowId);
    setWidgetPickerVisible(true);
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    if (selectedRowId) {
      addWidgetToRow(selectedRowId, widgetType);
      setWidgetPickerVisible(false);
      setSelectedRowId(null);
    }
  };

  const handleResize = (widgetId: string, columns: WidgetColumns) => {
    resizeWidget(widgetId, columns);
    setResizingWidget(null);
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'charts', label: 'Charts' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'info', label: 'Info' },
    { key: 'team', label: 'Team' },
    { key: 'utility', label: 'Utility' },
  ];

  const filteredWidgets = selectedCategory === 'all' 
    ? WIDGET_CATALOG 
    : WIDGET_CATALOG.filter(w => w.category === selectedCategory);

  // Get min height based on widget type
  const getWidgetMinHeight = (widgetType: WidgetType): number => {
    // Thin widgets get smaller min height
    if (['notes', 'resources', 'mini-calendar', 'team-quick'].includes(widgetType)) {
      return 200;
    }
    // Medium widgets
    if (['info-cards', 'task-list', 'project-list', 'team-waiting', 'burndown'].includes(widgetType)) {
      return 250;
    }
    // Large widgets (kanban, gantt, etc.)
    return 300;
  };

  const renderWidget = (widget: DashboardWidget, row: DashboardRow) => {
    const catalogEntry = WIDGET_CATALOG.find(w => w.type === widget.type);
    
    const widthFlex = (widget.columns || 12) / 12;
    const minHeight = getWidgetMinHeight(widget.type);
    
    return (
      <View 
        key={widget.id} 
        style={[
          styles.widgetContainer,
          { flex: widthFlex, minHeight },
        ]}
      >
        {editMode && (
          <View style={[styles.editOverlay, { backgroundColor: 'transparent' }]}>
            <View style={styles.editOverlayButtons}>
              {/* Resize button */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.primary }]}
                onPress={() => setResizingWidget(resizingWidget === widget.id ? null : widget.id)}
              >
                <FontAwesome name="arrows-h" size={10} color="#fff" />
              </TouchableOpacity>
              {/* Delete button */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.error }]}
                onPress={() => removeWidget(widget.id)}
              >
                <FontAwesome name="trash" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Resize controls */}
            {resizingWidget === widget.id && (
              <View style={[styles.resizeControls, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.resizeLabel, { color: theme.textSecondary }]}>Width:</Text>
                {[3, 4, 6, 8, 12].map((cols) => (
                  <TouchableOpacity
                    key={cols}
                    style={[
                      styles.resizeButton,
                      { 
                        backgroundColor: widget.columns === cols ? theme.primary : theme.surfaceSecondary,
                        borderColor: widget.columns === cols ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handleResize(widget.id, cols as WidgetColumns)}
                  >
                    <Text style={[
                      styles.resizeButtonText, 
                      { color: widget.columns === cols ? '#fff' : theme.text }
                    ]}>
                      {cols === 3 ? '¼' : cols === 4 ? '⅓' : cols === 6 ? '½' : cols === 8 ? '⅔' : 'Full'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        <DashboardWidgetRenderer
          widget={widget}
          tasks={tasks}
          projects={projects}
          resources={resources}
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
        {/* Row Header (edit mode) */}
        {editMode && (
          <View style={[styles.rowHeader, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <View style={styles.rowHeaderLeft}>
              <Text style={[styles.rowName, { color: theme.text }]}>
                {row.name || `Lane ${rowIndex + 1}`}
              </Text>
              <Text style={[styles.rowWidgetCount, { color: theme.textTertiary }]}>
                {row.widgets.length} widget{row.widgets.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.rowHeaderRight}>
              {/* Add widget button */}
              <TouchableOpacity
                style={[styles.addWidgetButton, { backgroundColor: theme.primary }]}
                onPress={() => openWidgetPicker(row.id)}
              >
                <FontAwesome name="plus" size={10} color="#fff" />
                <Text style={styles.addWidgetText}>Add Widget</Text>
              </TouchableOpacity>
              
              {/* Move up */}
              <TouchableOpacity
                style={[styles.rowControlButton, { backgroundColor: theme.surface, opacity: isFirst ? 0.3 : 1 }]}
                onPress={() => !isFirst && moveRow(row.id, 'up')}
                disabled={isFirst}
              >
                <FontAwesome name="chevron-up" size={10} color={theme.text} />
              </TouchableOpacity>
              
              {/* Move down */}
              <TouchableOpacity
                style={[styles.rowControlButton, { backgroundColor: theme.surface, opacity: isLast ? 0.3 : 1 }]}
                onPress={() => !isLast && moveRow(row.id, 'down')}
                disabled={isLast}
              >
                <FontAwesome name="chevron-down" size={10} color={theme.text} />
              </TouchableOpacity>
              
              {/* Delete lane */}
              <TouchableOpacity
                style={[styles.rowControlButton, { backgroundColor: theme.error + '15' }]}
                onPress={() => removeRow(row.id)}
              >
                <FontAwesome name="trash" size={10} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Row Content */}
        <View style={[styles.row, editMode && { borderColor: theme.border, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, padding: 8 }]}>
          {row.widgets.length > 0 ? (
            row.widgets.map((widget) => renderWidget(widget, row))
          ) : (
            <TouchableOpacity 
              style={[styles.emptyRow, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
              onPress={() => editMode && openWidgetPicker(row.id)}
            >
              {editMode ? (
                <>
                  <FontAwesome name="plus-circle" size={24} color={theme.primary} />
                  <Text style={[styles.emptyRowText, { color: theme.primary }]}>
                    Click to add widget
                  </Text>
                </>
              ) : (
                <Text style={[styles.emptyRowText, { color: theme.textTertiary }]}>
                  Empty lane
                </Text>
              )}
            </TouchableOpacity>
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
          No lanes configured
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
          {editMode ? 'Click "Add Lane" to get started' : 'Enable edit mode to add lanes'}
        </Text>
        {editMode && (
          <TouchableOpacity
            style={[styles.addFirstLane, { backgroundColor: theme.primary }]}
            onPress={() => addRow()}
          >
            <FontAwesome name="plus" size={14} color="#fff" />
            <Text style={styles.addFirstLaneText}>Add First Lane</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {layout.rows.map((row, index) => renderRow(row, index))}
      
      {editMode && (
        <TouchableOpacity
          style={[styles.addRowButton, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
          onPress={() => addRow()}
        >
          <FontAwesome name="plus" size={14} color={theme.primary} />
          <Text style={[styles.addRowText, { color: theme.primary }]}>Add Lane</Text>
        </TouchableOpacity>
      )}

      {/* Widget Picker Modal */}
      <Modal visible={widgetPickerVisible} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.widgetPickerContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.widgetPickerHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.widgetPickerTitle, { color: theme.text }]}>Add Widget</Text>
              <TouchableOpacity onPress={() => setWidgetPickerVisible(false)}>
                <FontAwesome name="times" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryTab,
                    { 
                      backgroundColor: selectedCategory === cat.key ? theme.primary : theme.surfaceSecondary,
                      borderColor: selectedCategory === cat.key ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Text style={[
                    styles.categoryTabText,
                    { color: selectedCategory === cat.key ? '#fff' : theme.text }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Widget Grid */}
            <ScrollView style={styles.widgetGrid} showsVerticalScrollIndicator>
              <View style={styles.widgetGridContent}>
                {filteredWidgets.map((widget) => (
                  <TouchableOpacity
                    key={widget.type}
                    style={[styles.widgetOption, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                    onPress={() => handleAddWidget(widget.type)}
                  >
                    <View style={[styles.widgetOptionIcon, { backgroundColor: theme.primary + '15' }]}>
                      <FontAwesome name={widget.icon as any} size={18} color={theme.primary} />
                    </View>
                    <Text style={[styles.widgetOptionName, { color: theme.text }]}>{widget.name}</Text>
                    <Text style={[styles.widgetOptionSize, { color: theme.textTertiary }]}>
                      {widget.defaultColumns}/12 cols
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No flex: 1 here since we're inside a ScrollView
  },
  rowWrapper: {
    marginBottom: 20,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowName: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowWidgetCount: {
    fontSize: 11,
  },
  rowHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addWidgetText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  rowControlButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  widgetContainer: {
    position: 'relative',
    padding: 4,
  },
  editOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  editOverlayButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  resizeLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  resizeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  resizeButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyRow: {
    flex: 1,
    minHeight: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  emptyRowText: {
    fontSize: 13,
    fontWeight: '500',
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
  addFirstLane: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  addFirstLaneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addRowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetPickerContainer: {
    width: Platform.OS === 'web' ? 480 : '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  widgetPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  widgetPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTabs: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  widgetGrid: {
    flex: 1,
    padding: 16,
  },
  widgetGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  widgetOption: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  widgetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetOptionName: {
    fontSize: 13,
    fontWeight: '600',
  },
  widgetOptionSize: {
    fontSize: 10,
  },
});
