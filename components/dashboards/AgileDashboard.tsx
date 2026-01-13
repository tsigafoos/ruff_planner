import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DocumentationView from '../documentation/DocumentationView';

interface AgileDashboardProps {
  project: any;
  tasks: any[];
  onProjectUpdate?: (updates: any) => Promise<void>;
}

export default function AgileDashboard({ project, tasks, onProjectUpdate }: AgileDashboardProps) {
  // Parse data
  const completedTasks = tasks.filter((t: any) => t.completed_at || t.completedAt);
  const incompleteTasks = tasks.filter((t: any) => !(t.completed_at || t.completedAt));
  
  // Task board columns
  const todoTasks = incompleteTasks.filter((t: any) => !t.in_progress);
  const inProgressTasks = incompleteTasks.filter((t: any) => t.in_progress);
  const doneTasks = completedTasks;

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Velocity (simplified - would need sprint data)
  const velocity = Math.floor(totalTasks * 0.3); // Placeholder

  // Calculate project health
  const calculateHealth = () => {
    if (completionRate >= 80) return 'green';
    if (completionRate >= 50) return 'yellow';
    return 'red';
  };

  const health = calculateHealth();
  const healthColors = {
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
  };

  // Burndown chart (simplified visualization)
  const renderBurndown = () => {
    const days = 14; // 2-week sprint
    const idealBurndown = totalTasks;
    const idealPerDay = idealBurndown / days;
    
    // Simple burndown visualization
    return (
      <View style={styles.burndownContainer}>
        <View style={styles.burndownChart}>
          {/* Ideal line */}
          <View style={styles.burndownLine}>
            {Array.from({ length: days }).map((_, idx) => {
              const ideal = idealBurndown - (idealPerDay * idx);
              const height = (ideal / idealBurndown) * 100;
              return (
                <View
                  key={idx}
                  style={[
                    styles.burndownBar,
                    styles.burndownIdeal,
                    { height: `${Math.max(10, height)}%` },
                  ]}
                />
              );
            })}
          </View>
          {/* Actual line (simplified) */}
          <View style={styles.burndownLine}>
            {Array.from({ length: days }).map((_, idx) => {
              const actual = Math.max(0, idealBurndown - (idealPerDay * idx * 1.1));
              const height = (actual / idealBurndown) * 100;
              return (
                <View
                  key={idx}
                  style={[
                    styles.burndownBar,
                    styles.burndownActual,
                    { height: `${Math.max(10, height)}%` },
                  ]}
                />
              );
            })}
          </View>
        </View>
        <View style={styles.burndownLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={styles.legendText}>Ideal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Actual</Text>
          </View>
        </View>
      </View>
    );
  };

  // Velocity chart (simplified)
  const renderVelocity = () => {
    const sprints = [1, 2, 3, 4];
    const maxVelocity = Math.max(velocity, 20);
    
    return (
      <View style={styles.velocityContainer}>
        <View style={styles.velocityChart}>
          {sprints.map((sprint) => {
            const sprintVelocity = velocity + Math.floor(Math.random() * 5 - 2);
            const height = (sprintVelocity / maxVelocity) * 100;
            return (
              <View key={sprint} style={styles.velocityItem}>
                <View style={[styles.velocityBar, { height: `${Math.max(20, height)}%` }]} />
                <Text style={styles.velocityLabel}>S{sprint}</Text>
                <Text style={styles.velocityValue}>{sprintVelocity}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const isWeb = Platform.OS === 'web';
  const containerStyle = isWeb ? styles.webContainer : styles.container;
  const sectionStyle = isWeb ? styles.webSection : styles.section;

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={true}>
      {/* Project Health Indicator */}
      <View style={styles.healthSection}>
        <View style={[styles.healthIndicator, { backgroundColor: healthColors[health] + '20', borderColor: healthColors[health] }]}>
          <FontAwesome name="circle" size={12} color={healthColors[health]} />
          <Text style={[styles.healthText, { color: healthColors[health] }]}>
            Sprint Health: {health.toUpperCase()}
          </Text>
        </View>
      </View>

      {isWeb ? (
        // Web Layout: Grid-based, full view at a glance
        <View style={styles.webGrid}>
          {/* Left Column: Charts */}
          <View style={styles.webColumn}>
            {/* Sprint Burndown Chart */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Sprint Burndown</Text>
              {renderBurndown()}
            </View>

            {/* Velocity Chart */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Velocity</Text>
              <Text style={styles.metricLabel}>Current Sprint: {velocity} points</Text>
              {renderVelocity()}
            </View>

            {/* Metrics */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{Math.floor(Math.random() * 5 + 2)}</Text>
                  <Text style={styles.metricLabel}>Cycle Time (days)</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{Math.floor(Math.random() * 7 + 3)}</Text>
                  <Text style={styles.metricLabel}>Lead Time (days)</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{incompleteTasks.filter((t: any) => t.blocked).length}</Text>
                  <Text style={styles.metricLabel}>Blocked Items</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Task Board & Status */}
          <View style={styles.webColumn}>
            {/* Task Board */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Task Board</Text>
              <View style={styles.taskBoard}>
                <View style={styles.taskColumn}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>To Do</Text>
                    <Text style={styles.columnCount}>{todoTasks.length}</Text>
                  </View>
                  {todoTasks.slice(0, isWeb ? 8 : 5).map((task: any) => (
                    <View key={task.id} style={styles.taskCard}>
                      <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                    </View>
                  ))}
                  {todoTasks.length === 0 && (
                    <Text style={styles.emptyColumn}>No tasks</Text>
                  )}
                </View>

                <View style={styles.taskColumn}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>In Progress</Text>
                    <Text style={styles.columnCount}>{inProgressTasks.length}</Text>
                  </View>
                  {inProgressTasks.slice(0, isWeb ? 8 : 5).map((task: any) => (
                    <View key={task.id} style={[styles.taskCard, styles.taskCardInProgress]}>
                      <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                    </View>
                  ))}
                  {inProgressTasks.length === 0 && (
                    <Text style={styles.emptyColumn}>No tasks</Text>
                  )}
                </View>

                <View style={styles.taskColumn}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>Done</Text>
                    <Text style={styles.columnCount}>{doneTasks.length}</Text>
                  </View>
                  {doneTasks.slice(0, isWeb ? 8 : 5).map((task: any) => (
                    <View key={task.id} style={[styles.taskCard, styles.taskCardDone]}>
                      <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                    </View>
                  ))}
                  {doneTasks.length === 0 && (
                    <Text style={styles.emptyColumn}>No tasks</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Sprint Goal Status */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Sprint Goal</Text>
              <View style={styles.sprintGoal}>
                <View style={[styles.sprintGoalStatus, { backgroundColor: healthColors[health] + '20' }]}>
                  <FontAwesome name="check-circle" size={20} color={healthColors[health]} />
                  <Text style={[styles.sprintGoalText, { color: healthColors[health] }]}>
                    {completionRate >= 80 ? 'On Track' : completionRate >= 50 ? 'At Risk' : 'Behind'}
                  </Text>
                </View>
                <Text style={styles.sprintGoalProgress}>{Math.round(completionRate)}% Complete</Text>
              </View>
            </View>

            {/* Team Capacity */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Team Capacity</Text>
              <View style={styles.capacityContainer}>
                <View style={styles.capacityItem}>
                  <Text style={styles.capacityLabel}>Capacity</Text>
                  <Text style={styles.capacityValue}>40 hrs</Text>
                </View>
                <View style={styles.capacityItem}>
                  <Text style={styles.capacityLabel}>Committed</Text>
                  <Text style={styles.capacityValue}>{Math.floor(velocity * 1.2)} hrs</Text>
                </View>
              </View>
            </View>

            {/* Top Impediments */}
            <View style={sectionStyle}>
              <Text style={styles.sectionTitle}>Top Impediments</Text>
              {incompleteTasks.filter((t: any) => t.blocked).length > 0 ? (
                incompleteTasks
                  .filter((t: any) => t.blocked)
                  .slice(0, 5)
                  .map((task: any) => (
                    <View key={task.id} style={styles.impedimentItem}>
                      <FontAwesome name="exclamation-triangle" size={16} color="#F59E0B" />
                      <Text style={styles.impedimentText}>{task.title}</Text>
                    </View>
                  ))
              ) : (
                <Text style={styles.emptyText}>No impediments</Text>
              )}
            </View>

            {/* Documentation (Web Only) */}
            {Platform.OS === 'web' && onProjectUpdate && (
              <View style={sectionStyle}>
                <Text style={styles.sectionTitle}>Documentation</Text>
                <DocumentationView
                  documentation={Array.isArray(project.documentation) ? project.documentation : []}
                  onUpdate={async (docs) => {
                    await onProjectUpdate({ documentation: docs });
                  }}
                />
              </View>
            )}
          </View>
        </View>
      ) : (
        // Mobile Layout: Stacked, scrollable
        <>
          {/* Sprint Burndown Chart */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Sprint Burndown</Text>
            {renderBurndown()}
          </View>

          {/* Velocity Chart */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Velocity</Text>
            <Text style={styles.metricLabel}>Current Sprint: {velocity} points</Text>
            {renderVelocity()}
          </View>

          {/* Task Board */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Task Board</Text>
            <View style={styles.taskBoard}>
              <View style={styles.taskColumn}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>To Do</Text>
                  <Text style={styles.columnCount}>{todoTasks.length}</Text>
                </View>
                {todoTasks.slice(0, 5).map((task: any) => (
                  <View key={task.id} style={styles.taskCard}>
                    <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                  </View>
                ))}
                {todoTasks.length === 0 && (
                  <Text style={styles.emptyColumn}>No tasks</Text>
                )}
              </View>

              <View style={styles.taskColumn}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>In Progress</Text>
                  <Text style={styles.columnCount}>{inProgressTasks.length}</Text>
                </View>
                {inProgressTasks.slice(0, 5).map((task: any) => (
                  <View key={task.id} style={[styles.taskCard, styles.taskCardInProgress]}>
                    <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                  </View>
                ))}
                {inProgressTasks.length === 0 && (
                  <Text style={styles.emptyColumn}>No tasks</Text>
                )}
              </View>

              <View style={styles.taskColumn}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>Done</Text>
                  <Text style={styles.columnCount}>{doneTasks.length}</Text>
                </View>
                {doneTasks.slice(0, 5).map((task: any) => (
                  <View key={task.id} style={[styles.taskCard, styles.taskCardDone]}>
                    <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
                  </View>
                ))}
                {doneTasks.length === 0 && (
                  <Text style={styles.emptyColumn}>No tasks</Text>
                )}
              </View>
            </View>
          </View>

          {/* Metrics */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{Math.floor(Math.random() * 5 + 2)}</Text>
                <Text style={styles.metricLabel}>Cycle Time (days)</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{Math.floor(Math.random() * 7 + 3)}</Text>
                <Text style={styles.metricLabel}>Lead Time (days)</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{incompleteTasks.filter((t: any) => t.blocked).length}</Text>
                <Text style={styles.metricLabel}>Blocked Items</Text>
              </View>
            </View>
          </View>

          {/* Sprint Goal Status */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Sprint Goal</Text>
            <View style={styles.sprintGoal}>
              <View style={[styles.sprintGoalStatus, { backgroundColor: healthColors[health] + '20' }]}>
                <FontAwesome name="check-circle" size={20} color={healthColors[health]} />
                <Text style={[styles.sprintGoalText, { color: healthColors[health] }]}>
                  {completionRate >= 80 ? 'On Track' : completionRate >= 50 ? 'At Risk' : 'Behind'}
                </Text>
              </View>
              <Text style={styles.sprintGoalProgress}>{Math.round(completionRate)}% Complete</Text>
            </View>
          </View>

          {/* Team Capacity */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Team Capacity</Text>
            <View style={styles.capacityContainer}>
              <View style={styles.capacityItem}>
                <Text style={styles.capacityLabel}>Capacity</Text>
                <Text style={styles.capacityValue}>40 hrs</Text>
              </View>
              <View style={styles.capacityItem}>
                <Text style={styles.capacityLabel}>Committed</Text>
                <Text style={styles.capacityValue}>{Math.floor(velocity * 1.2)} hrs</Text>
              </View>
            </View>
          </View>

          {/* Top Impediments */}
          <View style={sectionStyle}>
            <Text style={styles.sectionTitle}>Top Impediments</Text>
            {incompleteTasks.filter((t: any) => t.blocked).length > 0 ? (
              incompleteTasks
                .filter((t: any) => t.blocked)
                .slice(0, 5)
                .map((task: any) => (
                  <View key={task.id} style={styles.impedimentItem}>
                    <FontAwesome name="exclamation-triangle" size={16} color="#F59E0B" />
                    <Text style={styles.impedimentText}>{task.title}</Text>
                  </View>
                ))
            ) : (
              <Text style={styles.emptyText}>No impediments</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  webGrid: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  webColumn: {
    flex: 1,
    minWidth: 0,
  },
  healthSection: {
    padding: Platform.OS === 'web' ? 20 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: Platform.OS === 'web' ? 16 : 0,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  healthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  webSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  burndownContainer: {
    marginTop: 8,
  },
  burndownChart: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  burndownLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    flex: 1,
  },
  burndownBar: {
    flex: 1,
    minHeight: 10,
    borderRadius: 2,
  },
  burndownIdeal: {
    backgroundColor: '#9CA3AF',
    opacity: 0.3,
  },
  burndownActual: {
    backgroundColor: '#3B82F6',
  },
  burndownLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  velocityContainer: {
    marginTop: 8,
  },
  velocityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    paddingHorizontal: 16,
  },
  velocityItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  velocityBar: {
    width: '80%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    minHeight: 20,
    marginBottom: 8,
  },
  velocityLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  velocityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskBoard: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  taskColumn: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  columnCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskCardInProgress: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  taskCardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  taskCardTitle: {
    fontSize: 13,
    color: '#374151',
  },
  emptyColumn: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sprintGoal: {
    marginTop: 8,
  },
  sprintGoalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sprintGoalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sprintGoalProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  capacityContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  capacityItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  capacityValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  impedimentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  impedimentText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
});
