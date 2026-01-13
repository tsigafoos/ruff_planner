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

    return (
      <View style={styles.ganttContainer}>
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

          return (
            <TouchableOpacity 
              key={task.id || idx} 
              style={styles.ganttRow}
              onPress={() => onTaskClick?.(task)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ganttTaskName, { color: theme.text }]} numberOfLines={1}>
                {task.title}
              </Text>
              <View style={[styles.ganttBarContainer, { backgroundColor: theme.border + '40' }]}>
                <View
                  style={[
                    styles.ganttBar,
                    {
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: taskColor,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={styles.ganttLabels}>
          <Text style={[styles.ganttLabel, { color: theme.textSecondary }]}>
            {projectStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
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

      {/* Gantt Chart */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gantt Chart</Text>
        {renderGanttChart()}
      </View>

      {/* Key Milestones Status */}
      {milestones.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Milestones</Text>
          {milestones.map((milestone: string, idx: number) => (
            <View key={idx} style={[styles.milestoneItem, { borderBottomColor: theme.borderLight }]}>
              <View style={[styles.milestoneStatus, styles.milestoneOnTrack]} />
              <Text style={[styles.milestoneText, { color: theme.text }]}>{milestone}</Text>
              <Text style={[styles.milestoneStatusText, { color: theme.textSecondary }]}>On Track</Text>
            </View>
          ))}
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Deliverables</Text>
          {deliverables.map((deliverable: string, idx: number) => (
            <View key={idx} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: theme.textSecondary }]} />
              <Text style={[styles.listText, { color: theme.text }]}>{deliverable}</Text>
            </View>
          ))}
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top 5 Risks</Text>
          {topRisks.map((risk: string, idx: number) => (
            <View key={idx} style={[styles.riskItem, { borderBottomColor: theme.borderLight }]}>
              <View style={[styles.riskSeverity, styles.riskHigh]} />
              <Text style={[styles.riskText, { color: theme.text }]}>{risk}</Text>
            </View>
          ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  ganttContainer: {
    marginTop: 8,
  },
  ganttRow: {
    marginBottom: 12,
  },
  ganttTaskName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  ganttBarContainer: {
    height: 24,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  ganttBar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  ganttLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ganttLabel: {
    fontSize: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  milestoneStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  milestoneOnTrack: {
    backgroundColor: '#10B981',
  },
  milestoneText: {
    flex: 1,
    fontSize: 15,
  },
  milestoneStatusText: {
    fontSize: 12,
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
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  riskSeverity: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riskHigh: {
    backgroundColor: '#EF4444',
  },
  riskText: {
    flex: 1,
    fontSize: 15,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
