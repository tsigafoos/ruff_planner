import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from './useTheme';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import { useProfileStore } from '@/store/profileStore';
import Button from './ui/Button';
import Input from './ui/Input';
import { ProjectShareRole, ProjectShare, Team } from '@/types';

const ROLE_OPTIONS: { value: ProjectShareRole; label: string; description: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view project and tasks' },
  { value: 'commenter', label: 'Commenter', description: 'Can view and add comments' },
  { value: 'editor', label: 'Editor', description: 'Can edit tasks' },
  { value: 'co_owner', label: 'Co-owner', description: 'Full project control' },
];

interface ShareProjectModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function ShareProjectModal({
  visible,
  onClose,
  projectId,
  projectName,
}: ShareProjectModalProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { profile, loading: profileLoading, fetchProfile } = useProfileStore();
  const { 
    teams, 
    fetchTeams,
    projectShares,
    fetchProjectShares,
    shareProjectWithTeam,
    updateShareRole,
    removeShare,
  } = useTeamStore();

  const [shareMode, setShareMode] = useState<'team' | 'individual'>('team');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ProjectShareRole>('editor');
  const [email, setEmail] = useState('');
  const [sharing, setSharing] = useState(false);

  // Check if team mode is enabled
  const teamModeEnabled = profile?.team_mode_enabled;

  useEffect(() => {
    if (visible && user?.id) {
      // Fetch latest profile to check team_mode_enabled
      fetchProfile(user.id);
      fetchTeams(user.id);
      fetchProjectShares(projectId);
    }
  }, [visible, user?.id, projectId]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams]);

  const handleShareWithTeam = async () => {
    if (!selectedTeamId) return;
    setSharing(true);
    try {
      await shareProjectWithTeam(projectId, selectedTeamId, selectedRole);
      await fetchProjectShares(projectId);
    } catch (error) {
      console.error('Error sharing with team:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleUpdateRole = async (shareId: string, role: ProjectShareRole) => {
    try {
      await updateShareRole(shareId, role);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(shareId);
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  // Get shares for this project
  const currentShares = projectShares.filter(s => s.projectId === projectId);
  const teamShareIds = currentShares.filter(s => s.teamId).map(s => s.teamId);
  const availableTeams = teams.filter(t => !teamShareIds.includes(t.id));

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!teamModeEnabled) {
    return (
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <Text style={[styles.title, { color: theme.text }]}>Share Project</Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.emptyState}>
              <FontAwesome name="users" size={32} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Team Mode Required</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Enable Team Mode in your Profile settings to share projects with others
              </Text>
            </View>
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <Button title="Close" variant="secondary" onPress={onClose} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Share Project</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{projectName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Current Shares */}
            {currentShares.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Currently shared with</Text>
                {currentShares.map(share => (
                  <View key={share.id} style={[styles.shareRow, { borderBottomColor: theme.border }]}>
                    <View style={styles.shareInfo}>
                      <FontAwesome 
                        name={share.teamId ? 'users' : 'user'} 
                        size={14} 
                        color={theme.textSecondary} 
                      />
                      <Text style={[styles.shareName, { color: theme.text }]}>
                        {share.team?.name || share.user?.email || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.shareActions}>
                      <TouchableOpacity
                        style={[styles.roleDropdown, { borderColor: theme.border }]}
                        onPress={() => {
                          // Cycle through roles
                          const currentIndex = ROLE_OPTIONS.findIndex(r => r.value === share.role);
                          const nextIndex = (currentIndex + 1) % ROLE_OPTIONS.length;
                          handleUpdateRole(share.id, ROLE_OPTIONS[nextIndex].value);
                        }}
                      >
                        <Text style={[styles.roleDropdownText, { color: theme.text }]}>
                          {ROLE_OPTIONS.find(r => r.value === share.role)?.label}
                        </Text>
                        <FontAwesome name="chevron-down" size={10} color={theme.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.removeButton]}
                        onPress={() => handleRemoveShare(share.id)}
                      >
                        <FontAwesome name="trash-o" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Add Share */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Add people or teams</Text>

              {/* Mode Tabs */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    { 
                      backgroundColor: shareMode === 'team' ? theme.primary + '20' : theme.surfaceSecondary,
                      borderColor: shareMode === 'team' ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setShareMode('team')}
                >
                  <FontAwesome name="users" size={14} color={shareMode === 'team' ? theme.primary : theme.textSecondary} />
                  <Text style={[styles.modeTabText, { color: shareMode === 'team' ? theme.primary : theme.text }]}>
                    Team
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    { 
                      backgroundColor: shareMode === 'individual' ? theme.primary + '20' : theme.surfaceSecondary,
                      borderColor: shareMode === 'individual' ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setShareMode('individual')}
                >
                  <FontAwesome name="user" size={14} color={shareMode === 'individual' ? theme.primary : theme.textSecondary} />
                  <Text style={[styles.modeTabText, { color: shareMode === 'individual' ? theme.primary : theme.text }]}>
                    Individual
                  </Text>
                </TouchableOpacity>
              </View>

              {shareMode === 'team' ? (
                <>
                  {availableTeams.length === 0 ? (
                    <View style={[styles.noTeams, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.noTeamsText, { color: theme.textSecondary }]}>
                        {teams.length === 0 
                          ? 'No teams available. Create a team first.'
                          : 'All your teams already have access to this project.'}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Select Team</Text>
                      <View style={styles.teamOptions}>
                        {availableTeams.map(team => (
                          <TouchableOpacity
                            key={team.id}
                            style={[
                              styles.teamOption,
                              {
                                backgroundColor: selectedTeamId === team.id ? theme.primary + '15' : theme.surfaceSecondary,
                                borderColor: selectedTeamId === team.id ? theme.primary : theme.border,
                              }
                            ]}
                            onPress={() => setSelectedTeamId(team.id)}
                          >
                            <FontAwesome 
                              name="building" 
                              size={14} 
                              color={selectedTeamId === team.id ? theme.primary : theme.textSecondary} 
                            />
                            <Text style={[
                              styles.teamOptionText,
                              { color: selectedTeamId === team.id ? theme.primary : theme.text }
                            ]}>
                              {team.name}
                            </Text>
                            {selectedTeamId === team.id && (
                              <FontAwesome name="check" size={14} color={theme.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </>
              ) : (
                <View style={styles.individualForm}>
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="colleague@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Text style={[styles.comingSoon, { color: theme.textTertiary }]}>
                    Individual sharing coming soon. Use team sharing for now.
                  </Text>
                </View>
              )}

              {/* Role Selector */}
              {shareMode === 'team' && availableTeams.length > 0 && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>
                    Permission Level
                  </Text>
                  <View style={styles.roleOptions}>
                    {ROLE_OPTIONS.map(role => (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleOption,
                          {
                            backgroundColor: selectedRole === role.value ? theme.primary + '15' : theme.surfaceSecondary,
                            borderColor: selectedRole === role.value ? theme.primary : theme.border,
                          }
                        ]}
                        onPress={() => setSelectedRole(role.value)}
                      >
                        <View style={styles.roleOptionHeader}>
                          <Text style={[
                            styles.roleOptionLabel,
                            { color: selectedRole === role.value ? theme.primary : theme.text }
                          ]}>
                            {role.label}
                          </Text>
                          {selectedRole === role.value && (
                            <FontAwesome name="check" size={12} color={theme.primary} />
                          )}
                        </View>
                        <Text style={[styles.roleOptionDesc, { color: theme.textSecondary }]}>
                          {role.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button title="Cancel" variant="secondary" onPress={onClose} />
            <Button
              title="Share"
              onPress={handleShareWithTeam}
              loading={sharing}
              disabled={shareMode === 'team' && (!selectedTeamId || availableTeams.length === 0)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Platform.OS === 'web' ? 500 : '95%',
    maxWidth: 500,
    maxHeight: Platform.OS === 'web' ? '80vh' : '85%',
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    padding: 20,
    maxHeight: Platform.OS === 'web' ? 'calc(80vh - 160px)' : undefined,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shareName: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleDropdownText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamOptions: {
    gap: 8,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  teamOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  noTeams: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  noTeamsText: {
    fontSize: 13,
    textAlign: 'center',
  },
  individualForm: {
    gap: 8,
  },
  comingSoon: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  roleOptions: {
    gap: 8,
  },
  roleOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  roleOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleOptionDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
});
