import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export type MemberRole = 'owner' | 'admin' | 'member' | 'guest';

export interface MemberCardProps {
  /** Member ID */
  id: string;
  /** Member name */
  name?: string;
  /** Member email */
  email: string;
  /** Member avatar URL */
  avatarUrl?: string;
  /** Member role */
  role: MemberRole;
  /** Whether this is the current user */
  isCurrentUser?: boolean;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Called when actions menu is pressed */
  onActionsPress?: () => void;
  /** Can edit this member */
  canEdit?: boolean;
}

// Role configuration
const ROLE_CONFIG: Record<MemberRole, { label: string; color: string }> = {
  owner: { label: 'Owner', color: '#F59E0B' },
  admin: { label: 'Admin', color: '#8B5CF6' },
  member: { label: 'Member', color: '#3B82F6' },
  guest: { label: 'Guest', color: '#6B7280' },
};

/**
 * MemberCard - Reusable component for displaying a team member
 */
export default function MemberCard({
  id,
  name,
  email,
  avatarUrl,
  role,
  isCurrentUser = false,
  onPress,
  onActionsPress,
  canEdit = false,
}: MemberCardProps) {
  const theme = useTheme();
  const roleConfig = ROLE_CONFIG[role];

  // Get initials for avatar
  const getInitials = () => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
        <Text style={[styles.avatarText, { color: theme.primary }]}>
          {getInitials()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>
          {name || email}
          {isCurrentUser && (
            <Text style={[styles.youLabel, { color: theme.textSecondary }]}> (You)</Text>
          )}
        </Text>
        {name && (
          <Text style={[styles.email, { color: theme.textSecondary }]}>{email}</Text>
        )}
      </View>

      {/* Role Badge */}
      <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '20' }]}>
        <Text style={[styles.roleText, { color: roleConfig.color }]}>
          {roleConfig.label}
        </Text>
      </View>

      {/* Actions */}
      {canEdit && onActionsPress && (
        <TouchableOpacity style={styles.actionsButton} onPress={onActionsPress}>
          <FontAwesome name="ellipsis-v" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  youLabel: {
    fontWeight: '400',
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsButton: {
    padding: 8,
  },
});
