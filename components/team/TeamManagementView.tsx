import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import TeamManagementEditor from './TeamManagementEditor';
import { useState } from 'react';

interface TeamManagementData {
  teamRoles?: Array<{
    name: string;
    description: string;
    responsibilities: string[];
    reportingTo?: string;
    skills?: string[];
  }>;
  goals?: Array<{
    title: string;
    description: string;
    smartCriteria: string;
    timeline: string;
    kpis: string[];
  }>;
  communicationPlan?: {
    tools?: string[];
    protocols?: string;
    escalationPaths?: string;
  };
  resourceAllocation?: {
    capacityPlanning?: string;
    schedules?: string;
    budget?: string;
  };
  performanceMonitoring?: {
    metrics?: string[];
    reviewFrequency?: string;
    tools?: string[];
  };
  motivationDevelopment?: {
    incentives?: string[];
    trainingPlans?: string[];
    recognitionPrograms?: string[];
  };
  conflictResolution?: {
    policies?: string;
    mediationProcess?: string;
    documentation?: string;
  };
  riskManagement?: {
    riskRegister?: Array<{
      risk: string;
      severity: string;
      mitigation: string;
    }>;
    mitigationStrategies?: string[];
    contingencyPlans?: string[];
  };
}

interface TeamManagementViewProps {
  teamManagement: TeamManagementData;
  onUpdate: (updatedData: TeamManagementData) => Promise<void>;
}

