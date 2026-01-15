import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { format, formatDistanceToNow } from 'date-fns';

export interface WaitingItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  blockedBy?: string[];
  dueDate?: Date | string;
  priority?: number;
}

export interface TeamWaitingWidgetProps {
  items: WaitingItem[];
  onMarkDone?: (taskId: string) => void;
  onAssignToMe?: (taskId: string) => void;
  onViewTask?: (taskId: string) => void;
  showHeader?: boolean;
  maxItems?: number;
}

/**
 * TeamWaitingWidget - Shows who's waiting on what tasks
 */
export default function TeamWaitingWidget({
  items,
  onMarkDone,
  onAssignToMe,
  onViewTask,
  showHeader = true,
  maxItems = 10,
}: TeamWaitingWidgetProps) {
  const theme = useTheme();

  // Sort by due date (closest first) and priority
  const sortedItems = [...items]
    .sort((a, b) => {
      // Priority first (lower number = higher priority)
      if (a.priority !== b.priority) {
        return (a.priority || 4) - (b.priority || 4);
      }
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, maxItems);

  const getInitials = (name: string, email: string) => {
    if (name && name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name || email || '?').slice(0, 2).toUpperCase();
  };

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1: return '#EF4444';
      case 2: return '#F59E0B';
      case 3: return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const formatDueTime = (dueDate?: Date | string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    
    if (date < now) {
      return { text: 'Overdue', color: '#EF4444' };
    }
    
    const distance = formatDistanceToNow(date, { addSuffix: true });
    if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { text: distance, color: '#F59E0B' };
    }
    
    return { text: distance, color: theme.textSecondary };
  };

  const renderWaitingItem = (item: WaitingItem) => {
    const dueInfo = formatDueTime(item.dueDate);
    
    return (
      <View 
        key={item.id}
        style={[styles.item, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
      >
        {/* User Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {getInitials(item.userName, item.userEmail)}
          </Text>
        </View>

        {/* Item Content */}
        <View style={styles.itemContent}>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {item.userName || item.userEmail}
          </Text>
          <TouchableOpacity 
            style={styles.taskRow}
            onPress={() => onViewTask?.(item.taskId)}
          >
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
            <Text style={[styles.taskTitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.taskTitle}
            </Text>
          </TouchableOpacity>
          
          {/* Due date and blocked info */}
          <View style={styles.metaRow}>
            {dueInfo && (
              <View style={[styles.dueBadge, { backgroundColor: dueInfo.color + '15' }]}>
                <FontAwesome name="clock-o" size={10} color={dueInfo.color} />
                <Text style={[styles.dueText, { color: dueInfo.color }]}>{dueInfo.text}</Text>
              </View>
            )}
            {item.blockedBy && item.blockedBy.length > 0 && (
              <View style={[styles.blockedBadge, { backgroundColor: '#EF444415' }]}>
                <FontAwesome name="chain-broken" size={10} color="#EF4444" />
                <Text style={[styles.blockedText, { color: '#EF4444' }]}>
                  Blocked by {item.blockedBy.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onMarkDone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B98115' }]}
              onPress={() => onMarkDone(item.taskId)}
            >
              <FontAwesome name="check" size={12} color="#10B981" />
            </TouchableOpacity>
          )}
          {onAssignToMe && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
              onPress={() => onAssignToMe(item.taskId)}
            >
              <FontAwesome name="user-plus" size={12} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <FontAwesome name="clock-o" size={16} color={theme.textSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Team Waiting List</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>{items.length}</Text>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.list} 
        showsVerticalScrollIndicator
        contentContainerStyle={styles.listContent}
      >
        {sortedItems.length > 0 ? (
          sortedItems.map(renderWaitingItem)
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="check-circle" size={32} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No one waiting
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              All team members are unblocked
            </Text>
          </View>
        )}

        {items.length > maxItems && (
          <Text style={[styles.moreText, { color: theme.textSecondary }]}>
            +{items.length - maxItems} more
          </Text>
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskTitle: {
    fontSize: 12,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dueText: {
    fontSize: 10,
    fontWeight: '500',
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blockedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
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
  moreText: {
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 8,
  },
});
