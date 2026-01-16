import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import DatePicker from '@/components/ui/DatePicker';

interface MobileTaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
  onDelete?: () => void;
  initialData?: any;
  projects?: any[];
}

/**
 * MobileTaskForm - Compact task form for mobile
 */
export default function MobileTaskForm({
  visible,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  projects = [],
}: MobileTaskFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState(1);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : 
                 initialData.due_date ? new Date(initialData.due_date) : undefined);
      setPriority(initialData.priority || 1);
      setProjectId(initialData.projectId || initialData.project_id);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setPriority(1);
      setProjectId(undefined);
    }
  }, [initialData, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        dueDate: dueDate?.toISOString(),
        priority,
        projectId,
        status: 'to_do',
      });
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 1, label: 'High', color: '#10B981' },
    { value: 2, label: 'Medium', color: '#3B82F6' },
    { value: 3, label: 'Low', color: '#F59E0B' },
    { value: 4, label: 'None', color: '#6B7280' },
  ];

  const selectedProject = projects.find(p => p.id === projectId);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.cancelButton, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {isEditing ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={!title.trim() || loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[
                styles.saveButton, 
                { color: title.trim() ? theme.primary : theme.textTertiary },
              ]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <TextInput
              style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
              placeholder="Task title"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditing}
              returnKeyType="next"
            />

            {/* Description Input */}
            <TextInput
              style={[styles.descInput, { color: theme.text, backgroundColor: theme.surfaceSecondary }]}
              placeholder="Add description (optional)"
              placeholderTextColor={theme.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Quick Options Row */}
            <View style={styles.optionsRow}>
              {/* Due Date */}
              <View style={styles.optionItem}>
                <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>Due</Text>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  label=""
                />
              </View>
            </View>

            {/* Priority Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Priority</Text>
              <View style={styles.priorityOptions}>
                {priorities.map(p => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityOption,
                      { 
                        backgroundColor: priority === p.value ? p.color + '20' : theme.surfaceSecondary,
                        borderColor: priority === p.value ? p.color : theme.border,
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                    <Text style={[
                      styles.priorityText,
                      { color: priority === p.value ? p.color : theme.text },
                    ]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Project Selector */}
            {projects.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Project</Text>
                <TouchableOpacity
                  style={[styles.projectSelector, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={() => setShowProjects(!showProjects)}
                >
                  {selectedProject ? (
                    <View style={styles.selectedProject}>
                      <View style={[styles.projectDot, { backgroundColor: selectedProject.color }]} />
                      <Text style={[styles.projectName, { color: theme.text }]}>{selectedProject.name}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.projectPlaceholder, { color: theme.textTertiary }]}>
                      Select project (optional)
                    </Text>
                  )}
                  <FontAwesome name={showProjects ? 'chevron-up' : 'chevron-down'} size={12} color={theme.textTertiary} />
                </TouchableOpacity>

                {showProjects && (
                  <View style={[styles.projectList, { borderColor: theme.border }]}>
                    <TouchableOpacity
                      style={[styles.projectItem, { backgroundColor: !projectId ? theme.primary + '10' : 'transparent' }]}
                      onPress={() => {
                        setProjectId(undefined);
                        setShowProjects(false);
                      }}
                    >
                      <Text style={[styles.projectItemText, { color: theme.text }]}>No Project</Text>
                    </TouchableOpacity>
                    {projects.map(project => (
                      <TouchableOpacity
                        key={project.id}
                        style={[styles.projectItem, { backgroundColor: projectId === project.id ? theme.primary + '10' : 'transparent' }]}
                        onPress={() => {
                          setProjectId(project.id);
                          setShowProjects(false);
                        }}
                      >
                        <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                        <Text style={[styles.projectItemText, { color: theme.text }]}>{project.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Delete Button (for editing) */}
            {isEditing && onDelete && (
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: theme.error }]}
                onPress={onDelete}
              >
                <FontAwesome name="trash" size={16} color={theme.error} />
                <Text style={[styles.deleteButtonText, { color: theme.error }]}>Delete Task</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  descInput: {
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    minHeight: 80,
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  optionItem: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedProject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectName: {
    fontSize: 15,
  },
  projectPlaceholder: {
    fontSize: 15,
  },
  projectList: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  projectItemText: {
    fontSize: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
