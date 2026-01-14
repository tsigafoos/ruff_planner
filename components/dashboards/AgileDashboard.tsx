import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import { ProjectPhase } from '../../types';
import { AGILE_PHASES } from '../../store/taskStore';

// Phase configuration with colors
const PHASE_CONFIG: Record<ProjectPhase, { label: string; color: string; bgColor: string }> = {
  brainstorm: { label: 'Brainstorm', color: '#7C3AED', bgColor: '#EDE9FE' },
  design: { label: 'Design', color: '#2563EB', bgColor: '#DBEAFE' },
  logic: { label: 'Logic', color: '#059669', bgColor: '#D1FAE5' },
  polish: { label: 'Polish', color: '#D97706', bgColor: '#FEF3C7' },
  done: { label: 'Done', color: '#6B7280', bgColor: '#F3F4F6' },
};

interface AgileDashboardProps {
  project: any;
  tasks: any[];
  onProjectUpdate?: (updates: any) => Promise<void>;
  onTaskClick?: (task: any) => void;
  onTaskPhaseChange?: (taskId: string, newPhase: ProjectPhase) => Promise<void>;
  onAddTask?: () => void;
}

export default function AgileDashboard({ 
  project, 
  tasks, 
  onProjectUpdate,
  onTaskClick,
  onTaskPhaseChange,
  onAddTask,
}: AgileDashboardProps) {
  const theme = useTheme();
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  
  // Calculate task counts by phase
  const getTasksByPhase = (phase: ProjectPhase) => {
    return tasks.filter((t: any) => {
      const taskPhase = t.project_phase || t.projectPhase;
      const isCompleted = !!(t.completed_at || t.completedAt || t.status === 'completed');
      
      if (phase === 'done') {
        return isCompleted;
      }
      return taskPhase === phase && !isCompleted;
    });
  };

  // Calculate metrics
  const completedTasks = tasks.filter((t: any) => t.completed_at || t.completedAt || t.status === 'completed');
  const incompleteTasks = tasks.filter((t: any) => !(t.completed_at || t.completedAt || t.status === 'completed'));
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Count blocked tasks
  const blockedTasks = tasks.filter((t: any) => t.status === 'blocked');

  // Calculate health
  const calculateHealth = (): 'green' | 'yellow' | 'red' => {
    if (blockedTasks.length > 3) return 'red';
    if (completionRate >= 70) return 'green';
    if (completionRate >= 40) return 'yellow';
    return 'red';
  };

  const health = calculateHealth();
  const healthConfig = {
    green: { color: '#10B981', label: 'On Track', icon: 'check-circle' as const },
    yellow: { color: '#F59E0B', label: 'At Risk', icon: 'exclamation-circle' as const },
    red: { color: '#EF4444', label: 'Behind', icon: 'times-circle' as const },
  };

  // Velocity (placeholder - would need sprint history)
  const velocity = Math.max(5, Math.floor(totalTasks * 0.3));

  // Burndown data (simplified)
  const sprintDays = 14;
  const idealPerDay = totalTasks / sprintDays;

  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      showsVerticalScrollIndicator={true}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          TOP TIER: Sprint Overview Cards (Quick Glance)
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.topTier}>
        <View style={styles.overviewCardsRow}>
          {/* Sprint Health Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name={healthConfig[health].icon} size={18} color={healthConfig[health].color} />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Sprint Health</Text>
            </View>
            <Text style={[styles.overviewCardValue, { color: healthConfig[health].color }]}>
              {healthConfig[health].label}
            </Text>
            <View style={[styles.healthBar, { backgroundColor: theme.border }]}>
              <View style={[styles.healthBarFill, { width: `${completionRate}%`, backgroundColor: healthConfig[health].color }]} />
            </View>
          </View>

          {/* Progress Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="tasks" size={18} color={theme.primary} />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Progress</Text>
            </View>
            <View style={styles.progressStats}>
              <Text style={[styles.overviewCardValueLarge, { color: theme.text }]}>{completionRate}%</Text>
              <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
                {completedCount}/{totalTasks}
              </Text>
            </View>
          </View>

          {/* Velocity Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="line-chart" size={18} color={theme.accent} />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Velocity</Text>
            </View>
            <View style={styles.velocityIndicator}>
              <Text style={[styles.overviewCardValueLarge, { color: theme.text }]}>{velocity}</Text>
              <FontAwesome name="arrow-up" size={14} color="#10B981" style={styles.velocityArrow} />
            </View>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>pts/sprint</Text>
          </View>

          {/* Blocked Card */}
          <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overviewCardHeader}>
              <FontAwesome name="ban" size={18} color={blockedTasks.length > 0 ? '#EF4444' : theme.textTertiary} />
              <Text style={[styles.overviewCardLabel, { color: theme.textSecondary }]}>Blocked</Text>
            </View>
            <Text style={[
              styles.overviewCardValueLarge, 
              { color: blockedTasks.length > 0 ? '#EF4444' : theme.text }
            ]}>
              {blockedTasks.length}
            </Text>
            <Text style={[styles.overviewCardSubtext, { color: theme.textSecondary }]}>
              {blockedTasks.length === 0 ? 'All clear!' : 'needs attention'}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          MIDDLE TIER: Kanban Board (Main Focus)
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={[styles.middleTier, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.kanbanHeader}>
          <Text style={[styles.kanbanTitle, { color: theme.text }]}>Kanban Board</Text>
          {onAddTask && (
            <TouchableOpacity 
              style={[styles.addTaskButton, { backgroundColor: theme.primary }]}
              onPress={onAddTask}
            >
              <FontAwesome name="plus" size={12} color="#FFFFFF" />
              <Text style={styles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Kanban Lanes */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={isWeb}
          contentContainerStyle={styles.kanbanScrollContent}
        >
          <View style={styles.kanbanLanes}>
            {AGILE_PHASES.map((phase) => {
              const phaseTasks = getTasksByPhase(phase);
              const config = PHASE_CONFIG[phase];
              
              return (
                <View 
                  key={phase} 
                  style={[
                    styles.kanbanLane, 
                    { backgroundColor: config.bgColor + '40' }
                  ]}
                >
                  {/* Lane Header */}
                  <View style={[styles.laneHeader, { borderBottomColor: config.color + '30' }]}>
                    <View style={[styles.laneColorBar, { backgroundColor: config.color }]} />
                    <Text style={[styles.laneTitle, { color: config.color }]}>{config.label}</Text>
                    <View style={[styles.laneCount, { backgroundColor: config.color + '20' }]}>
                      <Text style={[styles.laneCountText, { color: config.color }]}>
                        {phaseTasks.length}
                      </Text>
                    </View>
                  </View>

                  {/* Lane Tasks */}
                  <ScrollView 
                    style={styles.laneTasks} 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {phaseTasks.length === 0 ? (
                      <View style={styles.emptyLane}>
                        <FontAwesome name="inbox" size={24} color={theme.textTertiary} />
                        <Text style={[styles.emptyLaneText, { color: theme.textTertiary }]}>
                          No tasks
                        </Text>
                      </View>
                    ) : (
                      phaseTasks.map((task: any) => {
                        const priority = task.priority || 1;
                        const priorityColors = {
                          1: '#10B981',
                          2: '#3B82F6',
                          3: '#F59E0B',
                          4: '#EF4444',
                        };
                        const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors[1];
                        const isBlocked = task.status === 'blocked';

                        return (
                          <TouchableOpacity
                            key={task.id}
                            style={[
                              styles.taskCard,
                              { 
                                backgroundColor: theme.surface,
                                borderColor: isBlocked ? '#EF4444' : theme.border,
                                borderWidth: isBlocked ? 2 : 1,
                              }
                            ]}
                            onPress={() => onTaskClick?.(task)}
                            activeOpacity={0.7}
                          >
                            {/* Priority indicator */}
                            <View style={[styles.taskPriorityBar, { backgroundColor: priorityColor }]} />
                            
                            {/* Task content */}
                            <View style={styles.taskContent}>
                              <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={2}>
                                {task.title}
                              </Text>
                              
                              {/* Task meta */}
                              <View style={styles.taskMeta}>
                                {isBlocked && (
                                  <View style={styles.blockedBadge}>
                                    <FontAwesome name="ban" size={10} color="#EF4444" />
                                    <Text style={styles.blockedBadgeText}>Blocked</Text>
                                  </View>
                                )}
                                {task.due_date && (
                                  <View style={styles.dueDateBadge}>
                                    <FontAwesome name="calendar" size={10} color={theme.textSecondary} />
                                    <Text style={[styles.dueDateText, { color: theme.textSecondary }]}>
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM TIER: Insights (Collapsible)
          ═══════════════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomTier, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.insightsHeader}
          onPress={() => setInsightsExpanded(!insightsExpanded)}
        >
          <Text style={[styles.insightsTitle, { color: theme.text }]}>Insights & Metrics</Text>
          <FontAwesome 
            name={insightsExpanded ? 'chevron-up' : 'chevron-down'} 
            size={14} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>

        {insightsExpanded && (
          <View style={styles.insightsContent}>
            {/* Burndown Chart */}
            <View style={styles.insightCard}>
              <Text style={[styles.insightCardTitle, { color: theme.text }]}>Sprint Burndown</Text>
              <View style={styles.burndownChart}>
                <View style={styles.burndownBars}>
                  {Array.from({ length: sprintDays }).map((_, idx) => {
                    const idealRemaining = Math.max(0, totalTasks - (idealPerDay * (idx + 1)));
                    const actualRemaining = Math.max(0, totalTasks - (idealPerDay * (idx + 1) * 0.9)); // Simulated
                    const maxHeight = 80;
                    const idealHeight = (idealRemaining / Math.max(totalTasks, 1)) * maxHeight;
                    const actualHeight = (actualRemaining / Math.max(totalTasks, 1)) * maxHeight;
                    
                    return (
                      <View key={idx} style={styles.burndownDay}>
                        <View style={styles.burndownBarGroup}>
                          <View style={[styles.burndownBar, styles.burndownIdeal, { height: idealHeight }]} />
                          <View style={[styles.burndownBar, styles.burndownActual, { height: actualHeight }]} />
                        </View>
                        {idx % 3 === 0 && (
                          <Text style={[styles.burndownLabel, { color: theme.textTertiary }]}>D{idx + 1}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
                <View style={styles.burndownLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Ideal</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Actual</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {Math.floor(incompleteTasks.length / Math.max(1, velocity) * 2)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Cycle Time (days)</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {Math.floor(incompleteTasks.length / Math.max(1, velocity) * 3)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Lead Time (days)</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.metricValue, { color: theme.text }]}>{incompleteTasks.length}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>WIP</Text>
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
  overviewCardValue: {
    fontSize: 18,
    fontWeight: '700',
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
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  healthBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  velocityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  velocityArrow: {
    marginLeft: 6,
  },

  // ═══════════════════════════════════════════════════════════════════
  // MIDDLE TIER: Kanban Board
  // ═══════════════════════════════════════════════════════════════════
  middleTier: {
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kanbanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  kanbanTitle: {
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
  kanbanScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  kanbanLanes: {
    flexDirection: 'row',
    gap: 12,
  },
  kanbanLane: {
    width: Platform.OS === 'web' ? 280 : 240,
    minHeight: 400,
    borderRadius: 10,
    overflow: 'hidden',
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  laneColorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  laneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  laneCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  laneCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  laneTasks: {
    flex: 1,
    padding: 8,
  },
  emptyLane: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyLaneText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  taskCard: {
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskPriorityBar: {
    height: 3,
  },
  taskContent: {
    padding: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 11,
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
    gap: 16,
  },
  insightCard: {
    marginBottom: 8,
  },
  insightCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  burndownChart: {
    marginTop: 8,
  },
  burndownBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  burndownDay: {
    flex: 1,
    alignItems: 'center',
  },
  burndownBarGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
  },
  burndownBar: {
    width: 6,
    borderRadius: 2,
    minHeight: 4,
  },
  burndownIdeal: {
    backgroundColor: '#9CA3AF',
    opacity: 0.4,
  },
  burndownActual: {
    backgroundColor: '#3B82F6',
  },
  burndownLabel: {
    fontSize: 9,
    marginTop: 4,
  },
  burndownLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
