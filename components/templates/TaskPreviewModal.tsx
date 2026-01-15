import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { Button } from '@/components/ui';
import { 
  ProjectTemplate, 
  TemplateTask,
  TEMPLATE_CATEGORIES,
  calculateTaskDates,
} from '@/lib/projectTemplates';
import { ProjectType } from '@/types';
import { format, addDays } from 'date-fns';

interface TaskPreviewModalProps {
  visible: boolean;
  template: ProjectTemplate | null;
  onClose: () => void;
  onConfirm: (projectData: {
    name: string;
    projectType: ProjectType;
    color: string;
    icon: string;
    tasks: Array<TemplateTask & { dueDate: Date; startDate?: Date }>;
  }) => void;
}

/**
 * TaskPreviewModal - Preview and select tasks from a template
 */
export default function TaskPreviewModal({
  visible,
  template,
  onClose,
  onConfirm,
}: TaskPreviewModalProps) {
  const theme = useTheme();
  const [projectName, setProjectName] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [startDate, setStartDate] = useState(new Date());

  // Calculate task dates based on start date
  const tasksWithDates = useMemo(() => {
    if (!template) return [];
    return calculateTaskDates(template, startDate);
  }, [template, startDate]);

  // Initialize selection when template changes
  useMemo(() => {
    if (template) {
      setProjectName(template.name);
      setSelectedTasks(new Set(template.tasks.map((_, i) => i)));
      setSelectAll(true);
    }
  }, [template?.id]);

  if (!visible || !template) return null;

  const category = TEMPLATE_CATEGORIES[template.category];

  const handleToggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
    setSelectAll(newSelected.size === template.tasks.length);
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(template.tasks.map((_, i) => i)));
    }
    setSelectAll(!selectAll);
  };

  const handleConfirm = () => {
    const selectedTasksWithDates = tasksWithDates.filter((_, i) => selectedTasks.has(i));
    
    onConfirm({
      name: projectName || template.name,
      projectType: template.projectType,
      color: template.color,
      icon: template.icon,
      tasks: selectedTasksWithDates,
    });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#EF4444';
      case 2: return '#F59E0B';
      case 3: return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'None';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <FontAwesome name="arrow-left" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.templateIcon, { backgroundColor: template.color + '15' }]}>
                <FontAwesome name={template.icon as any} size={20} color={template.color} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>{template.name}</Text>
                <View style={styles.headerMeta}>
                  <View style={[styles.metaBadge, { backgroundColor: category.color + '15' }]}>
                    <Text style={[styles.metaText, { color: category.color }]}>{category.label}</Text>
                  </View>
                  <Text style={[styles.taskCount, { color: theme.textSecondary }]}>
                    {selectedTasks.size} of {template.tasks.length} tasks selected
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Project Config */}
          <View style={[styles.configSection, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: theme.text }]}>Project Name</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Enter project name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
            <View style={styles.configRow}>
              <Text style={[styles.configLabel, { color: theme.text }]}>Start Date</Text>
              <View style={[styles.dateDisplay, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <FontAwesome name="calendar" size={14} color={theme.primary} />
                <Text style={[styles.dateText, { color: theme.text }]}>
                  {format(startDate, 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
          </View>

          {/* Task Selection Header */}
          <View style={[styles.selectionHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity style={styles.selectAllButton} onPress={handleToggleAll}>
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: selectAll ? theme.primary : 'transparent',
                  borderColor: selectAll ? theme.primary : theme.border,
                }
              ]}>
                {selectAll && <FontAwesome name="check" size={10} color="#fff" />}
              </View>
              <Text style={[styles.selectAllText, { color: theme.text }]}>
                {selectAll ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.selectionInfo, { color: theme.textSecondary }]}>
              Tasks will be created with calculated due dates
            </Text>
          </View>

          {/* Task List */}
          <ScrollView 
            style={styles.taskList}
            contentContainerStyle={styles.taskListContent}
            showsVerticalScrollIndicator
          >
            {tasksWithDates.map((task, index) => {
              const isSelected = selectedTasks.has(index);
              const priorityColor = getPriorityColor(task.priority);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.taskItem,
                    { 
                      backgroundColor: isSelected ? theme.surfaceSecondary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                      opacity: isSelected ? 1 : 0.6,
                    }
                  ]}
                  onPress={() => handleToggleTask(index)}
                >
                  {/* Checkbox */}
                  <View style={[
                    styles.checkbox,
                    { 
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                      borderColor: isSelected ? theme.primary : theme.border,
                    }
                  ]}>
                    {isSelected && <FontAwesome name="check" size={10} color="#fff" />}
                  </View>
                  
                  {/* Task Info */}
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
                    {task.description && (
                      <Text style={[styles.taskDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                        {task.description}
                      </Text>
                    )}
                    <View style={styles.taskMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15' }]}>
                        <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                          {getPriorityLabel(task.priority)}
                        </Text>
                      </View>
                      <Text style={[styles.taskDate, { color: theme.textSecondary }]}>
                        Due: {format(task.dueDate, 'MMM d')}
                      </Text>
                      {task.phase && (
                        <Text style={[styles.taskPhase, { color: theme.textTertiary }]}>
                          {task.phase}
                        </Text>
                      )}
                      {task.category && (
                        <Text style={[styles.taskPhase, { color: theme.textTertiary }]}>
                          {task.category}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button title="Back" variant="secondary" onPress={onClose} />
            <View style={styles.footerRight}>
              <Text style={[styles.footerSummary, { color: theme.textSecondary }]}>
                {selectedTasks.size} tasks will be created
              </Text>
              <Button 
                title="Create Project" 
                onPress={handleConfirm}
                disabled={selectedTasks.size === 0 || !projectName.trim()}
              />
            </View>
          </View>
        </View>
      </View>
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
    width: Platform.OS === 'web' ? 700 : '95%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskCount: {
    fontSize: 12,
  },
  configSection: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 100,
  },
  configInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectionInfo: {
    fontSize: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    padding: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 12,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 11,
  },
  taskPhase: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerSummary: {
    fontSize: 12,
  },
});
