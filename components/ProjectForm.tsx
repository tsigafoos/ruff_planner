import { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Input from './ui/Input';
import Button from './ui/Button';
import DatePicker from './ui/DatePicker';
import { useTheme } from './useTheme';

interface ProjectFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => Promise<void>;
  initialData?: any;
}

export default function ProjectForm({
  visible,
  onClose,
  onSubmit,
  initialData,
}: ProjectFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('folder');
  const [projectType, setProjectType] = useState<'waterfall' | 'agile' | 'maintenance'>('waterfall');
  const [loading, setLoading] = useState(false);

  // Key questions at top
  const [problemAndAudience, setProblemAndAudience] = useState('');
  const [mvpScopeAndSuccess, setMvpScopeAndSuccess] = useState('');
  const [deadlinesAndBudget, setDeadlinesAndBudget] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [risks, setRisks] = useState('');

  // Basic info
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const icons = ['folder-open', 'briefcase', 'code', 'server', 'globe', 'shopping-cart', 'utensils', 'dumbbell', 'book', 'graduation-cap', 'medkit', 'car', 'home', 'gamepad', 'music', 'camera', 'comments', 'wallet', 'tools', 'rocket'];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setColor(initialData.color || '#3B82F6');
      setIcon(initialData.icon || 'folder');
      setProjectType((initialData.project_type || initialData.projectType || 'waterfall') as 'waterfall' | 'agile' | 'maintenance');
      setStartDate(initialData.start_date ? new Date(initialData.start_date) : (initialData.startDate ? new Date(initialData.startDate) : undefined));
      setEndDate(initialData.end_date ? new Date(initialData.end_date) : (initialData.endDate ? new Date(initialData.endDate) : undefined));
      
      // Set key questions from existing data
      setProblemAndAudience(initialData.objective || '');
      setMvpScopeAndSuccess(initialData.success_criteria ? (Array.isArray(initialData.success_criteria) ? initialData.success_criteria.join('\n') : JSON.stringify(initialData.success_criteria)) : '');
      setDeadlinesAndBudget(initialData.constraints || '');
      setStakeholders(initialData.team_roles ? (Array.isArray(initialData.team_roles) ? initialData.team_roles.map((r: any) => typeof r === 'string' ? r : r.name || '').join('\n') : JSON.stringify(initialData.team_roles)) : '');
      setRisks(initialData.risks ? (Array.isArray(initialData.risks) ? initialData.risks.join('\n') : JSON.stringify(initialData.risks)) : '');
    } else {
      setName('');
      setColor('#3B82F6');
      setIcon('folder');
      setProjectType('waterfall');
      setStartDate(undefined);
      setEndDate(undefined);
      setProblemAndAudience('');
      setMvpScopeAndSuccess('');
      setDeadlinesAndBudget('');
      setStakeholders('');
      setRisks('');
    }
  }, [initialData, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Parse the key questions into structured data
      const objective = problemAndAudience.trim() || null;
      const successCriteria = mvpScopeAndSuccess.trim() ? mvpScopeAndSuccess.split('\n').filter(line => line.trim()) : [];
      const constraints = deadlinesAndBudget.trim() || null;
      const teamRoles = stakeholders.trim() ? stakeholders.split('\n').filter(line => line.trim()).map(name => ({ name: name.trim() })) : [];
      const risksList = risks.trim() ? risks.split('\n').filter(line => line.trim()) : [];

      // Build the update object - only include fields that are actually edited
      const projectData: any = {
        name,
        color,
        icon,
        projectType,
        objective,
        successCriteria,
        constraints,
        teamRoles,
        risks: risksList,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      // When creating a new project, set defaults for other fields
      // When editing, don't overwrite existing data like resources, documentation, etc.
      if (!initialData) {
        projectData.scopeIn = null;
        projectData.scopeOut = null;
        projectData.deliverables = [];
        projectData.milestones = [];
        projectData.resources = [];
        projectData.dependencies = [];
        projectData.assumptions = [];
        projectData.documentation = [];
        projectData.teamManagement = null;
      }

      await onSubmit(projectData);
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setLoading(false);
    }
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
              {initialData ? 'Edit Project' : 'New Project'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {/* Key Questions Section - only for Waterfall and Agile */}
            {projectType !== 'maintenance' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Questions</Text>
              
              <View style={styles.questionBlock}>
                <Text style={[styles.questionLabel, { color: theme.text }]}>
                  What problem are we solving, and for whom?
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.surfaceSecondary, 
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={problemAndAudience}
                  onChangeText={setProblemAndAudience}
                  placeholder="Describe the problem and target audience..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.questionBlock}>
                <Text style={[styles.questionLabel, { color: theme.text }]}>
                  What is the minimum viable scope and success criteria?
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.surfaceSecondary, 
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={mvpScopeAndSuccess}
                  onChangeText={setMvpScopeAndSuccess}
                  placeholder="List scope items and success criteria (one per line)..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.questionBlock}>
                <Text style={[styles.questionLabel, { color: theme.text }]}>
                  What are the hard deadlines and budget constraints?
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.surfaceSecondary, 
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={deadlinesAndBudget}
                  onChangeText={setDeadlinesAndBudget}
                  placeholder="Describe deadlines and budget constraints..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.questionBlock}>
                <Text style={[styles.questionLabel, { color: theme.text }]}>
                  Who are the key stakeholders and decision makers?
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.surfaceSecondary, 
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={stakeholders}
                  onChangeText={setStakeholders}
                  placeholder="List stakeholders (one per line)..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.questionBlock}>
                <Text style={[styles.questionLabel, { color: theme.text }]}>
                  What are the biggest technical or external risks right now?
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: theme.surfaceSecondary, 
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  value={risks}
                  onChangeText={setRisks}
                  placeholder="List risks (one per line)..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            )}

            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
              
              <Input
                label="Project Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter project name"
              />

              <View style={styles.typeSection}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Project Type</Text>
                {/* Show transition note when editing existing project and changing type */}
                {initialData && projectType !== (initialData.project_type || initialData.projectType || 'waterfall') && (
                  <View style={[styles.transitionNote, { backgroundColor: theme.accent + '15', borderColor: theme.accent }]}>
                    <FontAwesome name="info-circle" size={12} color={theme.accent} />
                    <Text style={[styles.transitionNoteText, { color: theme.accent }]}>
                      Switching modes will keep existing task data but show different UI views
                    </Text>
                  </View>
                )}
                <View style={styles.typeOptions}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: projectType === 'waterfall' ? theme.primary + '20' : theme.surfaceSecondary,
                        borderColor: projectType === 'waterfall' ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setProjectType('waterfall')}
                  >
                    <FontAwesome name="list-ol" size={14} color={projectType === 'waterfall' ? theme.primary : theme.textSecondary} style={{ marginBottom: 4 }} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: projectType === 'waterfall' ? theme.primary : theme.text,
                          fontWeight: projectType === 'waterfall' ? '600' : '400',
                        },
                      ]}
                    >
                      Waterfall
                    </Text>
                    <Text style={[styles.typeOptionHint, { color: theme.textTertiary }]}>Sequential phases</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: projectType === 'agile' ? theme.primary + '20' : theme.surfaceSecondary,
                        borderColor: projectType === 'agile' ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setProjectType('agile')}
                  >
                    <FontAwesome name="refresh" size={14} color={projectType === 'agile' ? theme.primary : theme.textSecondary} style={{ marginBottom: 4 }} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: projectType === 'agile' ? theme.primary : theme.text,
                          fontWeight: projectType === 'agile' ? '600' : '400',
                        },
                      ]}
                    >
                      Agile
                    </Text>
                    <Text style={[styles.typeOptionHint, { color: theme.textTertiary }]}>Iterative sprints</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: projectType === 'maintenance' ? theme.primary + '20' : theme.surfaceSecondary,
                        borderColor: projectType === 'maintenance' ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setProjectType('maintenance')}
                  >
                    <FontAwesome name="wrench" size={14} color={projectType === 'maintenance' ? theme.primary : theme.textSecondary} style={{ marginBottom: 4 }} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: projectType === 'maintenance' ? theme.primary : theme.text,
                          fontWeight: projectType === 'maintenance' ? '600' : '400',
                        },
                      ]}
                    >
                      Maintenance
                    </Text>
                    <Text style={[styles.typeOptionHint, { color: theme.textTertiary }]}>Issue tracking</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />

              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
              
              <View style={styles.colorSection}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
                <View style={styles.colorOptions}>
                  {colors.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: c,
                          borderColor: color === c ? theme.text : 'transparent',
                          borderWidth: color === c ? 3 : 0,
                        },
                      ]}
                      onPress={() => setColor(c)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.iconSection}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Icon</Text>
                <View style={styles.iconOptions}>
                  {icons.map((i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: icon === i ? theme.primary + '20' : theme.surfaceSecondary,
                          borderColor: icon === i ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setIcon(i)}
                    >
                      <FontAwesome
                        name={i as any}
                        size={20}
                        color={icon === i ? theme.primary : theme.text}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
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
    width: Platform.OS === 'web' ? 700 : '90%',
    maxWidth: Platform.OS === 'web' ? 700 : '100%',
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: Platform.OS === 'web' ? 14 : 16,
    minHeight: 100,
    width: '100%',
  },
  label: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  typeSection: {
    marginBottom: 20,
  },
  transitionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  transitionNoteText: {
    flex: 1,
    fontSize: 12,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: Platform.OS === 'web' ? 120 : 100,
  },
  typeOptionText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '500',
  },
  typeOptionHint: {
    fontSize: Platform.OS === 'web' ? 10 : 11,
    marginTop: 2,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconSection: {
    marginBottom: 0,
  },
  iconOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
});
