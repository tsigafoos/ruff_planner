import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import { MaintenanceCategory, TaskStatus } from '../../types';

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<MaintenanceCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  bug: { label: 'Bugs', icon: '🐛', color: '#EF4444', bgColor: '#FEE2E2' },
  enhancement: { label: 'Enhancements', icon: '✨', color: '#8B5CF6', bgColor: '#EDE9FE' },
  support: { label: 'Support', icon: '🎧', color: '#0EA5E9', bgColor: '#E0F2FE' },
  other: { label: 'Other', icon: '📋', color: '#6B7280', bgColor: '#F3F4F6' },
};

// Status configuration
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  to_do: { label: 'Open', color: '#6B7280' },
  in_progress: { label: 'In Progress', color: '#3B82F6' },
  blocked: { label: 'Blocked', color: '#EF4444' },
  on_hold: { label: 'On Hold', color: '#F59E0B' },
  completed: { label: 'Resolved', color: '#10B981' },
  cancelled: { label: 'Closed', color: '#9CA3AF' },
};

interface MaintenanceDashboardProps {
  project: any;
  tasks: any[];
  onProjectUpdate?: (updates: any) => Promise<void>;
  onTaskClick?: (task: any) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onAddTask?: () => void;
}

export default function MaintenanceDashboard({
  project,
  tasks,
  onProjectUpdate,
  onTaskClick,
  onTaskStatusChange,
  onAddTask,
}: MaintenanceDashboardProps) {
  const theme = useTheme();
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'open'>('open');

  // Get task category (defaults to 'other' if not set)
  const getTaskCategory = (task: any): MaintenanceCategory => {
    return (task.category as MaintenanceCategory) || 'other';
  };

  // Get tasks by category
  const getTasksByCategory = (category: MaintenanceCategory | 'all') => {
    if (category === 'all') return tasks;
    return tasks.filter((t: any) => getTaskCategory(t) === category);
  };

  // Get open tasks (not completed/cancelled)
  const getOpenTasks = (taskList: any[]) => {
    return taskList.filter((t: any) => {
      const status = t.status as TaskStatus;
      return status !== 'completed' && status !== 'cancelled';
    });
  };

  // Get resolved tasks
  const getResolvedTasks = (taskList: any[]) => {
    return taskList.filter((t: any) => {
      const status = t.status as TaskStatus;
      return status === 'completed' || status === 'cancelled';
    });
  };

  // Calculate average resolution time (from creation to completion)
  const calculateAvgResolutionTime = (resolvedTaskList: any[]): string => {
    const tasksWithTime = resolvedTaskList.filter((t: any) => {
      const completedAt = t.completed_at || t.completedAt;
      const createdAt = t.created_at || t.createdAt;
      return completedAt && createdAt;
    });

    if (tasksWithTime.length === 0) return 'N/A';

    const totalMs = tasksWithTime.reduce((sum: number, t: any) => {
      const completedAt = new Date(t.completed_at || t.completedAt).getTime();
      const createdAt = new Date(t.created_at || t.createdAt).getTime();
      return sum + (completedAt - createdAt);
    }, 0);

    const avgMs = totalMs / tasksWithTime.length;
    const avgDays = avgMs / (1000 * 60 * 60 * 24);

    if (avgDays < 1) {
      const avgHours = avgMs / (1000 * 60 * 60);
      return `${Math.round(avgHours)}h`;
    }
    return `${avgDays.toFixed(1)}d`;
  };

  // Count tasks by status
  const getStatusCounts = (taskList: any[]) => {
    const counts: Record<string, number> = {};
    taskList.forEach((t: any) => {
      const status = t.status || 'to_do';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  // Filter tasks for display
  const filteredTasks = (() => {
    let result = getTasksByCategory(selectedCategory);
    if (selectedStatus === 'open') {
      result = getOpenTasks(result);
    } else {
      result = result.filter((t: any) => t.status === selectedStatus);
    }
    return result;
  })();

  // Calculate metrics
  const allOpenTasks = getOpenTasks(tasks);
  const allResolvedTasks = getResolvedTasks(tasks);
  const bugCount = getTasksByCategory('bug').filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled').length;
  const avgResolutionTime = calculateAvgResolutionTime(allResolvedTasks);
  const statusCounts = getStatusCounts(tasks);

  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={true}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          TOP TIER: Stats Overview
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.topTier}>
        <View style={styles.overviewCardsRow}>
          {/* Open Issues Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="folder-open" size={18} color={theme.primary} />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Open Issues</Text>
            </View>
            <Text style={[styles.overviewCardValueLarge, { color: theme.text }]}>
              {allOpenTasks.length}
            </Text>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
              {tasks.length} total
            </Text>
          </View>

          {/* Bugs Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <Text style={styles.categoryIcon}>🐛</Text>
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Open Bugs</Text>
            </View>
            <Text style={[styles.overviewCardValueLarge, { color: bugCount > 0 ? '#EF4444' : theme.text }]}>
              {bugCount}
            </Text>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
              {bugCount === 0 ? 'All clear!' : 'needs attention'}
            </Text>
          </View>

          {/* Resolution Time Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="clock-o" size={18} color="#10B981" />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Avg Resolution</Text>
            </View>
            <Text style={[styles.overviewCardValueLarge, { color: theme.text }]}>
              {avgResolutionTime}
            </Text>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
              time to resolve
            </Text>
          </View>

          {/* Resolved Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="check-circle" size={18} color="#10B981" />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Resolved</Text>
            </View>
            <Text style={[styles.overviewCardValueLarge, { color: '#10B981' }]}>
              {allResolvedTasks.length}
            </Text>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
              all time
            </Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORY TABS
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={[styles.categorySection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'all' && [styles.categoryTabActive, { borderColor: theme.primary }],
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryTabText,
              { color: selectedCategory === 'all' ? theme.primary : theme.text }
            ]}>
              All ({tasks.length})
            </Text>
          </TouchableOpacity>
          {(Object.keys(CATEGORY_CONFIG) as MaintenanceCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const count = getTasksByCategory(cat).length;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  { backgroundColor: selectedCategory === cat ? config.bgColor : 'transparent' },
                  selectedCategory === cat && { borderColor: config.color },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={styles.categoryTabIcon}>{config.icon}</Text>
                <Text style={[
                  styles.categoryTabText,
                  { color: selectedCategory === cat ? config.color : theme.text }
                ]}>
                  {config.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status Filter */}
        <View style={styles.statusFilter}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              selectedStatus === 'open' && [styles.statusChipActive, { backgroundColor: theme.primary + '20', borderColor: theme.primary }],
            ]}
            onPress={() => setSelectedStatus('open')}
          >
            <Text style={[styles.statusChipText, { color: selectedStatus === 'open' ? theme.primary : theme.textSecondary }]}>
              Open
            </Text>
          </TouchableOpacity>
          {(['to_do', 'in_progress', 'blocked', 'on_hold', 'completed', 'cancelled'] as TaskStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  selectedStatus === status && [styles.statusChipActive, { backgroundColor: config.color + '20', borderColor: config.color }],
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.statusChipText, { color: selectedStatus === status ? config.color : theme.textSecondary }]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          MIDDLE TIER: Issue List
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={[styles.middleTier, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text }]}>
            Issues ({filteredTasks.length})
          </Text>
          {onAddTask && (
            <TouchableOpacity
              style={[styles.addTaskButton, { backgroundColor: theme.primary }]}
              onPress={onAddTask}
            >
              <FontAwesome name="plus" size={12} color="#FFFFFF" />
              <Text style={styles.addTaskButtonText}>New Issue</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Issue List */}
        <View style={styles.issueList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="inbox" size={40} color={theme.textTertiary} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No issues found
              </Text>
            </View>
          ) : (
            filteredTasks.map((task: any) => {
              const category = getTaskCategory(task);
              const categoryConfig = CATEGORY_CONFIG[category];
              const status = (task.status || 'to_do') as TaskStatus;
              const statusConfig = STATUS_CONFIG[status];
              const priority = task.priority || 1;
              const priorityColors = {
                1: '#10B981',
                2: '#3B82F6',
                3: '#F59E0B',
                4: '#EF4444',
              };
              const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors[1];

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.issueCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => onTaskClick?.(task)}
                  activeOpacity={0.7}
                >
                  {/* Priority bar */}
                  <View style={[styles.issuePriorityBar, { backgroundColor: priorityColor }]} />

                  {/* Issue content */}
                  <View style={styles.issueContent}>
                    {/* Header row */}
                    <View style={styles.issueHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bgColor }]}>
                        <Text style={styles.categoryBadgeIcon}>{categoryConfig.icon}</Text>
                        <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
                          {categoryConfig.label.slice(0, -1)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                        <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.issueTitle, { color: theme.text }]} numberOfLines={2}>
                      {task.title}
                    </Text>

                    {/* Meta row */}
                    <View style={styles.issueMeta}>
                      {task.due_date && (
                        <View style={styles.issueMetaItem}>
                          <FontAwesome name="calendar" size={11} color={theme.textTertiary} />
                          <Text style={[styles.issueMetaText, { color: theme.textTertiary }]}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                      )}
                      {task.created_at && (
                        <View style={styles.issueMetaItem}>
                          <FontAwesome name="clock-o" size={11} color={theme.textTertiary} />
                          <Text style={[styles.issueMetaText, { color: theme.textTertiary }]}>
                            Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Quick status buttons (web only) */}
                  {isWeb && onTaskStatusChange && status !== 'completed' && (
                    <View style={styles.quickActions}>
                      {status === 'to_do' && (
                        <TouchableOpacity
                          style={[styles.quickActionButton, { backgroundColor: '#3B82F620' }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            onTaskStatusChange(task.id, 'in_progress');
                          }}
                        >
                          <FontAwesome name="play" size={12} color="#3B82F6" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: '#10B98120' }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          onTaskStatusChange(task.id, 'completed');
                        }}
                      >
                        <FontAwesome name="check" size={12} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM TIER: Insights (Collapsible)
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomTier, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.insightsHeader}
          onPress={() => setInsightsExpanded(!insightsExpanded)}
        >
          <Text style={[styles.insightsTitle, { color: theme.text }]}>Breakdown & Metrics</Text>
          <FontAwesome
            name={insightsExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {insightsExpanded && (
          <View style={styles.insightsContent}>
            {/* Category Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>By Category</Text>
              <View style={styles.breakdownBars}>
                {(Object.keys(CATEGORY_CONFIG) as MaintenanceCategory[]).map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const count = getTasksByCategory(cat).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  return (
                    <View key={cat} style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <Text style={styles.breakdownIcon}>{config.icon}</Text>
                        <Text style={[styles.breakdownLabelText, { color: theme.text }]}>{config.label}</Text>
                      </View>
                      <View style={[styles.breakdownBarContainer, { backgroundColor: theme.border }]}>
                        <View style={[styles.breakdownBar, { width: `${percentage}%`, backgroundColor: config.color }]} />
                      </View>
                      <Text style={[styles.breakdownCount, { color: theme.textSecondary }]}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Status Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>By Status</Text>
              <View style={styles.statusGrid}>
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  const count = statusCounts[status] || 0;
                  return (
                    <View key={status} style={[styles.statusCard, { backgroundColor: theme.surfaceSecondary }]}>
                      <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
                      <Text style={[styles.statusCardValue, { color: theme.text }]}>{count}</Text>
                      <Text style={[styles.statusCardLabel, { color: theme.textSecondary }]}>{config.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TOP TIER: Overview Cards
  // ═══════════════════════════════════════════════════════════════════
  topTier: {
    padding: Platform.OS === 'web' ? 16 : 12,
  },
  overviewCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 180 : 150,
    maxWidth: Platform.OS === 'web' ? 250 : '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  overviewCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewCardValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  overviewCardSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  categoryIcon: {
    fontSize: 18,
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY TABS
  // ═══════════════════════════════════════════════════════════════════
  categorySection: {
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    borderWidth: 2,
  },
  categoryTabIcon: {
    fontSize: 14,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 12,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusChipActive: {
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ═══════════════════════════════════════════════════════════════════
  // MIDDLE TIER: Issue List
  // ═══════════════════════════════════════════════════════════════════
  middleTier: {
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  issueList: {
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
  },
  issueCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  issuePriorityBar: {
    width: 4,
  },
  issueContent: {
    flex: 1,
    padding: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeIcon: {
    fontSize: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  issueMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  issueMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  issueMetaText: {
    fontSize: 11,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ═══════════════════════════════════════════════════════════════════
  // BOTTOM TIER: Insights
  // ═══════════════════════════════════════════════════════════════════
  bottomTier: {
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContent: {
    padding: 16,
    paddingTop: 0,
    gap: 24,
  },
  breakdownSection: {
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownBars: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 120,
  },
  breakdownIcon: {
    fontSize: 14,
  },
  breakdownLabelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 100 : 80,
    maxWidth: Platform.OS === 'web' ? 150 : '30%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusCardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusCardLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
