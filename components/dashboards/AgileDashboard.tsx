import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import { ProjectPhase } from '../../types';
import { AGILE_PHASES, getNextPhase } from '../../store/taskStore';

// Phase configuration with colors
const PHASE_CONFIG: Record<ProjectPhase, { label: string; color: string; bgColor: string }> = {
  brainstorm: { label: 'Brainstorm', color: '#7C3AED', bgColor: '#EDE9FE' },
  design: { label: 'Design', color: '#2563EB', bgColor: '#DBEAFE' },
  logic: { label: 'Logic', color: '#059669', bgColor: '#D1FAE5' },
  polish: { label: 'Polish', color: '#D97706', bgColor: '#FEF3C7' },
  done: { label: 'Done', color: '#6B7280', bgColor: '#F3F4F6' },
};

// Get previous phase for "move back" functionality
function getPreviousPhase(currentPhase: ProjectPhase | null): ProjectPhase | null {
  if (!currentPhase) return null;
  const currentIndex = AGILE_PHASES.indexOf(currentPhase);
  if (currentIndex <= 0) return null;
  return AGILE_PHASES[currentIndex - 1];
}

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
  
  // Drag and drop state (web only)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverPhase, setDragOverPhase] = useState<ProjectPhase | null>(null);

  // Web drag handlers
  const handleDragStart = useCallback((e: any, taskId: string) => {
    if (Platform.OS !== 'web') return;
    setDraggedTaskId(taskId);
    // Set drag data
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverPhase(null);
  }, []);

  const handleDragOver = useCallback((e: any, phase: ProjectPhase) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverPhase(phase);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverPhase(null);
  }, []);

  const handleDrop = useCallback(async (e: any, targetPhase: ProjectPhase) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    
    const taskId = draggedTaskId || (e.dataTransfer?.getData('text/plain'));
    if (taskId && onTaskPhaseChange) {
      try {
        await onTaskPhaseChange(taskId, targetPhase);
      } catch (error) {
        console.error('Error changing task phase:', error);
      }
    }
    
    setDraggedTaskId(null);
    setDragOverPhase(null);
  }, [draggedTaskId, onTaskPhaseChange]);

  // Mobile: Move task to next phase
  const handleMoveToNextPhase = useCallback(async (task: any) => {
    const currentPhase = task.project_phase || task.projectPhase || 'brainstorm';
    const nextPhase = getNextPhase(currentPhase);
    
    if (nextPhase && onTaskPhaseChange) {
      try {
        await onTaskPhaseChange(task.id, nextPhase);
      } catch (error) {
        console.error('Error moving task to next phase:', error);
      }
    }
  }, [onTaskPhaseChange]);

  // Mobile: Move task to previous phase
  const handleMoveToPreviousPhase = useCallback(async (task: any) => {
    const currentPhase = task.project_phase || task.projectPhase || 'brainstorm';
    const prevPhase = getPreviousPhase(currentPhase);
    
    if (prevPhase && onTaskPhaseChange) {
      try {
        await onTaskPhaseChange(task.id, prevPhase);
      } catch (error) {
        console.error('Error moving task to previous phase:', error);
      }
    }
  }, [onTaskPhaseChange]);

  // Mobile: Show phase picker
  const handleShowPhaseOptions = useCallback((task: any) => {
    const currentPhase = task.project_phase || task.projectPhase || 'brainstorm';
    const options = AGILE_PHASES.filter(p => p !== currentPhase).map(phase => ({
      text: `Move to ${PHASE_CONFIG[phase].label}`,
      onPress: () => onTaskPhaseChange?.(task.id, phase),
    }));
    
    Alert.alert(
      'Move Task',
      `Select a new phase for "${task.title}"`,
      [
        ...options,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [onTaskPhaseChange]);
  
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
              const isDragOver = dragOverPhase === phase;
              
              // Web-specific lane wrapper with drop zone
              const laneContent = (
                <>
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
                      <View style={[
                        styles.emptyLane,
                        isDragOver && styles.emptyLaneDragOver
                      ]}>
                        <FontAwesome 
                          name={isDragOver ? "arrow-down" : "inbox"} 
                          size={24} 
                          color={isDragOver ? config.color : theme.textTertiary} 
                        />
                        <Text style={[
                          styles.emptyLaneText, 
                          { color: isDragOver ? config.color : theme.textTertiary }
                        ]}>
                          {isDragOver ? 'Drop here' : 'No tasks'}
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
                        // Check if blocked by status or has blocking dependencies
                        const blockedByRaw = task.blocked_by || task.blockedBy;
                        const blockedByList: string[] = Array.isArray(blockedByRaw) 
                          ? blockedByRaw 
                          : (typeof blockedByRaw === 'string' ? JSON.parse(blockedByRaw || '[]') : []);
                        const hasBlockers = blockedByList.length > 0;
                        const isBlocked = task.status === 'blocked' || hasBlockers;
                        const isDragging = draggedTaskId === task.id;

                        // Task card with drag support for web
                        const taskCardStyle = [
                          styles.taskCard,
                          { 
                            backgroundColor: theme.surface,
                            borderColor: isBlocked ? '#EF4444' : theme.border,
                            borderWidth: isBlocked ? 2 : 1,
                          },
                          isDragging && styles.taskCardDragging,
                        ];

                        // Get navigation info for mobile buttons
                        const taskPhase = (task.project_phase || task.projectPhase || 'brainstorm') as ProjectPhase;
                        const nextPhase = getNextPhase(taskPhase);
                        const prevPhase = getPreviousPhase(taskPhase);
                        const nextPhaseConfig = nextPhase ? PHASE_CONFIG[nextPhase] : null;
                        const prevPhaseConfig = prevPhase ? PHASE_CONFIG[prevPhase] : null;

                        const taskCardContent = (
                          <>
                            {/* Priority indicator */}
                            <View style={[styles.taskPriorityBar, { backgroundColor: priorityColor }]} />
                            
                            {/* Drag handle for web */}
                            {isWeb && onTaskPhaseChange && (
                              <View style={styles.dragHandle}>
                                <FontAwesome name="ellipsis-v" size={12} color={theme.textTertiary} />
                              </View>
                            )}
                            
                            {/* Task content */}
                            <View style={styles.taskContent}>
                              <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={2}>
                                {task.title}
                              </Text>
                              
                              {/* Task meta */}
                              <View style={styles.taskMeta}>
                                {isBlocked && (
                                  <View style={[styles.blockedBadge, hasBlockers && styles.blockedBadgeAmber]}>
                                    <FontAwesome name={hasBlockers ? "lock" : "ban"} size={10} color={hasBlockers ? "#F59E0B" : "#EF4444"} />
                                    <Text style={[styles.blockedBadgeText, hasBlockers && { color: '#F59E0B' }]}>
                                      {hasBlockers ? `Blocked by ${blockedByList.length}` : 'Blocked'}
                                    </Text>
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
                          </>
                        );

                        // Web: Use div with drag events
                        if (isWeb && onTaskPhaseChange) {
                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => onTaskClick?.(task)}
                              style={{ cursor: 'grab' }}
                            >
                              <View style={taskCardStyle}>
                                {taskCardContent}
                              </View>
                            </div>
                          );
                        }

                        // Mobile: Task card with phase navigation buttons
                        return (
                          <View key={task.id} style={taskCardStyle}>
                            <TouchableOpacity
                              onPress={() => onTaskClick?.(task)}
                              onLongPress={() => handleShowPhaseOptions(task)}
                              activeOpacity={0.7}
                            >
                              {taskCardContent}
                            </TouchableOpacity>
                            
                            {/* Mobile phase navigation buttons */}
                            {onTaskPhaseChange && phase !== 'done' && (
                              <View style={styles.mobilePhaseNav}>
                                {/* Move back button */}
                                {prevPhaseConfig && (
                                  <TouchableOpacity
                                    style={[styles.mobileNavButton, { backgroundColor: prevPhaseConfig.bgColor }]}
                                    onPress={() => handleMoveToPreviousPhase(task)}
                                  >
                                    <FontAwesome name="chevron-left" size={10} color={prevPhaseConfig.color} />
                                    <Text style={[styles.mobileNavButtonText, { color: prevPhaseConfig.color }]}>
                                      {prevPhaseConfig.label}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                
                                {/* Spacer */}
                                <View style={styles.mobileNavSpacer} />
                                
                                {/* Move forward button */}
                                {nextPhaseConfig && (
                                  <TouchableOpacity
                                    style={[styles.mobileNavButton, styles.mobileNavButtonPrimary, { backgroundColor: nextPhaseConfig.color }]}
                                    onPress={() => handleMoveToNextPhase(task)}
                                  >
                                    <Text style={styles.mobileNavButtonTextPrimary}>
                                      {nextPhaseConfig.label}
                                    </Text>
                                    <FontAwesome name="chevron-right" size={10} color="#FFFFFF" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </>
              );

              // Web: Wrap lane in drop zone div
              if (isWeb && onTaskPhaseChange) {
                return (
                  <div
                    key={phase}
                    onDragOver={(e) => handleDragOver(e, phase)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, phase)}
                    style={{ display: 'flex' }}
                  >
                    <View 
                      style={[
                        styles.kanbanLane, 
                        { backgroundColor: config.bgColor + '40' },
                        isDragOver && [styles.kanbanLaneDragOver, { borderColor: config.color }]
                      ]}
                    >
                      {laneContent}
                    </View>
                  </div>
                );
              }

              // Mobile: Regular View
              return (
                <View 
                  key={phase} 
                  style={[
                    styles.kanbanLane, 
                    { backgroundColor: config.bgColor + '40' }
                  ]}
                >
                  {laneContent}
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
            {/* Enhanced Burndown Chart */}
            <View style={styles.insightCard}>
              <View style={styles.burndownHeader}>
                <Text style={[styles.insightCardTitle, { color: theme.text }]}>Sprint Burndown</Text>
                {/* Status indicator */}
                <View style={[
                  styles.burndownStatus,
                  { 
                    backgroundColor: incompleteTasks.length <= (totalTasks * (1 - completionRate/100) * 1.1) 
                      ? '#10B98120' 
                      : '#F59E0B20' 
                  }
                ]}>
                  <FontAwesome 
                    name={incompleteTasks.length <= (totalTasks * (1 - completionRate/100) * 1.1) ? "check" : "exclamation"} 
                    size={10} 
                    color={incompleteTasks.length <= (totalTasks * (1 - completionRate/100) * 1.1) ? '#10B981' : '#F59E0B'} 
                  />
                  <Text style={[
                    styles.burndownStatusText,
                    { color: incompleteTasks.length <= (totalTasks * (1 - completionRate/100) * 1.1) ? '#10B981' : '#F59E0B' }
                  ]}>
                    {incompleteTasks.length <= (totalTasks * (1 - completionRate/100) * 1.1) ? 'On Track' : 'Behind'}
                  </Text>
                </View>
              </View>
              
              {/* Summary stats */}
              <View style={styles.burndownSummary}>
                <View style={styles.burndownStat}>
                  <Text style={[styles.burndownStatValue, { color: theme.text }]}>{totalTasks}</Text>
                  <Text style={[styles.burndownStatLabel, { color: theme.textSecondary }]}>Total</Text>
                </View>
                <View style={styles.burndownStatDivider} />
                <View style={styles.burndownStat}>
                  <Text style={[styles.burndownStatValue, { color: '#10B981' }]}>{completedCount}</Text>
                  <Text style={[styles.burndownStatLabel, { color: theme.textSecondary }]}>Done</Text>
                </View>
                <View style={styles.burndownStatDivider} />
                <View style={styles.burndownStat}>
                  <Text style={[styles.burndownStatValue, { color: theme.primary }]}>{incompleteTasks.length}</Text>
                  <Text style={[styles.burndownStatLabel, { color: theme.textSecondary }]}>Remaining</Text>
                </View>
              </View>

              {/* Chart area */}
              <View style={styles.burndownChart}>
                {/* Y-axis labels */}
                <View style={styles.burndownYAxis}>
                  <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>{totalTasks}</Text>
                  <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>{Math.round(totalTasks/2)}</Text>
                  <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>0</Text>
                </View>

                {/* Chart content */}
                <View style={styles.burndownChartContent}>
                  {/* Grid lines */}
                  <View style={[styles.burndownGridLine, { top: '0%', borderColor: theme.border }]} />
                  <View style={[styles.burndownGridLine, { top: '50%', borderColor: theme.border }]} />
                  <View style={[styles.burndownGridLine, { top: '100%', borderColor: theme.border }]} />

                  {/* Bars */}
                  <View style={styles.burndownBars}>
                    {Array.from({ length: sprintDays }).map((_, idx) => {
                      const dayProgress = (idx + 1) / sprintDays;
                      const idealRemaining = Math.max(0, totalTasks * (1 - dayProgress));
                      const actualProgress = completionRate / 100;
                      // Simulate actual based on current progress
                      const simulatedActual = idx < sprintDays * 0.5 
                        ? totalTasks * (1 - (actualProgress * (idx + 1) / (sprintDays * 0.5)))
                        : incompleteTasks.length;
                      const actualRemaining = idx < sprintDays * actualProgress * 1.2 
                        ? Math.max(0, simulatedActual)
                        : incompleteTasks.length;
                      
                      const chartHeight = 100;
                      const idealHeight = (idealRemaining / Math.max(totalTasks, 1)) * chartHeight;
                      const actualHeight = (actualRemaining / Math.max(totalTasks, 1)) * chartHeight;
                      
                      // Determine if this is "today" (roughly based on progress)
                      const isToday = idx === Math.floor(sprintDays * Math.min(0.9, actualProgress + 0.3));
                      
                      return (
                        <View key={idx} style={styles.burndownDay}>
                          <View style={styles.burndownBarGroup}>
                            {/* Ideal line marker */}
                            <View 
                              style={[
                                styles.burndownIdealMarker, 
                                { bottom: `${idealHeight}%`, backgroundColor: '#9CA3AF' }
                              ]} 
                            />
                            {/* Actual bar (area) */}
                            <View 
                              style={[
                                styles.burndownActualBar, 
                                { 
                                  height: `${actualHeight}%`,
                                  backgroundColor: actualHeight > idealHeight ? '#EF444440' : '#3B82F640',
                                }
                              ]} 
                            />
                            {/* Today marker */}
                            {isToday && (
                              <View style={[styles.burndownTodayLine, { backgroundColor: theme.primary }]} />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* X-axis labels */}
                  <View style={styles.burndownXAxis}>
                    <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>Day 1</Text>
                    <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>Day 7</Text>
                    <Text style={[styles.burndownAxisLabel, { color: theme.textTertiary }]}>Day 14</Text>
                  </View>
                </View>
              </View>

              {/* Legend */}
              <View style={styles.burndownLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: '#9CA3AF' }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Ideal Burndown</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>On/Ahead</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Behind</Text>
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  kanbanLaneDragOver: {
    borderStyle: 'dashed',
    transform: [{ scale: 1.02 }],
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
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    margin: 4,
  },
  emptyLaneDragOver: {
    borderColor: 'currentColor',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
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
  taskCardDragging: {
    opacity: 0.5,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  taskPriorityBar: {
    height: 3,
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0.5,
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
  blockedBadgeAmber: {
    backgroundColor: '#FEF3C7',
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
  // Mobile phase navigation
  mobilePhaseNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
  },
  mobileNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mobileNavButtonPrimary: {
    // Background color set dynamically
  },
  mobileNavButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mobileNavButtonTextPrimary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mobileNavSpacer: {
    flex: 1,
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
    marginBottom: 16,
  },
  insightCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  burndownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  burndownStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  burndownStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  burndownSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 8,
  },
  burndownStat: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  burndownStatValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  burndownStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  burndownStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  burndownChart: {
    flexDirection: 'row',
    height: 120,
  },
  burndownYAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  burndownAxisLabel: {
    fontSize: 10,
  },
  burndownChartContent: {
    flex: 1,
    position: 'relative',
  },
  burndownGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  burndownBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  burndownDay: {
    flex: 1,
    height: '100%',
  },
  burndownBarGroup: {
    flex: 1,
    position: 'relative',
  },
  burndownIdealMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  burndownActualBar: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 0,
    borderRadius: 2,
  },
  burndownTodayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
  },
  burndownXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  burndownLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
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
