import { useEffect, useState, useMemo } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from './ui/Button';
import DatePicker from './ui/DatePicker';
import Input from './ui/Input';
import PriorityPicker from './ui/PriorityPicker';
import { useTheme } from './useTheme';
import { ProjectPhase, MaintenanceCategory, RecurrenceConfig, RecurrenceInterval, DayOfWeek } from '../types';
import { AGILE_PHASES } from '../store/taskStore';
import { getDefaultRecurrence, getRecurrenceDescription, RECURRENCE_PRESETS } from '../lib/recurrence';

type TaskStatus = 'to_do' | 'in_progress' | 'blocked' | 'on_hold' | 'completed' | 'cancelled';

// Category options for Maintenance projects
const CATEGORY_OPTIONS: { value: MaintenanceCategory; label: string; icon: string; color: string }[] = [
  { value: 'bug', label: 'Bug', icon: '🐛', color: '#EF4444' },
  { value: 'enhancement', label: 'Enhancement', icon: '✨', color: '#8B5CF6' },
  { value: 'support', label: 'Support', icon: '🎧', color: '#0EA5E9' },
  { value: 'other', label: 'Other', icon: '📋', color: '#6B7280' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'to_do', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Phase options for Agile projects with subtle mood-based colors
const PHASE_OPTIONS: { value: ProjectPhase; label: string; color: string }[] = [
  { value: 'brainstorm', label: 'Brainstorm', color: '#E9D5FF' }, // pale lavender
  { value: 'design', label: 'Design', color: '#DBEAFE' }, // soft blue
  { value: 'logic', label: 'Logic', color: '#D1FAE5' }, // soft green
  { value: 'polish', label: 'Polish', color: '#FEF3C7' }, // soft amber
  { value: 'done', label: 'Done', color: '#E5E7EB' }, // gray
];

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
  initialData?: any;
  projects?: any[];
  labels?: any[];
}

export default function TaskForm({
  visible,
  onClose,
  onSubmit,
  initialData,
  projects = [],
  labels = [],
}: TaskFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState(1);
  const [status, setStatus] = useState<TaskStatus>('to_do');
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectPhase, setProjectPhase] = useState<ProjectPhase | null>(null);
  const [category, setCategory] = useState<MaintenanceCategory | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Recurrence state
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('weekly');
  const [recurrenceCustomDays, setRecurrenceCustomDays] = useState(7);
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number | undefined>();
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();
  const [recurrenceEndAfter, setRecurrenceEndAfter] = useState<number | undefined>();
  const [showRecurrenceDetails, setShowRecurrenceDetails] = useState(false);

  // Determine if the selected project is Agile
  const selectedProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p: any) => p.id === projectId) || null;
  }, [projectId, projects]);

  const isAgileProject = useMemo(() => {
    if (!selectedProject) return false;
    // Check both camelCase and snake_case for project_type
    const projectType = selectedProject.projectType || selectedProject.project_type;
    return projectType === 'agile';
  }, [selectedProject]);

  const isMaintenanceProject = useMemo(() => {
    if (!selectedProject) return false;
    const projectType = selectedProject.projectType || selectedProject.project_type;
    return projectType === 'maintenance';
  }, [selectedProject]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : (initialData.start_date ? new Date(initialData.start_date) : new Date()));
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : (initialData.due_date ? new Date(initialData.due_date) : undefined));
      setPriority(initialData.priority || 1);
      setProjectId(initialData.projectId || initialData.project_id);
      setProjectPhase(initialData.projectPhase || initialData.project_phase || null);
      setCategory(initialData.category || null);
      setSelectedLabels(initialData.labelIds || initialData.label_ids || []);
      const isCompleted = !!(initialData.completed_at || initialData.completedAt || initialData.completed);
      setCompleted(isCompleted);
      // Set status from initialData, defaulting based on completed status
      if (initialData.status) {
        setStatus(initialData.status);
      } else if (isCompleted) {
        setStatus('completed');
      } else {
        setStatus('to_do');
      }
    } else {
      setTitle('');
      setDescription('');
      setStartDate(new Date()); // Default to current date
      setDueDate(undefined);
      setPriority(1);
      setProjectId(undefined);
      setProjectPhase(null);
      setCategory(null);
      setSelectedLabels([]);
      setCompleted(false);
      setStatus('to_do');
      // Reset recurrence
      setRecurrenceEnabled(false);
      setRecurrenceInterval('weekly');
      setRecurrenceCustomDays(7);
      setRecurrenceDaysOfWeek([]);
      setRecurrenceDayOfMonth(undefined);
      setRecurrenceEndDate(undefined);
      setRecurrenceEndAfter(undefined);
      setShowRecurrenceDetails(false);
    }
    
    // Load recurrence from initialData
    if (initialData?.recurrence) {
      const rec = initialData.recurrence;
      setRecurrenceEnabled(rec.enabled || false);
      setRecurrenceInterval(rec.interval || 'weekly');
      setRecurrenceCustomDays(rec.customDays || 7);
      setRecurrenceDaysOfWeek(rec.daysOfWeek || []);
      setRecurrenceDayOfMonth(rec.dayOfMonth);
      setRecurrenceEndDate(rec.endDate ? new Date(rec.endDate) : undefined);
      setRecurrenceEndAfter(rec.endAfterOccurrences);
      setShowRecurrenceDetails(rec.enabled || false);
    }
  }, [initialData, visible]);

  // Auto-set phase to 'brainstorm' when switching to an Agile project (for new tasks)
  useEffect(() => {
    if (isAgileProject && !projectPhase && !initialData) {
      setProjectPhase('brainstorm');
    } else if (!isAgileProject) {
      setProjectPhase(null);
    }
  }, [isAgileProject, initialData]);

  // Auto-set category to 'other' when switching to a Maintenance project (for new tasks)
  useEffect(() => {
    if (isMaintenanceProject && !category && !initialData) {
      setCategory('other');
    } else if (!isMaintenanceProject) {
      setCategory(null);
    }
  }, [isMaintenanceProject, initialData]);

  // Build recurrence config from state
  const buildRecurrenceConfig = (): RecurrenceConfig | undefined => {
    if (!recurrenceEnabled) return undefined;
    
    return {
      enabled: true,
      interval: recurrenceInterval,
      customDays: recurrenceInterval === 'custom' ? recurrenceCustomDays : undefined,
      daysOfWeek: recurrenceInterval === 'weekly' ? recurrenceDaysOfWeek : undefined,
      dayOfMonth: recurrenceInterval === 'monthly' ? recurrenceDayOfMonth : undefined,
      endDate: recurrenceEndDate,
      endAfterOccurrences: recurrenceEndAfter,
      regenerateOnComplete: true,
      preserveTime: true,
    };
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        startDate: startDate?.toISOString(),
        dueDate: dueDate?.toISOString(),
        priority,
        status,
        projectId,
        projectPhase: isAgileProject ? projectPhase : null, // Only include phase for Agile projects
        category: isMaintenanceProject ? category : null, // Only include category for Maintenance projects
        labelIds: selectedLabels,
        completed: status === 'completed' || completed,
        recurrence: buildRecurrenceConfig(),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      visible={visible}
      animationType={isWeb ? 'fade' : 'slide'}
      transparent={!isWeb}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: isWeb ? 'rgba(0, 0, 0, 0.5)' : 'transparent' }]}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {initialData ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              autoFocus
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Task description (optional)"
              multiline
              numberOfLines={4}
            />

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Status</Text>
              <View style={styles.statusOptions}>
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        {
                          backgroundColor: isSelected ? theme.primary + '20' : theme.surfaceSecondary,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setStatus(option.value);
                        // Auto-set completed when status is 'completed'
                        if (option.value === 'completed') {
                          setCompleted(true);
                          // Also set phase to 'done' for Agile projects
                          if (isAgileProject) {
                            setProjectPhase('done');
                          }
                        } else if (status === 'completed' && option.value !== 'completed') {
                          setCompleted(false);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          {
                            color: isSelected ? theme.primary : theme.text,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Phase picker - only shown for Agile projects */}
            {isAgileProject && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Workflow Phase (Agile)
                </Text>
                <View style={styles.phaseOptions}>
                  {PHASE_OPTIONS.map((option) => {
                    const isSelected = projectPhase === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.phaseOption,
                          {
                            backgroundColor: isSelected ? option.color : theme.surfaceSecondary,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => {
                          setProjectPhase(option.value);
                          // Auto-complete when selecting 'done' phase
                          if (option.value === 'done') {
                            setStatus('completed');
                            setCompleted(true);
                          } else if (projectPhase === 'done' && option.value !== 'done') {
                            // Moving out of 'done' - revert to in_progress
                            setStatus('in_progress');
                            setCompleted(false);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.phaseOptionText,
                            {
                              color: isSelected ? theme.text : theme.textSecondary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Category picker - only shown for Maintenance projects */}
            {isMaintenanceProject && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Issue Category
                </Text>
                <View style={styles.categoryOptions}>
                  {CATEGORY_OPTIONS.map((option) => {
                    const isSelected = category === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor: isSelected ? option.color + '20' : theme.surfaceSecondary,
                            borderColor: isSelected ? option.color : theme.border,
                          },
                        ]}
                        onPress={() => setCategory(option.value)}
                      >
                        <Text style={styles.categoryOptionIcon}>{option.icon}</Text>
                        <Text
                          style={[
                            styles.categoryOptionText,
                            {
                              color: isSelected ? option.color : theme.text,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
            />

            {/* Recurrence Section */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.recurrenceToggle, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                onPress={() => {
                  setRecurrenceEnabled(!recurrenceEnabled);
                  setShowRecurrenceDetails(!recurrenceEnabled);
                }}
              >
                <FontAwesome 
                  name="refresh" 
                  size={16} 
                  color={recurrenceEnabled ? theme.primary : theme.textSecondary} 
                />
                <Text style={[styles.recurrenceToggleText, { color: recurrenceEnabled ? theme.primary : theme.text }]}>
                  {recurrenceEnabled ? 'Recurring Task' : 'Make Recurring'}
                </Text>
                {recurrenceEnabled && (
                  <Text style={[styles.recurrenceDesc, { color: theme.textSecondary }]}>
                    {getRecurrenceDescription({
                      enabled: true,
                      interval: recurrenceInterval,
                      customDays: recurrenceCustomDays,
                      daysOfWeek: recurrenceDaysOfWeek,
                      dayOfMonth: recurrenceDayOfMonth,
                      endDate: recurrenceEndDate,
                      endAfterOccurrences: recurrenceEndAfter,
                      regenerateOnComplete: true,
                      preserveTime: true,
                    })}
                  </Text>
                )}
                <FontAwesome 
                  name={showRecurrenceDetails ? 'chevron-up' : 'chevron-down'} 
                  size={12} 
                  color={theme.textTertiary} 
                />
              </TouchableOpacity>

              {showRecurrenceDetails && recurrenceEnabled && (
                <View style={[styles.recurrenceDetails, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                  {/* Quick Presets */}
                  <Text style={[styles.recurrenceLabel, { color: theme.textSecondary }]}>Repeat</Text>
                  <View style={styles.recurrencePresets}>
                    {RECURRENCE_PRESETS.map((preset) => {
                      const isSelected = recurrenceInterval === preset.config.interval && 
                        (preset.config.interval !== 'weekly' || 
                          JSON.stringify(recurrenceDaysOfWeek.sort()) === JSON.stringify((preset.config.daysOfWeek || []).sort()));
                      return (
                        <TouchableOpacity
                          key={preset.label}
                          style={[
                            styles.recurrencePresetBtn,
                            { 
                              backgroundColor: isSelected ? theme.primary : theme.surface,
                              borderColor: isSelected ? theme.primary : theme.border,
                            }
                          ]}
                          onPress={() => {
                            setRecurrenceInterval(preset.config.interval || 'weekly');
                            setRecurrenceDaysOfWeek(preset.config.daysOfWeek || []);
                          }}
                        >
                          <Text style={[
                            styles.recurrencePresetText,
                            { color: isSelected ? '#fff' : theme.text }
                          ]}>
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Custom Days Input */}
                  {recurrenceInterval === 'custom' && (
                    <View style={styles.recurrenceCustomRow}>
                      <Text style={[styles.recurrenceLabel, { color: theme.textSecondary }]}>Every</Text>
                      <View style={styles.recurrenceCustomInput}>
                        <TouchableOpacity
                          style={[styles.recurrenceStepBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => setRecurrenceCustomDays(Math.max(1, recurrenceCustomDays - 1))}
                        >
                          <Text style={{ color: theme.text }}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.recurrenceCustomValue, { color: theme.text }]}>
                          {recurrenceCustomDays}
                        </Text>
                        <TouchableOpacity
                          style={[styles.recurrenceStepBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => setRecurrenceCustomDays(recurrenceCustomDays + 1)}
                        >
                          <Text style={{ color: theme.text }}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.recurrenceLabel, { color: theme.textSecondary }]}>days</Text>
                    </View>
                  )}

                  {/* End Condition */}
                  <View style={styles.recurrenceEndSection}>
                    <Text style={[styles.recurrenceLabel, { color: theme.textSecondary }]}>End</Text>
                    <View style={styles.recurrenceEndOptions}>
                      <TouchableOpacity
                        style={[
                          styles.recurrenceEndBtn,
                          { 
                            backgroundColor: !recurrenceEndDate && !recurrenceEndAfter ? theme.primary : theme.surface,
                            borderColor: !recurrenceEndDate && !recurrenceEndAfter ? theme.primary : theme.border,
                          }
                        ]}
                        onPress={() => {
                          setRecurrenceEndDate(undefined);
                          setRecurrenceEndAfter(undefined);
                        }}
                      >
                        <Text style={[
                          styles.recurrenceEndBtnText,
                          { color: !recurrenceEndDate && !recurrenceEndAfter ? '#fff' : theme.text }
                        ]}>
                          Never
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.recurrenceEndBtn,
                          { 
                            backgroundColor: recurrenceEndAfter ? theme.primary : theme.surface,
                            borderColor: recurrenceEndAfter ? theme.primary : theme.border,
                          }
                        ]}
                        onPress={() => {
                          setRecurrenceEndAfter(recurrenceEndAfter ? undefined : 10);
                          setRecurrenceEndDate(undefined);
                        }}
                      >
                        <Text style={[
                          styles.recurrenceEndBtnText,
                          { color: recurrenceEndAfter ? '#fff' : theme.text }
                        ]}>
                          After {recurrenceEndAfter || 10}x
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <PriorityPicker
              label="Priority"
              value={priority}
              onChange={setPriority}
            />

            {projects.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Project</Text>
                <View style={styles.options}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      {
                        backgroundColor: !projectId ? theme.primary + '20' : theme.surfaceSecondary,
                        borderColor: !projectId ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setProjectId(undefined)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: !projectId ? theme.primary : theme.text,
                          fontWeight: !projectId ? '600' : '400',
                        },
                      ]}
                    >
                      No Project
                    </Text>
                  </TouchableOpacity>
                  {projects.map((project) => {
                    const isSelected = projectId === project.id;
                    return (
                      <TouchableOpacity
                        key={project.id}
                        style={[
                          styles.option,
                          {
                            backgroundColor: isSelected ? theme.primary + '20' : theme.surfaceSecondary,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setProjectId(project.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color: isSelected ? theme.primary : theme.text,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {project.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {labels.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Labels</Text>
                <View style={styles.options}>
                  {labels.map((label) => {
                    const isSelected = selectedLabels.includes(label.id);
                    return (
                      <TouchableOpacity
                        key={label.id}
                        style={[
                          styles.option,
                          {
                            backgroundColor: isSelected ? theme.primary + '20' : theme.surfaceSecondary,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => toggleLabel(label.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color: isSelected ? theme.primary : theme.text,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {label.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {initialData && (
              <View style={styles.section}>
                <View style={styles.completedContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      {
                        borderColor: completed ? theme.primary : theme.border,
                        backgroundColor: completed ? theme.primary : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      const newCompleted = !completed;
                      setCompleted(newCompleted);
                      if (newCompleted) {
                        setStatus('completed');
                      } else if (status === 'completed') {
                        setStatus('to_do');
                      }
                    }}
                  >
                    {completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={[styles.completedText, { color: theme.text }]}>Completed</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              title={initialData ? 'Update' : 'Create'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.footerButton}
            />
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
    width: Platform.OS === 'web' ? 600 : '90%',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    maxHeight: Platform.OS === 'web' ? '90vh' : '90%',
    borderRadius: Platform.OS === 'web' ? 12 : 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: Platform.OS === 'web' ? 28 : 32,
    lineHeight: Platform.OS === 'web' ? 28 : 32,
  },
  content: {
    padding: Platform.OS === 'web' ? 20 : 16,
    maxHeight: Platform.OS === 'web' ? 'calc(90vh - 140px)' : undefined,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: Platform.OS === 'web' ? 14 : 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: Platform.OS === 'web' ? 120 : 100,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
  },
  phaseOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phaseOption: {
    paddingHorizontal: Platform.OS === 'web' ? 16 : 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: Platform.OS === 'web' ? 100 : 90,
    alignItems: 'center',
  },
  phaseOptionText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Platform.OS === 'web' ? 14 : 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: Platform.OS === 'web' ? 120 : 100,
  },
  categoryOptionIcon: {
    fontSize: 14,
  },
  categoryOptionText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: Platform.OS === 'web' ? 13 : 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 100,
  },
  // Recurrence styles
  recurrenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recurrenceToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recurrenceDesc: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  recurrenceDetails: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  recurrenceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  recurrencePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recurrencePresetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  recurrencePresetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recurrenceCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recurrenceCustomInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurrenceStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurrenceCustomValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  recurrenceEndSection: {
    marginTop: 4,
  },
  recurrenceEndOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  recurrenceEndBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  recurrenceEndBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
