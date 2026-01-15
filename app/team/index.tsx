import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import WebLayout from '@/components/layout/WebLayout';
import { Button, Input, MemberCard } from '@/components/ui';
import { Team, TeamMember, TeamInvite, TeamRole } from '@/types';

const ROLE_CONFIG: Record<TeamRole, { label: string; icon: string; color: string; description: string }> = {
  owner: { label: 'Owner', icon: 'crown', color: '#F59E0B', description: 'Full control, can delete team' },
  admin: { label: 'Admin', icon: 'shield', color: '#8B5CF6', description: 'Manage members & roles' },
  member: { label: 'Member', icon: 'user', color: '#3B82F6', description: 'Work on tasks & assign' },
  guest: { label: 'Guest', icon: 'eye', color: '#6B7280', description: 'View and comment only' },
};

export default function TeamManagementScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { 
    teams, 
    members, 
    invites, 
    loading,
    fetchTeams, 
    fetchMembers, 
    fetchInvites,
    updateTeam,
    updateMemberRole,
    removeMember,
    revokeInvite,
    resendInvite,
    currentTeam,
    setCurrentTeam,
  } = useTeamStore();

  const [editingTeam, setEditingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamNote, setTeamNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>('member');

  // Get current user's role in the team
  const currentUserMember = members.find(m => m.userId === user?.id);
  const isOwner = currentUserMember?.role === 'owner';
  const isAdmin = currentUserMember?.role === 'admin' || isOwner;

  useEffect(() => {
    if (user?.id) {
      fetchTeams(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (teams.length > 0 && !currentTeam) {
      setCurrentTeam(teams[0]);
    }
  }, [teams]);

  useEffect(() => {
    if (currentTeam) {
      fetchMembers(currentTeam.id);
      fetchInvites(currentTeam.id);
      setTeamName(currentTeam.name);
      setTeamNote(currentTeam.note || '');
    }
  }, [currentTeam?.id]);

  const handleSaveTeam = async () => {
    if (!currentTeam || !teamName.trim()) return;
    setSaving(true);
    try {
      await updateTeam(currentTeam.id, { name: teamName.trim(), note: teamNote.trim() || undefined });
      setEditingTeam(false);
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!editingMember) return;
    try {
      await updateMemberRole(editingMember.id, selectedRole);
      setEditingMember(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (Platform.OS === 'web') {
      if (confirm(`Remove ${member.user?.email || 'this member'} from the team?`)) {
        await removeMember(member.id);
      }
    } else {
      Alert.alert(
        'Remove Member',
        `Remove ${member.user?.email || 'this member'} from the team?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeMember(member.id) },
        ]
      );
    }
  };

  const handleRevokeInvite = async (invite: TeamInvite) => {
    await revokeInvite(invite.id);
  };

  const handleResendInvite = async (invite: TeamInvite) => {
    await resendInvite(invite.id);
  };

  const pendingInvites = invites.filter(i => i.status === 'pending');
  const expiredInvites = invites.filter(i => i.status === 'expired');

  if (!currentTeam) {
    const content = (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Team Management</Text>
        </View>
        <View style={styles.emptyContainer}>
          <FontAwesome name="users" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Team Selected</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Create a team in your Profile settings to get started
          </Text>
          <Button
            title="Go to Profile"
            onPress={() => router.push('/profile')}
          />
        </View>
      </View>
    );

    return Platform.OS === 'web' ? <WebLayout>{content}</WebLayout> : content;
  }

  const screenContent = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={16} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>{currentTeam.name}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.primary }]}
            onPress={() => setEditingTeam(true)}
          >
            <FontAwesome name="pencil" size={12} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator>
        {/* Team Info */}
        {currentTeam.note && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>About</Text>
            <Text style={[styles.teamNote, { color: theme.text }]}>{currentTeam.note}</Text>
          </View>
        )}

        {/* Team Switcher (if multiple teams) */}
        {teams.length > 1 && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Switch Team</Text>
            <View style={styles.teamList}>
              {teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.teamItem,
                    { 
                      backgroundColor: team.id === currentTeam.id ? theme.primary + '20' : theme.surfaceSecondary,
                      borderColor: team.id === currentTeam.id ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setCurrentTeam(team)}
                >
                  <FontAwesome 
                    name="building" 
                    size={14} 
                    color={team.id === currentTeam.id ? theme.primary : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.teamItemText, 
                    { color: team.id === currentTeam.id ? theme.primary : theme.text }
                  ]}>
                    {team.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Members */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Members</Text>
            {isAdmin && (
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/team/invite')}
              >
                <FontAwesome name="plus" size={10} color="#FFFFFF" />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            )}
          </View>

          {members.map(member => {
            const canEdit = isAdmin && member.role !== 'owner' && member.userId !== user?.id;
            const memberName = member.user?.firstName && member.user?.lastName 
              ? `${member.user.firstName} ${member.user.lastName}`
              : undefined;
            
            return (
              <MemberCard
                key={member.id}
                id={member.id}
                name={memberName}
                email={member.user?.email || 'Unknown'}
                role={member.role}
                isCurrentUser={member.userId === user?.id}
                canEdit={canEdit}
                onActionsPress={() => {
                  setEditingMember(member);
                  setSelectedRole(member.role);
                }}
              />
            );
          })}
        </View>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Invites</Text>
            {pendingInvites.map(invite => (
              <View key={invite.id} style={[styles.inviteRow, { borderBottomColor: theme.border }]}>
                <View style={styles.inviteInfo}>
                  <Text style={[styles.inviteEmail, { color: theme.text }]}>{invite.email}</Text>
                  <Text style={[styles.inviteRole, { color: theme.textSecondary }]}>
                    {ROLE_CONFIG[invite.role].label} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
                {isAdmin && (
                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={[styles.inviteActionButton, { borderColor: theme.border }]}
                      onPress={() => handleResendInvite(invite)}
                    >
                      <FontAwesome name="refresh" size={12} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.inviteActionButton, { borderColor: '#EF4444' }]}
                      onPress={() => handleRevokeInvite(invite)}
                    >
                      <FontAwesome name="times" size={12} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Expired Invites */}
        {expiredInvites.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Expired Invites</Text>
            {expiredInvites.map(invite => (
              <View key={invite.id} style={[styles.inviteRow, { borderBottomColor: theme.border, opacity: 0.6 }]}>
                <View style={styles.inviteInfo}>
                  <Text style={[styles.inviteEmail, { color: theme.textSecondary }]}>{invite.email}</Text>
                  <Text style={[styles.inviteRole, { color: theme.textTertiary }]}>
                    {ROLE_CONFIG[invite.role].label} • Expired
                  </Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity
                    style={[styles.inviteActionButton, { borderColor: theme.primary }]}
                    onPress={() => handleResendInvite(invite)}
                  >
                    <FontAwesome name="refresh" size={12} color={theme.primary} />
                    <Text style={[styles.resendText, { color: theme.primary }]}>Resend</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Team Modal */}
      <Modal visible={editingTeam} animationType="fade" transparent onRequestClose={() => setEditingTeam(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Team</Text>
              <TouchableOpacity onPress={() => setEditingTeam(false)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Input
                label="Team Name"
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Team name"
              />
              <Input
                label="Note (optional)"
                value={teamNote}
                onChangeText={setTeamNote}
                placeholder="Brief description"
                multiline
                numberOfLines={2}
              />
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button title="Cancel" variant="secondary" onPress={() => setEditingTeam(false)} />
              <Button title="Save" onPress={handleSaveTeam} loading={saving} disabled={!teamName.trim()} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Member Role Modal */}
      <Modal visible={!!editingMember} animationType="fade" transparent onRequestClose={() => setEditingMember(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Role</Text>
              <TouchableOpacity onPress={() => setEditingMember(null)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.memberModalName, { color: theme.text }]}>
                {editingMember?.user?.email}
              </Text>
              <View style={styles.roleOptions}>
                {(['admin', 'member', 'guest'] as TeamRole[]).map(role => {
                  const config = ROLE_CONFIG[role];
                  const isSelected = selectedRole === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        { 
                          backgroundColor: isSelected ? config.color + '20' : theme.surfaceSecondary,
                          borderColor: isSelected ? config.color : theme.border,
                        }
                      ]}
                      onPress={() => setSelectedRole(role)}
                    >
                      <View style={styles.roleOptionHeader}>
                        <Text style={[styles.roleOptionLabel, { color: isSelected ? config.color : theme.text }]}>
                          {config.label}
                        </Text>
                        {isSelected && <FontAwesome name="check" size={14} color={config.color} />}
                      </View>
                      <Text style={[styles.roleOptionDesc, { color: theme.textSecondary }]}>
                        {config.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: '#EF4444' }]}
                onPress={() => {
                  if (editingMember) {
                    handleRemoveMember(editingMember);
                    setEditingMember(null);
                  }
                }}
              >
                <FontAwesome name="trash" size={14} color="#EF4444" />
                <Text style={styles.removeButtonText}>Remove from Team</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button title="Cancel" variant="secondary" onPress={() => setEditingMember(null)} />
              <Button title="Save Role" onPress={handleUpdateMemberRole} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return Platform.OS === 'web' ? <WebLayout>{screenContent}</WebLayout> : screenContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  teamNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  teamList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  teamItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  inviteRole: {
    fontSize: 12,
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? 400 : '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  memberModalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  roleOptions: {
    gap: 10,
    marginBottom: 16,
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
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
});
