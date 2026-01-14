import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, ScrollView, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import { useProfileStore } from '@/store/profileStore';
import { useTeamStore } from '@/store/teamStore';
import { useAuthStore } from '@/store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { EmailSettings } from '@/types';

interface TeamSettingsProps {
  onCreateTeam?: () => void;
  onManageTeam?: () => void;
}

export default function TeamSettings({ onCreateTeam, onManageTeam }: TeamSettingsProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { profile, setTeamModeEnabled, updateEmailSettings } = useProfileStore();
  const { teams, fetchTeams, currentTeam, setCurrentTeam } = useTeamStore();
  
  const [teamModeEnabled, setTeamModeEnabledLocal] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamNote, setNewTeamNote] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Email settings state
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({});
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (profile?.team_mode_enabled !== undefined) {
      setTeamModeEnabledLocal(profile.team_mode_enabled);
    }
    if (profile?.email_settings) {
      // Convert from snake_case if needed
      const settings = profile.email_settings as any;
      setEmailSettings({
        smtpHost: settings.smtp_host || settings.smtpHost,
        smtpPort: settings.smtp_port || settings.smtpPort,
        smtpUser: settings.smtp_user || settings.smtpUser,
        smtpPass: settings.smtp_pass || settings.smtpPass,
        smtpSecure: settings.smtp_secure ?? settings.smtpSecure,
        imapHost: settings.imap_host || settings.imapHost,
        imapPort: settings.imap_port || settings.imapPort,
        imapUser: settings.imap_user || settings.imapUser,
        imapPass: settings.imap_pass || settings.imapPass,
        imapSecure: settings.imap_secure ?? settings.imapSecure,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id && teamModeEnabled) {
      fetchTeams(user.id);
    }
  }, [user?.id, teamModeEnabled]);

  const handleToggleTeamMode = async (value: boolean) => {
    if (!user?.id) return;
    setTeamModeEnabledLocal(value);
    try {
      await setTeamModeEnabled(user.id, value);
    } catch (error) {
      // Revert on error
      setTeamModeEnabledLocal(!value);
    }
  };

  const handleCreateTeam = async () => {
    if (!user?.id || !newTeamName.trim()) return;
    setCreating(true);
    try {
      const { createTeam } = useTeamStore.getState();
      const team = await createTeam(newTeamName.trim(), newTeamNote.trim() || undefined, user.id);
      if (team) {
        setCurrentTeam(team);
        setShowCreateTeam(false);
        setNewTeamName('');
        setNewTeamNote('');
        await fetchTeams(user.id);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!user?.id) return;
    setSavingEmail(true);
    try {
      await updateEmailSettings(user.id, emailSettings);
      setShowEmailSettings(false);
    } catch (error) {
      console.error('Error saving email settings:', error);
    } finally {
      setSavingEmail(false);
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        <FontAwesome name="users" size={18} color={theme.primary} /> Team & Collaboration
      </Text>

      {/* Team Mode Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>Enable Team Mode</Text>
          <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
            Create or join teams, share projects, and collaborate with others
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.customToggle,
            {
              backgroundColor: teamModeEnabled ? theme.primary : theme.surfaceTertiary || '#e5e5e5',
              borderColor: teamModeEnabled ? theme.primary : theme.border,
            }
          ]}
          onPress={() => handleToggleTeamMode(!teamModeEnabled)}
          activeOpacity={0.7}
        >
          <View 
            style={[
              styles.customToggleThumb,
              {
                backgroundColor: '#FFFFFF',
                transform: [{ translateX: teamModeEnabled ? 20 : 0 }],
              }
            ]} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Status indicator */}
      <View style={[styles.statusBadge, { backgroundColor: teamModeEnabled ? '#10B981' + '20' : theme.surfaceTertiary || '#f0f0f0' }]}>
        <View style={[styles.statusDot, { backgroundColor: teamModeEnabled ? '#10B981' : theme.textTertiary }]} />
        <Text style={[styles.statusText, { color: teamModeEnabled ? '#10B981' : theme.textSecondary }]}>
          {teamModeEnabled ? 'Team Mode Active' : 'Team Mode Disabled'}
        </Text>
      </View>

      {/* Team Mode Content */}
      {teamModeEnabled && (
        <View style={styles.teamContent}>
          {/* Current Team */}
          {teams.length > 0 ? (
            <View style={[styles.teamCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.teamCardHeader}>
                <FontAwesome name="building" size={16} color={theme.primary} />
                <Text style={[styles.teamCardTitle, { color: theme.text }]}>
                  {currentTeam?.name || teams[0]?.name || 'Select a Team'}
                </Text>
              </View>
              {teams.length > 1 && (
                <Text style={[styles.teamCount, { color: theme.textSecondary }]}>
                  +{teams.length - 1} more team{teams.length > 2 ? 's' : ''}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.manageButton, { borderColor: theme.primary }]}
                onPress={onManageTeam}
              >
                <FontAwesome name="cog" size={12} color={theme.primary} />
                <Text style={[styles.manageButtonText, { color: theme.primary }]}>Manage Team</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <FontAwesome name="users" size={32} color={theme.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Teams Yet</Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Create a team to start collaborating with others
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowCreateTeam(true)}
              >
                <FontAwesome name="plus" size={12} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email Settings Link */}
          <TouchableOpacity
            style={[styles.settingsLink, { borderColor: theme.border }]}
            onPress={() => setShowEmailSettings(true)}
          >
            <View style={styles.settingsLinkContent}>
              <FontAwesome name="envelope" size={16} color={theme.textSecondary} />
              <View style={styles.settingsLinkText}>
                <Text style={[styles.settingsLinkTitle, { color: theme.text }]}>Email Settings</Text>
                <Text style={[styles.settingsLinkDescription, { color: theme.textSecondary }]}>
                  Configure SMTP/IMAP for sending invites
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={12} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Create Team Modal */}
      <Modal
        visible={showCreateTeam}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreateTeam(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Team</Text>
              <TouchableOpacity onPress={() => setShowCreateTeam(false)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Input
                label="Team Name"
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholder="e.g., Acme Corp"
              />
              <Input
                label="Note (optional)"
                value={newTeamNote}
                onChangeText={setNewTeamNote}
                placeholder="Brief description of your team"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCreateTeam(false)}
              />
              <Button
                title="Create Team"
                onPress={handleCreateTeam}
                loading={creating}
                disabled={!newTeamName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Email Settings Modal */}
      <Modal
        visible={showEmailSettings}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEmailSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modalContentLarge, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Email Settings</Text>
              <TouchableOpacity onPress={() => setShowEmailSettings(false)}>
                <FontAwesome name="times" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* SMTP Settings */}
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>
                <FontAwesome name="send" size={14} color={theme.primary} /> Outgoing Mail (SMTP)
              </Text>
              <Text style={[styles.subsectionHint, { color: theme.textSecondary }]}>
                Used for sending invite emails
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Input
                    label="SMTP Host"
                    value={emailSettings.smtpHost || ''}
                    onChangeText={(v) => setEmailSettings({ ...emailSettings, smtpHost: v })}
                    placeholder="smtp.example.com"
                  />
                </View>
                <View style={styles.inputQuarter}>
                  <Input
                    label="Port"
                    value={emailSettings.smtpPort?.toString() || ''}
                    onChangeText={(v) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(v) || undefined })}
                    placeholder="587"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                label="SMTP Username"
                value={emailSettings.smtpUser || ''}
                onChangeText={(v) => setEmailSettings({ ...emailSettings, smtpUser: v })}
                placeholder="your@email.com"
              />

              <Input
                label="SMTP Password"
                value={emailSettings.smtpPass || ''}
                onChangeText={(v) => setEmailSettings({ ...emailSettings, smtpPass: v })}
                placeholder="••••••••"
                secureTextEntry
              />

              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>Use SSL/TLS</Text>
                <Switch
                  value={emailSettings.smtpSecure || false}
                  onValueChange={(v) => setEmailSettings({ ...emailSettings, smtpSecure: v })}
                  trackColor={{ false: theme.border, true: theme.primary + '60' }}
                  thumbColor={emailSettings.smtpSecure ? theme.primary : theme.textTertiary}
                />
              </View>

              {/* IMAP Settings */}
              <Text style={[styles.subsectionTitle, { color: theme.text, marginTop: 24 }]}>
                <FontAwesome name="inbox" size={14} color={theme.primary} /> Incoming Mail (IMAP)
              </Text>
              <Text style={[styles.subsectionHint, { color: theme.textSecondary }]}>
                Used for email-to-task feature (optional)
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Input
                    label="IMAP Host"
                    value={emailSettings.imapHost || ''}
                    onChangeText={(v) => setEmailSettings({ ...emailSettings, imapHost: v })}
                    placeholder="imap.example.com"
                  />
                </View>
                <View style={styles.inputQuarter}>
                  <Input
                    label="Port"
                    value={emailSettings.imapPort?.toString() || ''}
                    onChangeText={(v) => setEmailSettings({ ...emailSettings, imapPort: parseInt(v) || undefined })}
                    placeholder="993"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                label="IMAP Username"
                value={emailSettings.imapUser || ''}
                onChangeText={(v) => setEmailSettings({ ...emailSettings, imapUser: v })}
                placeholder="your@email.com"
              />

              <Input
                label="IMAP Password"
                value={emailSettings.imapPass || ''}
                onChangeText={(v) => setEmailSettings({ ...emailSettings, imapPass: v })}
                placeholder="••••••••"
                secureTextEntry
              />

              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>Use SSL/TLS</Text>
                <Switch
                  value={emailSettings.imapSecure || false}
                  onValueChange={(v) => setEmailSettings({ ...emailSettings, imapSecure: v })}
                  trackColor={{ false: theme.border, true: theme.primary + '60' }}
                  thumbColor={emailSettings.imapSecure ? theme.primary : theme.textTertiary}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowEmailSettings(false)}
              />
              <Button
                title="Save Settings"
                onPress={handleSaveEmailSettings}
                loading={savingEmail}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
    marginTop: 2,
  },
  customToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    padding: 3,
    justifyContent: 'center',
  },
  customToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamContent: {
    marginTop: 16,
    gap: 12,
  },
  teamCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  teamCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  teamCount: {
    fontSize: 12,
    marginBottom: 12,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  settingsLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLinkText: {
    gap: 2,
  },
  settingsLinkTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsLinkDescription: {
    fontSize: 12,
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
  modalContentLarge: {
    width: Platform.OS === 'web' ? 500 : '95%',
    maxWidth: 500,
    maxHeight: Platform.OS === 'web' ? '80vh' : '80%',
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
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subsectionHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 2,
  },
  inputQuarter: {
    flex: 1,
  },
});
