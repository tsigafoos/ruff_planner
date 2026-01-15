import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Platform, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardScope, DashboardTemplate } from '@/types';
import { Button } from '@/components/ui';

interface DashboardCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (dashboardId: string) => void;
  projects?: { id: string; name: string; icon?: string; color?: string }[];
  userId: string;
}

const EMOJI_OPTIONS = ['📊', '📈', '📋', '🎯', '🚀', '💼', '🔧', '📁', '⭐', '🌐', '🏠', '📌'];

const TEMPLATE_OPTIONS: { key: DashboardTemplate; label: string; description: string; icon: string }[] = [
  { key: 'blank', label: 'Blank', description: 'Start from scratch', icon: 'square-o' },
  { key: 'agile', label: 'Agile', description: 'Kanban, Burndown, Sprint Stats', icon: 'columns' },
  { key: 'waterfall', label: 'Waterfall', description: 'Gantt, Status Lanes, Calendar', icon: 'bar-chart' },
  { key: 'maintenance', label: 'Maintenance', description: 'Task List, Team Waiting', icon: 'wrench' },
];

/**
 * DashboardCreationModal - Modal for creating a new custom dashboard
 */
export default function DashboardCreationModal({
  visible,
  onClose,
  onCreated,
  projects = [],
  userId,
}: DashboardCreationModalProps) {
  const theme = useTheme();
  const { createDashboard, setEditMode } = useDashboardStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📊');
  const [scope, setScope] = useState<DashboardScope>('global');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [template, setTemplate] = useState<DashboardTemplate>('blank');
  const [laneCount, setLaneCount] = useState(3);
  const [step, setStep] = useState<'basic' | 'lanes'>('basic');

  const resetForm = () => {
    setName('');
    setEmoji('📊');
    setScope('global');
    setSelectedProjectId('');
    setTemplate('blank');
    setLaneCount(3);
    setStep('basic');
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const dashboard = createDashboard(name.trim(), {
      template,
      scope,
      projectId: scope === 'project' ? selectedProjectId : undefined,
      emoji,
      laneCount: template === 'blank' ? laneCount : undefined,
      userId,
    });

    // Enable edit mode for new dashboard
    setEditMode(true);

    onCreated?.(dashboard.id);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.text }]}>
                {step === 'basic' ? 'Create Dashboard' : 'Configure Lanes'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {step === 'basic' ? 'Set up your custom dashboard' : 'How many lanes do you want?'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <FontAwesome name="times" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator>
            {step === 'basic' ? (
              <>
                {/* Name & Emoji */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>Dashboard Name</Text>
                  <View style={styles.nameRow}>
                    <View style={styles.emojiPicker}>
                      <Text style={styles.currentEmoji}>{emoji}</Text>
                    </View>
                    <TextInput
                      style={[styles.nameInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                      placeholder="e.g., My Custom Dashboard"
                      placeholderTextColor={theme.textTertiary}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  
                  {/* Emoji Options */}
                  <View style={styles.emojiOptions}>
                    {EMOJI_OPTIONS.map((e) => (
                      <TouchableOpacity
                        key={e}
                        style={[
                          styles.emojiOption,
                          { backgroundColor: emoji === e ? theme.primary + '20' : theme.surfaceSecondary },
                        ]}
                        onPress={() => setEmoji(e)}
                      >
                        <Text style={styles.emojiOptionText}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Scope */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>Dashboard Scope</Text>
                  <View style={styles.scopeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.scopeOption,
                        { 
                          backgroundColor: scope === 'global' ? theme.primary + '15' : theme.surfaceSecondary,
                          borderColor: scope === 'global' ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setScope('global')}
                    >
                      <FontAwesome name="globe" size={18} color={scope === 'global' ? theme.primary : theme.textSecondary} />
                      <Text style={[styles.scopeLabel, { color: scope === 'global' ? theme.primary : theme.text }]}>
                        Global
                      </Text>
                      <Text style={[styles.scopeDesc, { color: theme.textTertiary }]}>
                        Shows all your tasks
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.scopeOption,
                        { 
                          backgroundColor: scope === 'project' ? theme.primary + '15' : theme.surfaceSecondary,
                          borderColor: scope === 'project' ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setScope('project')}
                    >
                      <FontAwesome name="folder" size={18} color={scope === 'project' ? theme.primary : theme.textSecondary} />
                      <Text style={[styles.scopeLabel, { color: scope === 'project' ? theme.primary : theme.text }]}>
                        Project
                      </Text>
                      <Text style={[styles.scopeDesc, { color: theme.textTertiary }]}>
                        For a specific project
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Project Selector */}
                  {scope === 'project' && (
                    <View style={[styles.projectSelector, { borderColor: theme.border }]}>
                      <Text style={[styles.projectSelectorLabel, { color: theme.textSecondary }]}>
                        Select Project
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {projects.map((project) => (
                          <TouchableOpacity
                            key={project.id}
                            style={[
                              styles.projectOption,
                              { 
                                backgroundColor: selectedProjectId === project.id ? (project.color || theme.primary) + '15' : theme.surfaceSecondary,
                                borderColor: selectedProjectId === project.id ? project.color || theme.primary : theme.border,
                              },
                            ]}
                            onPress={() => setSelectedProjectId(project.id)}
                          >
                            <FontAwesome 
                              name={(project.icon || 'folder') as any} 
                              size={12} 
                              color={project.color || theme.primary} 
                            />
                            <Text 
                              style={[styles.projectOptionText, { color: theme.text }]}
                              numberOfLines={1}
                            >
                              {project.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Template */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>Start From</Text>
                  <View style={styles.templateOptions}>
                    {TEMPLATE_OPTIONS.map((t) => (
                      <TouchableOpacity
                        key={t.key}
                        style={[
                          styles.templateOption,
                          { 
                            backgroundColor: template === t.key ? theme.primary + '15' : theme.surfaceSecondary,
                            borderColor: template === t.key ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setTemplate(t.key)}
                      >
                        <FontAwesome 
                          name={t.icon as any} 
                          size={16} 
                          color={template === t.key ? theme.primary : theme.textSecondary} 
                        />
                        <Text style={[styles.templateLabel, { color: template === t.key ? theme.primary : theme.text }]}>
                          {t.label}
                        </Text>
                        <Text style={[styles.templateDesc, { color: theme.textTertiary }]}>
                          {t.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Lane Count */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>Number of Lanes (Rows)</Text>
                  <Text style={[styles.labelDesc, { color: theme.textSecondary }]}>
                    Each lane can hold multiple widgets side by side
                  </Text>
                  
                  <View style={styles.laneCountSelector}>
                    <TouchableOpacity
                      style={[styles.laneCountButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setLaneCount(Math.max(1, laneCount - 1))}
                    >
                      <FontAwesome name="minus" size={14} color={theme.text} />
                    </TouchableOpacity>
                    
                    <View style={[styles.laneCountDisplay, { backgroundColor: theme.primary + '15' }]}>
                      <Text style={[styles.laneCountValue, { color: theme.primary }]}>{laneCount}</Text>
                      <Text style={[styles.laneCountLabel, { color: theme.textSecondary }]}>lanes</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.laneCountButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setLaneCount(Math.min(10, laneCount + 1))}
                    >
                      <FontAwesome name="plus" size={14} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Lane Preview */}
                  <View style={styles.lanePreview}>
                    {Array.from({ length: laneCount }).map((_, i) => (
                      <View 
                        key={i}
                        style={[styles.lanePreviewItem, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                      >
                        <Text style={[styles.lanePreviewText, { color: theme.textTertiary }]}>
                          Lane {i + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            {step === 'basic' ? (
              <>
                <Button title="Cancel" variant="secondary" onPress={handleClose} />
                <Button 
                  title={template === 'blank' ? 'Next: Configure Lanes' : 'Create Dashboard'}
                  onPress={() => {
                    if (template === 'blank') {
                      setStep('lanes');
                    } else {
                      handleCreate();
                    }
                  }}
                  disabled={!name.trim() || (scope === 'project' && !selectedProjectId)}
                />
              </>
            ) : (
              <>
                <Button title="Back" variant="secondary" onPress={() => setStep('basic')} />
                <Button title="Create Dashboard" onPress={handleCreate} />
              </>
            )}
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
    width: Platform.OS === 'web' ? 520 : '92%',
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emojiPicker: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  currentEmoji: {
    fontSize: 24,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  emojiOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: {
    fontSize: 18,
  },
  scopeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  scopeOption: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 6,
  },
  scopeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  scopeDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  projectSelector: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  projectSelectorLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  projectOptionText: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 100,
  },
  templateOptions: {
    gap: 10,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  templateLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  templateDesc: {
    fontSize: 11,
    flex: 1,
  },
  laneCountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  laneCountButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laneCountDisplay: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  laneCountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  laneCountLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  lanePreview: {
    gap: 8,
  },
  lanePreviewItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  lanePreviewText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
});
