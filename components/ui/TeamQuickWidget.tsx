import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface TeamMemberSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  activeTasks: number;
  completedToday: number;
  blockedTasks: number;
  isOnline?: boolean;
}

export interface TeamQuickWidgetProps {
  members: TeamMemberSummary[];
  onMemberClick?: (memberId: string) => void;
  onAssignTask?: (memberId: string) => void;
  onViewTasks?: (memberId: string) => void;
  showHeader?: boolean;
}

/**
 * TeamQuickWidget - Quick team member overview and actions
 */
export default function TeamQuickWidget({
  members,
  onMemberClick,
  onAssignTask,
  onViewTasks,
  showHeader = true,
}: TeamQuickWidgetProps) {
  const theme = useTheme();

  const getInitials = (name: string, email: string) => {
    if (name && name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name || email || '?').slice(0, 2).toUpperCase();
  };

  const getMemberStatusColor = (member: TeamMemberSummary) => {
    if (member.blockedTasks > 0) return '#EF4444';
    if (member.activeTasks === 0) return '#10B981';
    return theme.primary;
  };

  const renderMember = (member: TeamMemberSummary) => {
    const statusColor = getMemberStatusColor(member);

    return (
      <TouchableOpacity
        key={member.id}
        style={[styles.memberCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
        onPress={() => onMemberClick?.(member.id)}
      >
        {/* Avatar with status indicator */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {getInitials(member.name, member.email)}
            </Text>
          </View>
          {member.isOnline !== undefined && (
            <View 
              style={[
                styles.onlineIndicator, 
                { backgroundColor: member.isOnline ? '#10B981' : '#6B7280' }
              ]} 
            />
          )}
        </View>

        {/* Member Info */}
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: theme.text }]} numberOfLines={1}>
            {member.name || member.email}
          </Text>
          {member.role && (
            <Text style={[styles.memberRole, { color: theme.textTertiary }]} numberOfLines={1}>
              {member.role}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statRow}>
            <View style={[styles.statDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.statValue, { color: theme.text }]}>{member.activeTasks}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>active</Text>
          </View>
          {member.blockedTasks > 0 && (
            <View style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{member.blockedTasks}</Text>
              <Text style={[styles.statLabel, { color: '#EF4444' }]}>blocked</Text>
            </View>
          )}
          {member.completedToday > 0 && (
            <View style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.statValue, { color: '#10B981' }]}>{member.completedToday}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>today</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {onAssignTask && (
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.primary + '15' }]}
              onPress={(e) => {
                e.stopPropagation();
                onAssignTask(member.id);
              }}
            >
              <FontAwesome name="plus" size={10} color={theme.primary} />
            </TouchableOpacity>
          )}
          {onViewTasks && (
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]}
              onPress={(e) => {
                e.stopPropagation();
                onViewTasks(member.id);
              }}
            >
              <FontAwesome name="list" size={10} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate team summary
  const totalActive = members.reduce((sum, m) => sum + m.activeTasks, 0);
  const totalBlocked = members.reduce((sum, m) => sum + m.blockedTasks, 0);
  const totalCompletedToday = members.reduce((sum, m) => sum + m.completedToday, 0);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <FontAwesome name="users" size={16} color={theme.textSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Team Overview</Text>
          <View style={[styles.headerBadge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.headerBadgeText, { color: theme.primary }]}>
              {members.length} members
            </Text>
          </View>
        </View>
      )}

      {/* Quick Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{totalActive}</Text>
          <Text style={[styles.statDescription, { color: theme.textSecondary }]}>Active Tasks</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: totalBlocked > 0 ? '#EF4444' : theme.text }]}>
            {totalBlocked}
          </Text>
          <Text style={[styles.statDescription, { color: theme.textSecondary }]}>Blocked</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{totalCompletedToday}</Text>
          <Text style={[styles.statDescription, { color: theme.textSecondary }]}>Done Today</Text>
        </View>
      </View>

      {/* Member List */}
      <ScrollView 
        style={styles.memberList}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.memberListContent}
      >
        {members.length > 0 ? (
          members.map(renderMember)
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="user-plus" size={32} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No team members
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Invite team members to collaborate
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statDescription: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  memberList: {
    flex: 1,
  },
  memberListContent: {
    padding: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 10,
    marginTop: 1,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 4,
  },
  quickButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});
