import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useDashboardStore, WIDGET_CATALOG, DASHBOARD_TEMPLATES } from '@/store/dashboardStore';
import { DashboardTemplate, WidgetType, WidgetWidth, WidgetCatalogEntry } from '@/types';
import { Button } from '@/components/ui';

interface DashboardEditorProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * DashboardEditor - Modal for editing dashboard layout
 */
export default function DashboardEditor({ visible, onClose }: DashboardEditorProps) {
  const theme = useTheme();
  const { 
    currentLayout, 
    addWidget, 
    addRow, 
    applyTemplate, 
    resetToTemplate,
    saveLayout,
    setEditMode,
  } = useDashboardStore();

  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [widgetPickerVisible, setWidgetPickerVisible] = useState(false);
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!visible || !currentLayout) return null;

  const handleAddWidget = (widgetEntry: WidgetCatalogEntry) => {
    if (!selectedRow) {
      // Add a new row first
      addRow();
      // Get the new row ID (last row)
      const newRowId = currentLayout.rows[currentLayout.rows.length - 1]?.id;
      if (newRowId) {
        addWidget(newRowId, {
          type: widgetEntry.type,
          width: widgetEntry.defaultWidth,
          title: widgetEntry.name,
        });
      }
    } else {
      addWidget(selectedRow, {
        type: widgetEntry.type,
        width: widgetEntry.defaultWidth,
        title: widgetEntry.name,
      });
    }
    setWidgetPickerVisible(false);
    setSelectedRow(null);
  };

  const handleApplyTemplate = (template: DashboardTemplate) => {
    applyTemplate(template);
    setTemplatePickerVisible(false);
  };

  const handleSave = async () => {
    await saveLayout();
    setEditMode(false);
    onClose();
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'charts', label: 'Charts' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'info', label: 'Info' },
    { key: 'team', label: 'Team' },
  ];

  const filteredWidgets = selectedCategory === 'all' 
    ? WIDGET_CATALOG 
    : WIDGET_CATALOG.filter(w => w.category === selectedCategory);

  const templates: { key: DashboardTemplate; label: string; description: string; icon: string }[] = [
    { key: 'agile', label: 'Agile', description: 'Kanban, Burndown, Sprint Stats', icon: 'columns' },
    { key: 'waterfall', label: 'Waterfall', description: 'Gantt, Status Lanes, Calendar', icon: 'bar-chart' },
    { key: 'maintenance', label: 'Maintenance', description: 'Task List, Team Waiting', icon: 'wrench' },
    { key: 'blank', label: 'Blank', description: 'Start from scratch', icon: 'square-o' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Edit Dashboard</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {currentLayout.name} • {currentLayout.template} template
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
                  onPress={() => setWidgetPickerVisible(true)}
                >
                  <FontAwesome name="plus" size={16} color={theme.primary} />
                  <Text style={[styles.quickActionText, { color: theme.primary }]}>Add Widget</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={() => addRow()}
                >
                  <FontAwesome name="plus-square-o" size={16} color={theme.text} />
                  <Text style={[styles.quickActionText, { color: theme.text }]}>Add Row</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={() => setTemplatePickerVisible(true)}
                >
                  <FontAwesome name="magic" size={16} color={theme.text} />
                  <Text style={[styles.quickActionText, { color: theme.text }]}>Change Template</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={resetToTemplate}
                >
                  <FontAwesome name="refresh" size={16} color={theme.text} />
                  <Text style={[styles.quickActionText, { color: theme.text }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Layout Preview */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Layout</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {currentLayout.rows.length} rows, {currentLayout.rows.reduce((sum, r) => sum + r.widgets.length, 0)} widgets
              </Text>
              
              {currentLayout.rows.map((row, rowIndex) => (
                <View 
                  key={row.id} 
                  style={[
                    styles.rowPreview, 
                    { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Row {rowIndex + 1}</Text>
                  <View style={styles.rowWidgets}>
                    {row.widgets.map((widget) => (
                      <View 
                        key={widget.id} 
                        style={[styles.widgetPreview, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                      >
                        <Text style={[styles.widgetPreviewText, { color: theme.text }]} numberOfLines={1}>
                          {widget.title || widget.type}
                        </Text>
                        <Text style={[styles.widgetPreviewWidth, { color: theme.textSecondary }]}>
                          {widget.width}
                        </Text>
                      </View>
                    ))}
                    {row.widgets.length === 0 && (
                      <TouchableOpacity
                        style={[styles.addToRowButton, { borderColor: theme.border }]}
                        onPress={() => {
                          setSelectedRow(row.id);
                          setWidgetPickerVisible(true);
                        }}
                      >
                        <FontAwesome name="plus" size={12} color={theme.textTertiary} />
                        <Text style={[styles.addToRowText, { color: theme.textTertiary }]}>Add Widget</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button title="Cancel" variant="secondary" onPress={onClose} />
            <Button title="Save Changes" onPress={handleSave} />
          </View>
        </View>
      </View>

      {/* Widget Picker Modal */}
      <Modal visible={widgetPickerVisible} animationType="fade" transparent>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.title, { color: theme.text }]}>Add Widget</Text>
              <TouchableOpacity onPress={() => setWidgetPickerVisible(false)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
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

            {/* Widget List */}
            <ScrollView style={styles.widgetList} showsVerticalScrollIndicator>
              {filteredWidgets.map((widget) => (
                <TouchableOpacity
                  key={widget.type}
                  style={[styles.widgetOption, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={() => handleAddWidget(widget)}
                >
                  <View style={[styles.widgetIcon, { backgroundColor: theme.primary + '20' }]}>
                    <FontAwesome name={widget.icon as any} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.widgetInfo}>
                    <Text style={[styles.widgetName, { color: theme.text }]}>{widget.name}</Text>
                    <Text style={[styles.widgetDescription, { color: theme.textSecondary }]}>
                      {widget.description}
                    </Text>
                  </View>
                  <FontAwesome name="plus-circle" size={20} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Template Picker Modal */}
      <Modal visible={templatePickerVisible} animationType="fade" transparent>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.title, { color: theme.text }]}>Choose Template</Text>
              <TouchableOpacity onPress={() => setTemplatePickerVisible(false)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templateList} showsVerticalScrollIndicator>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.key}
                  style={[
                    styles.templateOption, 
                    { 
                      backgroundColor: currentLayout.template === template.key 
                        ? theme.primary + '15' 
                        : theme.surfaceSecondary, 
                      borderColor: currentLayout.template === template.key 
                        ? theme.primary 
                        : theme.border 
                    }
                  ]}
                  onPress={() => handleApplyTemplate(template.key)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: theme.primary + '20' }]}>
                    <FontAwesome name={template.icon as any} size={24} color={theme.primary} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: theme.text }]}>{template.label}</Text>
                    <Text style={[styles.templateDescription, { color: theme.textSecondary }]}>
                      {template.description}
                    </Text>
                  </View>
                  {currentLayout.template === template.key && (
                    <FontAwesome name="check-circle" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Platform.OS === 'web' ? 600 : '95%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowPreview: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rowWidgets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  widgetPreview: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  widgetPreviewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  widgetPreviewWidth: {
    fontSize: 10,
    marginTop: 2,
  },
  addToRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addToRowText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  // Picker styles
  pickerContainer: {
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryTabs: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  widgetList: {
    flex: 1,
    padding: 16,
  },
  widgetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  widgetIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetInfo: {
    flex: 1,
  },
  widgetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  widgetDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  templateList: {
    flex: 1,
    padding: 16,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 16,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
