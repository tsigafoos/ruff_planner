import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../useTheme';

interface WaterfallDashboardProps {
  project: any;
  tasks: any[];
  onProjectUpdate?: (updates: any) => Promise<void>;
  onAddTask?: () => void;
  onTeamClick?: () => void;
  onToolsClick?: () => void;
  onTaskClick?: (task: any) => void;
}

export default function WaterfallDashboard({ project, tasks, onProjectUpdate, onAddTask, onTeamClick, onToolsClick, onTaskClick }: WaterfallDashboardProps) {
  const theme = useTheme();
  
  // Parse data
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const deliverables = Array.isArray(project.deliverables) ? project.deliverables : [];
  const teamRoles = Array.isArray(project.team_roles) ? project.team_roles : [];
  const dependencies = Array.isArray(project.dependencies) ? project.dependencies : [];
  const successCriteria = Array.isArray(project.success_criteria) ? project.success_criteria : [];
  const assumptions = Array.isArray(project.assumptions) ? project.assumptions : [];
  const resources = typeof project.resources === 'object' ? project.resources : {};
  const risks = Array.isArray(project.risks) ? project.risks : [];

  // Calculate project health
  const calculateHealth = () => {
    const now = new Date();
    const startDate = project.start_date ? new Date(project.start_date) : null;
    const endDate = project.end_date ? new Date(project.end_date) : null;
    const completedTasks = tasks.filter((t: any) => t.completed_at || t.completedAt).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    if (!startDate || !endDate) return 'yellow';
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const progressExpected = elapsedDays / totalDays;

    if (completionRate >= progressExpected * 0.9) return 'green';
    if (completionRate >= progressExpected * 0.7) return 'yellow';
    return 'red';
  };

  const health = calculateHealth();
  const healthColors = {
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
  };
  const healthLabels = {
    green: 'On Track',
    yellow: 'At Risk',
    red: 'Behind',
  };

  // Calculate summary statistics
  const completedTasks = tasks.filter((t: any) => t.completed_at || t.completedAt || t.status === 'completed').length;
  const totalTasks = tasks.length;
  const remainingTasks = totalTasks - completedTasks;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!project.end_date) return null;
    const endDate = new Date(project.end_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = calculateDaysRemaining();

  // Priority colors (matching PriorityPicker: 1=Low, 2=Medium, 3=High, 4=Urgent)
  const priorityColors = {
    1: '#10B981', // Green - Low
    2: '#3B82F6', // Blue - Medium
    3: '#F59E0B', // Orange - High
    4: '#EF4444', // Red - Urgent
  };

  // Get top 5 risks
  const topRisks = risks.slice(0, 5);

  // Render Gantt chart
  const renderGanttChart = () => {
    if (tasks.length === 0) {
      return <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No tasks in this project</Text>;
    }

    // Use project dates if available, otherwise calculate from tasks
    let projectStart: Date;
    let projectEnd: Date;
    
    if (project.start_date && project.end_date) {
      projectStart = new Date(project.start_date);
      projectEnd = new Date(project.end_date);
    } else {
      // Calculate dates from tasks
      const taskDates = tasks
        .map((task: any) => {
          const created = task.created_at ? new Date(task.created_at) : null;
          const due = task.due_date ? new Date(task.due_date) : (task.dueDate ? new Date(task.dueDate) : null);
          return [created, due].filter(Boolean) as Date[];
        })
        .flat();
      
      if (taskDates.length === 0) {
        // Fallback to current date range
        projectStart = new Date();
        projectEnd = new Date();
        projectEnd.setDate(projectEnd.getDate() + 30); // Default 30 days
      } else {
        projectStart = new Date(Math.min(...taskDates.map(d => d.getTime())));
        projectEnd = new Date(Math.max(...taskDates.map(d => d.getTime())));
        // Add some buffer
        projectEnd.setDate(projectEnd.getDate() + 7);
      }
    }
    
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays <= 0) {
      return <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Invalid date range</Text>;
    }

    // Calculate "Today" marker position
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPosition = ((today.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;
    const showTodayMarker = todayPosition >= 0 && todayPosition <= 100;

    // Calculate middle date for axis
    const middleDate = new Date(projectStart.getTime() + (projectEnd.getTime() - projectStart.getTime()) / 2);

    return (
      <View style={styles.ganttContainer}>
        {/* Priority Legend */}
        <View style={styles.ganttLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: priorityColors[1] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: priorityColors[2] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: priorityColors[3] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: priorityColors[4] }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Urgent</Text>
          </View>
        </View>

        {/* Tasks */}
        {tasks.map((task: any, idx: number) => {
          const startDateRaw = task.start_date || task.startDate;
          const startDate = startDateRaw ? new Date(startDateRaw) : (task.created_at ? new Date(task.created_at) : projectStart);
          const dueDateRaw = task.due_date || task.dueDate;
          const dueDate = dueDateRaw ? new Date(dueDateRaw) : new Date(projectEnd); // Use project end if no due date
          
          const taskStart = startDate < projectStart ? projectStart : startDate;
          const taskEnd = dueDate > projectEnd ? projectEnd : dueDate;
          
          const daysFromStart = Math.max(0, Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
          const taskDuration = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)));
          const leftPercent = (daysFromStart / totalDays) * 100;
          const widthPercent = Math.min((taskDuration / totalDays) * 100, 100 - leftPercent);
          
          const priority = task.priority || 4;
          const taskColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors[4];
          const isCompleted = !!(task.completed_at || task.completedAt || task.status === 'completed');

          return (
            <TouchableOpacity 
              key={task.id || idx} 
              style={styles.ganttRow}
              onPress={() => onTaskClick?.(task)}
              activeOpacity={0.7}
            >
              <View style={styles.ganttTaskInfo}>
                {isCompleted && (
                  <FontAwesome name="check-circle" size={14} color="#10B981" style={styles.ganttCheckIcon} />
                )}
                <Text 
                  style={[
                    styles.ganttTaskName, 
                    { color: theme.text },
                    isCompleted && styles.ganttTaskNameCompleted
                  ]} 
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </View>
              <View style={[styles.ganttBarContainer, { backgroundColor: theme.border + '30' }]}>
                {/* Today marker (rendered behind bars) */}
                {showTodayMarker && (
                  <View 
                    style={[
                      styles.ganttTodayMarker, 
                      { left: `${todayPosition}%`, backgroundColor: theme.primary }
                    ]} 
                  />
                )}
                {/* Task bar */}
                <View
                  style={[
                    styles.ganttBar,
                    {
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: isCompleted ? taskColor + '60' : taskColor,
                      borderColor: taskColor,
                      borderWidth: isCompleted ? 2 : 0,
                    },
                  ]}
                >
                  {/* Completion stripe pattern for completed tasks */}
                  {isCompleted && (
                    <View style={styles.ganttBarCompleted}>
                      <FontAwesome name="check" size={10} color={taskColor} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Milestone markers */}
        {milestones.length > 0 && (
          <View style={styles.ganttMilestones}>
            <Text style={[styles.ganttMilestonesLabel, { color: theme.textSecondary }]}>Milestones:</Text>
            <View style={styles.ganttMilestonesList}>
              {milestones.slice(0, 3).map((milestone: string, idx: number) => (
                <View key={idx} style={styles.ganttMilestoneItem}>
                  <FontAwesome name="flag" size={12} color={theme.warning} />
                  <Text style={[styles.ganttMilestoneText, { color: theme.text }]} numberOfLines={1}>
                    {milestone}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Date axis */}
        <View style={[styles.ganttDateAxis, { borderTopColor: theme.border }]}>
          <Text style={[styles.ganttLabel, { color: theme.textSecondary }]}>
            {projectStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <View style={styles.ganttDateAxisCenter}>
            {showTodayMarker && (
              <View style={styles.ganttTodayLabel}>
                <View style={[styles.ganttTodayDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.ganttTodayText, { color: theme.primary }]}>Today</Text>
              </View>
            )}
            {!showTodayMarker && (
              <Text style={[styles.ganttLabel, { color: theme.textSecondary }]}>
                {middleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            )}
          </View>
          <Text style={[styles.ganttLabel, { color: theme.textSecondary }]}>
            {projectEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={true}>
      {/* Header with Project Details and Action Links */}
      <View style={[styles.headerSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Project Details</Text>
          <View style={styles.headerActions}>
            {onTeamClick && (
              <TouchableOpacity
                style={[styles.headerLink, { borderColor: theme.border }]}
                onPress={onTeamClick}
              >
                <FontAwesome name="users" size={14} color={theme.primary} />
                <Text style={[styles.headerLinkText, { color: theme.primary }]}>Team</Text>
              </TouchableOpacity>
            )}
            {onToolsClick && (
              <TouchableOpacity
                style={[styles.headerLink, { borderColor: theme.border }]}
                onPress={onToolsClick}
              >
                <FontAwesome name="wrench" size={14} color={theme.primary} />
                <Text style={[styles.headerLinkText, { color: theme.primary }]}>Tools</Text>
              </TouchableOpacity>
            )}
            {onAddTask && (
              <TouchableOpacity
                style={[styles.headerLink, { borderColor: theme.border }]}
                onPress={onAddTask}
              >
                <FontAwesome name="plus" size={14} color={theme.primary} />
                <Text style={[styles.headerLinkText, { color: theme.primary }]}>+Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Summary Cards - Quick Overview */}
      <View style={styles.summaryCardsContainer}>
        {/* Project Health Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryCardHeader}>
            <FontAwesome name="heartbeat" size={16} color={healthColors[health]} />
            <Text style={[styles.summaryCardLabel, { color: theme.textSecondary }]}>Health</Text>
          </View>
          <View style={styles.summaryCardContent}>
            <View style={[styles.healthIndicator, { backgroundColor: healthColors[health] }]} />
            <Text style={[styles.summaryCardValue, { color: healthColors[health] }]}>
              {healthLabels[health]}
            </Text>
          </View>
        </View>

        {/* Task Progress Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryCardHeader}>
            <FontAwesome name="tasks" size={16} color={theme.primary} />
            <Text style={[styles.summaryCardLabel, { color: theme.textSecondary }]}>Progress</Text>
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={[styles.summaryCardValueLarge, { color: theme.text }]}>
              {completionPercent}%
            </Text>
            <Text style={[styles.summaryCardSubtext, { color: theme.textSecondary }]}>
              {completedTasks}/{totalTasks} tasks
            </Text>
          </View>
          {/* Progress bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${completionPercent}%`,
                  backgroundColor: completionPercent === 100 ? '#10B981' : theme.primary 
                }
              ]} 
            />
          </View>
        </View>

        {/* Days Remaining Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryCardHeader}>
            <FontAwesome name="calendar" size={16} color={theme.accent} />
            <Text style={[styles.summaryCardLabel, { color: theme.textSecondary }]}>Timeline</Text>
          </View>
          <View style={styles.summaryCardContent}>
            {daysRemaining !== null ? (
              <>
                <Text style={[
                  styles.summaryCardValueLarge, 
                  { color: daysRemaining < 0 ? '#EF4444' : daysRemaining <= 7 ? '#F59E0B' : theme.text }
                ]}>
                  {daysRemaining < 0 ? Math.abs(daysRemaining) : daysRemaining}
                </Text>
                <Text style={[styles.summaryCardSubtext, { color: theme.textSecondary }]}>
                  {daysRemaining < 0 ? 'days overdue' : daysRemaining === 0 ? 'due today' : daysRemaining === 1 ? 'day left' : 'days left'}
                </Text>
              </>
            ) : (
              <Text style={[styles.summaryCardSubtext, { color: theme.textSecondary }]}>
                No end date set
              </Text>
            )}
          </View>
        </View>

        {/* Risks Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryCardHeader}>
            <FontAwesome name="exclamation-triangle" size={16} color={risks.length > 0 ? '#F59E0B' : theme.textTertiary} />
            <Text style={[styles.summaryCardLabel, { color: theme.textSecondary }]}>Risks</Text>
          </View>
          <View style={styles.summaryCardContent}>
            <Text style={[
              styles.summaryCardValueLarge, 
              { color: risks.length > 3 ? '#EF4444' : risks.length > 0 ? '#F59E0B' : '#10B981' }
            ]}>
              {risks.length}
            </Text>
            <Text style={[styles.summaryCardSubtext, { color: theme.textSecondary }]}>
              {risks.length === 0 ? 'No risks' : risks.length === 1 ? 'risk identified' : 'risks identified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Gantt Chart */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gantt Chart</Text>
        {renderGanttChart()}
      </View>

      {/* Key Milestones Status */}
      {milestones.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Milestones</Text>
            <View style={[styles.sectionBadge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.sectionBadgeText, { color: theme.primary }]}>
                {milestones.length} total
              </Text>
            </View>
          </View>
          {/* Milestone progress bar */}
          <View style={styles.milestoneProgress}>
            <View style={[styles.milestoneProgressBar, { backgroundColor: theme.border }]}>
              {milestones.map((_, idx) => (
                <View 
                  key={idx}
                  style={[
                    styles.milestoneProgressSegment,
                    { 
                      backgroundColor: idx < Math.ceil(milestones.length * completionPercent / 100) 
                        ? '#10B981' 
                        : 'transparent',
                      borderRightColor: theme.surface,
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.milestoneProgressText, { color: theme.textSecondary }]}>
              ~{Math.ceil(milestones.length * completionPercent / 100)} estimated complete
            </Text>
          </View>
          {milestones.map((milestone: string, idx: number) => {
            // Estimate milestone status based on project progress
            const milestoneProgress = (idx + 1) / milestones.length;
            const projectProgress = completionPercent / 100;
            const status = projectProgress >= milestoneProgress ? 'complete' 
              : projectProgress >= milestoneProgress - 0.15 ? 'on-track' 
              : 'upcoming';
            const statusConfig = {
              'complete': { color: '#10B981', icon: 'check-circle' as const, label: 'Complete' },
              'on-track': { color: '#3B82F6', icon: 'clock-o' as const, label: 'In Progress' },
              'upcoming': { color: theme.textTertiary, icon: 'circle-o' as const, label: 'Upcoming' },
            };
            const config = statusConfig[status];
            
            return (
              <View key={idx} style={[styles.milestoneItem, { borderBottomColor: theme.border + '40' }]}>
                <View style={styles.milestoneNumber}>
                  <Text style={[styles.milestoneNumberText, { color: theme.textSecondary }]}>
                    {idx + 1}
                  </Text>
                </View>
                <FontAwesome name={config.icon} size={18} color={config.color} />
                <Text style={[
                  styles.milestoneText, 
                  { color: theme.text },
                  status === 'complete' && styles.milestoneTextComplete
                ]}>
                  {milestone}
                </Text>
                <View style={[styles.milestoneStatusBadge, { backgroundColor: config.color + '15' }]}>
                  <Text style={[styles.milestoneStatusText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Resource Allocation */}
      {(resources.people || resources.tools) && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Resource Allocation</Text>
          {resources.people && Array.isArray(resources.people) && resources.people.length > 0 && (
            <View style={styles.resourceGroup}>
              <Text style={[styles.resourceGroupTitle, { color: theme.textSecondary }]}>People</Text>
              {resources.people.map((person: string, idx: number) => (
                <View key={idx} style={styles.resourceItem}>
                  <FontAwesome name="user" size={16} color={theme.accent} />
                  <Text style={[styles.resourceText, { color: theme.text }]}>{person}</Text>
                </View>
              ))}
            </View>
          )}
          {resources.tools && Array.isArray(resources.tools) && resources.tools.length > 0 && (
            <View style={styles.resourceGroup}>
              <Text style={[styles.resourceGroupTitle, { color: theme.textSecondary }]}>Tools</Text>
              {resources.tools.map((tool: string, idx: number) => (
                <View key={idx} style={styles.resourceItem}>
                  <FontAwesome name="wrench" size={16} color={theme.warning} />
                  <Text style={[styles.resourceText, { color: theme.text }]}>{tool}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Deliverables</Text>
            <View style={[styles.sectionBadge, { backgroundColor: theme.accent + '20' }]}>
              <FontAwesome name="cube" size={10} color={theme.accent} />
              <Text style={[styles.sectionBadgeText, { color: theme.accent }]}>
                {deliverables.length} items
              </Text>
            </View>
          </View>
          {deliverables.map((deliverable: string, idx: number) => {
            // Estimate deliverable completion based on project progress
            const deliverableProgress = (idx + 1) / deliverables.length;
            const isLikelyComplete = (completionPercent / 100) >= deliverableProgress;
            
            return (
              <View key={idx} style={[styles.deliverableItem, { borderBottomColor: theme.border + '40' }]}>
                <View style={styles.deliverableNumber}>
                  <Text style={[styles.deliverableNumberText, { color: theme.textSecondary }]}>
                    {idx + 1}
                  </Text>
                </View>
                <FontAwesome 
                  name={isLikelyComplete ? "check-square-o" : "square-o"} 
                  size={18} 
                  color={isLikelyComplete ? '#10B981' : theme.textTertiary} 
                />
                <Text style={[
                  styles.deliverableText, 
                  { color: theme.text },
                  isLikelyComplete && styles.deliverableTextComplete
                ]}>
                  {deliverable}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Team Roles & Responsibilities */}
      {teamRoles.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Team Roles & Responsibilities</Text>
          {teamRoles.map((role: string, idx: number) => (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: theme.textSecondary }]} />
              <Text style={[styles.listText, { color: theme.text }]}>{role}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dependencies</Text>
          {dependencies.map((dep: string, idx: number) => (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, styles.bulletInfo, { backgroundColor: theme.accent }]} />
              <Text style={[styles.listText, { color: theme.text }]}>{dep}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Success Criteria */}
      {successCriteria.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Success Criteria / KPIs</Text>
          {successCriteria.map((criteria: string, idx: number) => (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, styles.bulletSuccess, { backgroundColor: theme.success }]} />
              <Text style={[styles.listText, { color: theme.text }]}>{criteria}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Assumptions</Text>
          {assumptions.map((assumption: string, idx: number) => (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: theme.textSecondary }]} />
              <Text style={[styles.listText, { color: theme.text }]}>{assumption}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Constraints */}
      {project.constraints && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Constraints</Text>
          <Text style={[styles.constraintText, { color: theme.text }]}>{project.constraints}</Text>
        </View>
      )}

      {/* Risk Register Summary */}
      {topRisks.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Risk Register</Text>
            <View style={[
              styles.sectionBadge, 
              { backgroundColor: risks.length > 3 ? '#EF444420' : risks.length > 0 ? '#F59E0B20' : '#10B98120' }
            ]}>
              <FontAwesome 
                name="exclamation-triangle" 
                size={10} 
                color={risks.length > 3 ? '#EF4444' : risks.length > 0 ? '#F59E0B' : '#10B981'} 
              />
              <Text style={[
                styles.sectionBadgeText, 
                { color: risks.length > 3 ? '#EF4444' : risks.length > 0 ? '#F59E0B' : '#10B981' }
              ]}>
                {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
              </Text>
            </View>
          </View>
          {/* Risk severity legend */}
          <View style={styles.riskLegend}>
            <View style={styles.riskLegendItem}>
              <View style={[styles.riskLegendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.riskLegendText, { color: theme.textSecondary }]}>High</Text>
            </View>
            <View style={styles.riskLegendItem}>
              <View style={[styles.riskLegendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.riskLegendText, { color: theme.textSecondary }]}>Medium</Text>
            </View>
            <View style={styles.riskLegendItem}>
              <View style={[styles.riskLegendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.riskLegendText, { color: theme.textSecondary }]}>Low</Text>
            </View>
          </View>
          {topRisks.map((risk: string, idx: number) => {
            // Assign severity based on position (first = highest priority) and keywords
            const riskLower = risk.toLowerCase();
            const hasHighKeywords = riskLower.includes('critical') || riskLower.includes('major') || riskLower.includes('severe');
            const hasLowKeywords = riskLower.includes('minor') || riskLower.includes('low') || riskLower.includes('unlikely');
            
            let severity: 'high' | 'medium' | 'low';
            if (hasHighKeywords || idx === 0) {
              severity = 'high';
            } else if (hasLowKeywords || idx >= 3) {
              severity = 'low';
            } else {
              severity = 'medium';
            }
            
            const severityConfig = {
              high: { color: '#EF4444', icon: 'exclamation-circle' as const, label: 'HIGH' },
              medium: { color: '#F59E0B', icon: 'exclamation' as const, label: 'MED' },
              low: { color: '#10B981', icon: 'info-circle' as const, label: 'LOW' },
            };
            const config = severityConfig[severity];
            
            return (
              <View key={idx} style={[styles.riskItem, { borderBottomColor: theme.border + '40' }]}>
                <View style={[styles.riskSeverityBadge, { backgroundColor: config.color + '15' }]}>
                  <FontAwesome name={config.icon} size={12} color={config.color} />
                  <Text style={[styles.riskSeverityText, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={[styles.riskText, { color: theme.text }]}>{risk}</Text>
              </View>
            );
          })}
          {risks.length > 5 && (
            <Text style={[styles.riskMoreText, { color: theme.textSecondary }]}>
              +{risks.length - 5} more risks not shown
            </Text>
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  // Summary Cards Styles
  summaryCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Platform.OS === 'web' ? 8 : 8,
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 180 : 150,
    maxWidth: Platform.OS === 'web' ? 250 : '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCardValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  summaryCardSubtext: {
    fontSize: 13,
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerLinkText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  ganttContainer: {
    marginTop: 8,
  },
  ganttLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
  },
  ganttRow: {
    marginBottom: 12,
  },
  ganttTaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ganttCheckIcon: {
    marginRight: 6,
  },
  ganttTaskName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  ganttTaskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  ganttBarContainer: {
    height: 24,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  ganttBar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ganttBarCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ganttTodayMarker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    zIndex: 1,
  },
  ganttMilestones: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  ganttMilestonesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ganttMilestonesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ganttMilestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ganttMilestoneText: {
    fontSize: 13,
    maxWidth: 150,
  },
  ganttDateAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ganttDateAxisCenter: {
    alignItems: 'center',
  },
  ganttTodayLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ganttTodayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ganttTodayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ganttLabel: {
    fontSize: 12,
  },
  milestoneProgress: {
    marginBottom: 16,
  },
  milestoneProgressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  milestoneProgressSegment: {
    flex: 1,
    borderRightWidth: 2,
  },
  milestoneProgressText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  milestoneNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  milestoneText: {
    flex: 1,
    fontSize: 15,
  },
  milestoneTextComplete: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  milestoneStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  milestoneStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resourceGroup: {
    marginBottom: 16,
  },
  resourceGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  resourceText: {
    fontSize: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  bulletInfo: {},
  bulletSuccess: {},
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  constraintText: {
    fontSize: 15,
    lineHeight: 22,
  },
  riskLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  riskLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  riskLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  riskLegendText: {
    fontSize: 11,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  riskSeverityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
  },
  riskSeverityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  riskText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  riskMoreText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  // Deliverable styles
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  deliverableNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deliverableText: {
    flex: 1,
    fontSize: 15,
  },
  deliverableTextComplete: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