export default function TeamManagementView({ teamManagement, onUpdate }: TeamManagementViewProps) {
  const [editing, setEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['teamRoles']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (editing) {
    return (
      <TeamManagementEditor
        initialData={teamManagement}
        onSave={async (data) => {
          await onUpdate(data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  // Don't render if no data (to avoid showing empty section)
  const hasData = 
    (teamManagement.teamRoles && teamManagement.teamRoles.length > 0) ||
    (teamManagement.goals && teamManagement.goals.length > 0) ||
    (teamManagement.communicationPlan && (
      (teamManagement.communicationPlan.tools && teamManagement.communicationPlan.tools.length > 0) ||
      teamManagement.communicationPlan.protocols ||
      teamManagement.communicationPlan.escalationPaths
    )) ||
    (teamManagement.resourceAllocation && (
      teamManagement.resourceAllocation.capacityPlanning ||
      teamManagement.resourceAllocation.schedules ||
      teamManagement.resourceAllocation.budget
    )) ||
    (teamManagement.performanceMonitoring && (
      (teamManagement.performanceMonitoring.metrics && teamManagement.performanceMonitoring.metrics.length > 0) ||
      teamManagement.performanceMonitoring.reviewFrequency ||
      (teamManagement.performanceMonitoring.tools && teamManagement.performanceMonitoring.tools.length > 0)
    )) ||
    (teamManagement.motivationDevelopment && (
      (teamManagement.motivationDevelopment.incentives && teamManagement.motivationDevelopment.incentives.length > 0) ||
      (teamManagement.motivationDevelopment.trainingPlans && teamManagement.motivationDevelopment.trainingPlans.length > 0) ||
      (teamManagement.motivationDevelopment.recognitionPrograms && teamManagement.motivationDevelopment.recognitionPrograms.length > 0)
    )) ||
    (teamManagement.conflictResolution && (
      teamManagement.conflictResolution.policies ||
      teamManagement.conflictResolution.mediationProcess ||
      teamManagement.conflictResolution.documentation
    )) ||
    (teamManagement.riskManagement && (
      (teamManagement.riskManagement.riskRegister && teamManagement.riskManagement.riskRegister.length > 0) ||
      (teamManagement.riskManagement.mitigationStrategies && teamManagement.riskManagement.mitigationStrategies.length > 0) ||
      (teamManagement.riskManagement.contingencyPlans && teamManagement.riskManagement.contingencyPlans.length > 0)
    ));

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Team Management</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <FontAwesome name="edit" size={16} color="#3B82F6" />
            <Text style={styles.editButtonText}>Add Team Management</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No team management data yet. Click "Add Team Management" to get started.</Text>
        </View>
      </View>
    );
  }

  const renderSection = (
    title: string,
    sectionKey: string,
    content: React.ReactNode,
    icon: string
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.sectionHeaderLeft}>
            <FontAwesome name={icon as any} size={18} color="#3B82F6" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <FontAwesome
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>
        {isExpanded && <View style={styles.sectionContent}>{content}</View>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team Management</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(true)}
        >
          <FontAwesome name="edit" size={16} color="#3B82F6" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Team Roles and Structure */}
        {renderSection(
          'Team Roles & Structure',
          'teamRoles',
          teamManagement.teamRoles && teamManagement.teamRoles.length > 0 ? (
            teamManagement.teamRoles.map((role, idx) => (
              <View key={idx} style={styles.roleCard}>
                <Text style={styles.roleName}>{role.name}</Text>
                {role.description && (
                  <Text style={styles.roleDescription}>{role.description}</Text>
                )}
                {role.reportingTo && (
                  <View style={styles.roleDetail}>
                    <FontAwesome name="sitemap" size={14} color="#6B7280" />
                    <Text style={styles.roleDetailText}>Reports to: {role.reportingTo}</Text>
                  </View>
                )}
                {role.responsibilities && role.responsibilities.length > 0 && (
                  <View style={styles.roleList}>
                    <Text style={styles.roleListTitle}>Responsibilities:</Text>
                    {role.responsibilities.map((resp, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.listText}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {role.skills && role.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {role.skills.map((skill, i) => (
                      <View key={i} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No team roles defined</Text>
          ),
          'users'
        )}

        {/* Goal Setting */}
        {renderSection(
          'Goal Setting',
          'goals',
          teamManagement.goals && teamManagement.goals.length > 0 ? (
            teamManagement.goals.map((goal, idx) => (
              <View key={idx} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.description && (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                )}
                {goal.timeline && (
                  <View style={styles.goalDetail}>
                    <FontAwesome name="calendar" size={14} color="#6B7280" />
                    <Text style={styles.goalDetailText}>{goal.timeline}</Text>
                  </View>
                )}
                {goal.smartCriteria && (
                  <View style={styles.goalDetail}>
                    <FontAwesome name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.goalDetailText}>SMART: {goal.smartCriteria}</Text>
                  </View>
                )}
                {goal.kpis && goal.kpis.length > 0 && (
                  <View style={styles.roleList}>
                    <Text style={styles.roleListTitle}>KPIs:</Text>
                    {goal.kpis.map((kpi, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.listText}>{kpi}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No goals defined</Text>
          ),
          'target'
        )}

        {/* Communication Plan */}
        {renderSection(
          'Communication Plan',
          'communicationPlan',
          teamManagement.communicationPlan ? (
            <View>
              {teamManagement.communicationPlan.tools && teamManagement.communicationPlan.tools.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Tools:</Text>
                  <View style={styles.tagsContainer}>
                    {teamManagement.communicationPlan.tools.map((tool, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tool}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {teamManagement.communicationPlan.protocols && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Protocols:</Text>
                  <Text style={styles.textContent}>{teamManagement.communicationPlan.protocols}</Text>
                </View>
              )}
              {teamManagement.communicationPlan.escalationPaths && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Escalation Paths:</Text>
                  <Text style={styles.textContent}>{teamManagement.communicationPlan.escalationPaths}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No communication plan defined</Text>
          ),
          'comments'
        )}

        {/* Resource Allocation */}
        {renderSection(
          'Resource Allocation',
          'resourceAllocation',
          teamManagement.resourceAllocation ? (
            <View>
              {teamManagement.resourceAllocation.capacityPlanning && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Capacity Planning:</Text>
                  <Text style={styles.textContent}>{teamManagement.resourceAllocation.capacityPlanning}</Text>
                </View>
              )}
              {teamManagement.resourceAllocation.schedules && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Schedules:</Text>
                  <Text style={styles.textContent}>{teamManagement.resourceAllocation.schedules}</Text>
                </View>
              )}
              {teamManagement.resourceAllocation.budget && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Budget:</Text>
                  <Text style={styles.textContent}>{teamManagement.resourceAllocation.budget}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No resource allocation defined</Text>
          ),
          'database'
        )}

        {/* Performance Monitoring */}
        {renderSection(
          'Performance Monitoring',
          'performanceMonitoring',
          teamManagement.performanceMonitoring ? (
            <View>
              {teamManagement.performanceMonitoring.metrics && teamManagement.performanceMonitoring.metrics.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Metrics:</Text>
                  {teamManagement.performanceMonitoring.metrics.map((metric, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{metric}</Text>
                    </View>
                  ))}
                </View>
              )}
              {teamManagement.performanceMonitoring.reviewFrequency && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Review Frequency:</Text>
                  <Text style={styles.textContent}>{teamManagement.performanceMonitoring.reviewFrequency}</Text>
                </View>
              )}
              {teamManagement.performanceMonitoring.tools && teamManagement.performanceMonitoring.tools.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Tools:</Text>
                  <View style={styles.tagsContainer}>
                    {teamManagement.performanceMonitoring.tools.map((tool, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tool}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No performance monitoring defined</Text>
          ),
          'bar-chart'
        )}

        {/* Motivation & Development */}
        {renderSection(
          'Motivation & Development',
          'motivationDevelopment',
          teamManagement.motivationDevelopment ? (
            <View>
              {teamManagement.motivationDevelopment.incentives && teamManagement.motivationDevelopment.incentives.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Incentives:</Text>
                  {teamManagement.motivationDevelopment.incentives.map((incentive, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{incentive}</Text>
                    </View>
                  ))}
                </View>
              )}
              {teamManagement.motivationDevelopment.trainingPlans && teamManagement.motivationDevelopment.trainingPlans.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Training Plans:</Text>
                  {teamManagement.motivationDevelopment.trainingPlans.map((plan, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{plan}</Text>
                    </View>
                  ))}
                </View>
              )}
              {teamManagement.motivationDevelopment.recognitionPrograms && teamManagement.motivationDevelopment.recognitionPrograms.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Recognition Programs:</Text>
                  {teamManagement.motivationDevelopment.recognitionPrograms.map((program, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{program}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No motivation & development plans defined</Text>
          ),
          'trophy'
        )}

        {/* Conflict Resolution */}
        {renderSection(
          'Conflict Resolution',
          'conflictResolution',
          teamManagement.conflictResolution ? (
            <View>
              {teamManagement.conflictResolution.policies && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Policies:</Text>
                  <Text style={styles.textContent}>{teamManagement.conflictResolution.policies}</Text>
                </View>
              )}
              {teamManagement.conflictResolution.mediationProcess && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Mediation Process:</Text>
                  <Text style={styles.textContent}>{teamManagement.conflictResolution.mediationProcess}</Text>
                </View>
              )}
              {teamManagement.conflictResolution.documentation && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Documentation:</Text>
                  <Text style={styles.textContent}>{teamManagement.conflictResolution.documentation}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No conflict resolution policies defined</Text>
          ),
          'handshake-o'
        )}

        {/* Risk Management */}
        {renderSection(
          'Risk Management',
          'riskManagement',
          teamManagement.riskManagement ? (
            <View>
              {teamManagement.riskManagement.riskRegister && teamManagement.riskManagement.riskRegister.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Risk Register:</Text>
                  {teamManagement.riskManagement.riskRegister.map((risk, i) => (
                    <View key={i} style={styles.riskCard}>
                      <View style={styles.riskHeader}>
                        <Text style={styles.riskTitle}>{risk.risk}</Text>
                        <View style={[styles.severityBadge, styles[`severity${risk.severity}` as keyof typeof styles] || styles.severityMedium]}>
                          <Text style={styles.severityText}>{risk.severity}</Text>
                        </View>
                      </View>
                      {risk.mitigation && (
                        <Text style={styles.riskMitigation}>Mitigation: {risk.mitigation}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {teamManagement.riskManagement.mitigationStrategies && teamManagement.riskManagement.mitigationStrategies.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Mitigation Strategies:</Text>
                  {teamManagement.riskManagement.mitigationStrategies.map((strategy, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{strategy}</Text>
                    </View>
                  ))}
                </View>
              )}
              {teamManagement.riskManagement.contingencyPlans && teamManagement.riskManagement.contingencyPlans.length > 0 && (
                <View style={styles.commSection}>
                  <Text style={styles.commSectionTitle}>Contingency Plans:</Text>
                  {teamManagement.riskManagement.contingencyPlans.map((plan, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listText}>{plan}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No risk management defined</Text>
          ),
          'exclamation-triangle'
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  scrollView: {
    maxHeight: 600,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  roleCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  roleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  roleDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleList: {
    marginTop: 8,
  },
  roleListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  goalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  goalDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  commSection: {
    marginBottom: 16,
  },
  commSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
  },
  riskCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  severityHigh: {
    backgroundColor: '#EF4444',
  },
  severityMedium: {
    backgroundColor: '#F59E0B',
  },
  severityLow: {
    backgroundColor: '#10B981',
  },
  riskMitigation: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
