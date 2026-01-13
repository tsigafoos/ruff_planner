import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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

interface TeamManagementEditorProps {
  initialData?: TeamManagementData;
  onSave: (data: TeamManagementData) => Promise<void>;
  onCancel: () => void;
}

// Helper to convert array to text (one per line)
const arrayToText = (arr: string[] | undefined): string => {
  return Array.isArray(arr) ? arr.join('\n') : '';
};

// Helper to convert text to array (one per line)
const textToArray = (text: string): string[] => {
  return text.split('\n').filter(line => line.trim().length > 0).map(line => line.trim());
};

export default function TeamManagementEditor({ initialData, onSave, onCancel }: TeamManagementEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('roles');
  const [loading, setLoading] = useState(false);

  // Team Roles
  const [teamRolesText, setTeamRolesText] = useState('');
  
  // Goals
  const [goalsText, setGoalsText] = useState('');
  
  // Communication Plan
  const [commToolsText, setCommToolsText] = useState('');
  const [commProtocols, setCommProtocols] = useState('');
  const [commEscalation, setCommEscalation] = useState('');
  
  // Resource Allocation
  const [capacityPlanning, setCapacityPlanning] = useState('');
  const [schedules, setSchedules] = useState('');
  const [budget, setBudget] = useState('');
  
  // Performance Monitoring
  const [perfMetricsText, setPerfMetricsText] = useState('');
  const [reviewFrequency, setReviewFrequency] = useState('');
  const [perfToolsText, setPerfToolsText] = useState('');
  
  // Motivation & Development
  const [incentivesText, setIncentivesText] = useState('');
  const [trainingText, setTrainingText] = useState('');
  const [recognitionText, setRecognitionText] = useState('');
  
  // Conflict Resolution
  const [conflictPolicies, setConflictPolicies] = useState('');
  const [mediationProcess, setMediationProcess] = useState('');
  const [conflictDocs, setConflictDocs] = useState('');
  
  // Risk Management
  const [riskRegisterText, setRiskRegisterText] = useState('');
  const [mitigationStrategiesText, setMitigationStrategiesText] = useState('');
  const [contingencyPlansText, setContingencyPlansText] = useState('');

  useEffect(() => {
    if (initialData) {
      // Initialize from initialData
      // For simplicity, we'll use text-based editing
      // In a full implementation, you'd have structured forms for each section
      setCommProtocols(initialData.communicationPlan?.protocols || '');
      setCommEscalation(initialData.communicationPlan?.escalationPaths || '');
      setCommToolsText(arrayToText(initialData.communicationPlan?.tools));
      setCapacityPlanning(initialData.resourceAllocation?.capacityPlanning || '');
      setSchedules(initialData.resourceAllocation?.schedules || '');
      setBudget(initialData.resourceAllocation?.budget || '');
      setPerfMetricsText(arrayToText(initialData.performanceMonitoring?.metrics));
      setReviewFrequency(initialData.performanceMonitoring?.reviewFrequency || '');
      setPerfToolsText(arrayToText(initialData.performanceMonitoring?.tools));
      setIncentivesText(arrayToText(initialData.motivationDevelopment?.incentives));
      setTrainingText(arrayToText(initialData.motivationDevelopment?.trainingPlans));
      setRecognitionText(arrayToText(initialData.motivationDevelopment?.recognitionPrograms));
      setConflictPolicies(initialData.conflictResolution?.policies || '');
      setMediationProcess(initialData.conflictResolution?.mediationProcess || '');
      setConflictDocs(initialData.conflictResolution?.documentation || '');
      setMitigationStrategiesText(arrayToText(initialData.riskManagement?.mitigationStrategies));
      setContingencyPlansText(arrayToText(initialData.riskManagement?.contingencyPlans));
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const data: TeamManagementData = {
        teamRoles: initialData?.teamRoles || [],
        goals: initialData?.goals || [],
        communicationPlan: {
          tools: textToArray(commToolsText),
          protocols: commProtocols.trim() || undefined,
          escalationPaths: commEscalation.trim() || undefined,
        },
        resourceAllocation: {
          capacityPlanning: capacityPlanning.trim() || undefined,
          schedules: schedules.trim() || undefined,
          budget: budget.trim() || undefined,
        },
        performanceMonitoring: {
          metrics: textToArray(perfMetricsText),
          reviewFrequency: reviewFrequency.trim() || undefined,
          tools: textToArray(perfToolsText),
        },
        motivationDevelopment: {
          incentives: textToArray(incentivesText),
          trainingPlans: textToArray(trainingText),
          recognitionPrograms: textToArray(recognitionText),
        },
        conflictResolution: {
          policies: conflictPolicies.trim() || undefined,
          mediationProcess: mediationProcess.trim() || undefined,
          documentation: conflictDocs.trim() || undefined,
        },
        riskManagement: {
          riskRegister: initialData?.riskManagement?.riskRegister || [],
          mitigationStrategies: textToArray(mitigationStrategiesText),
          contingencyPlans: textToArray(contingencyPlansText),
        },
      };
      
      await onSave(data);
    } catch (error) {
      console.error('Error saving team management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'communication', label: 'Communication', icon: 'comments' },
    { id: 'resources', label: 'Resources', icon: 'database' },
    { id: 'performance', label: 'Performance', icon: 'bar-chart' },
    { id: 'motivation', label: 'Motivation', icon: 'trophy' },
    { id: 'conflict', label: 'Conflict', icon: 'handshake-o' },
    { id: 'risks', label: 'Risks', icon: 'exclamation-triangle' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'communication':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Communication Tools (one per line)"
              value={commToolsText}
              onChangeText={setCommToolsText}
              placeholder="Slack&#10;Email&#10;Zoom"
              multiline
              numberOfLines={5}
            />
            <Input
              label="Protocols"
              value={commProtocols}
              onChangeText={setCommProtocols}
              placeholder="Daily standups at 9 AM, Weekly sync on Fridays..."
              multiline
              numberOfLines={4}
            />
            <Input
              label="Escalation Paths"
              value={commEscalation}
              onChangeText={setCommEscalation}
              placeholder="Issues → Team Lead → Project Manager → Director"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'resources':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Capacity Planning"
              value={capacityPlanning}
              onChangeText={setCapacityPlanning}
              placeholder="Team capacity, allocation, workload..."
              multiline
              numberOfLines={5}
            />
            <Input
              label="Schedules"
              value={schedules}
              onChangeText={setSchedules}
              placeholder="Work schedules, availability, time zones..."
              multiline
              numberOfLines={4}
            />
            <Input
              label="Budget"
              value={budget}
              onChangeText={setBudget}
              placeholder="Budget for tools, training, resources..."
              multiline
              numberOfLines={3}
            />
          </View>
        );
      case 'performance':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Performance Metrics (one per line)"
              value={perfMetricsText}
              onChangeText={setPerfMetricsText}
              placeholder="Velocity&#10;Sprint completion rate&#10;Code quality metrics"
              multiline
              numberOfLines={5}
            />
            <Input
              label="Review Frequency"
              value={reviewFrequency}
              onChangeText={setReviewFrequency}
              placeholder="Weekly, Bi-weekly, Monthly..."
            />
            <Input
              label="Performance Tools (one per line)"
              value={perfToolsText}
              onChangeText={setPerfToolsText}
              placeholder="Jira&#10;GitHub Analytics&#10;Custom Dashboard"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'motivation':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Incentives (one per line)"
              value={incentivesText}
              onChangeText={setIncentivesText}
              placeholder="Performance bonuses&#10;Recognition awards&#10;Career development opportunities"
              multiline
              numberOfLines={5}
            />
            <Input
              label="Training Plans (one per line)"
              value={trainingText}
              onChangeText={setTrainingText}
              placeholder="Technical training&#10;Soft skills workshops&#10;Certification programs"
              multiline
              numberOfLines={5}
            />
            <Input
              label="Recognition Programs (one per line)"
              value={recognitionText}
              onChangeText={setRecognitionText}
              placeholder="Employee of the month&#10;Team achievement awards&#10;Peer recognition"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'conflict':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Conflict Resolution Policies"
              value={conflictPolicies}
              onChangeText={setConflictPolicies}
              placeholder="Policies for handling conflicts, disputes..."
              multiline
              numberOfLines={5}
            />
            <Input
              label="Mediation Process"
              value={mediationProcess}
              onChangeText={setMediationProcess}
              placeholder="Steps for mediation, escalation process..."
              multiline
              numberOfLines={5}
            />
            <Input
              label="Documentation"
              value={conflictDocs}
              onChangeText={setConflictDocs}
              placeholder="How conflicts are documented and tracked..."
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'risks':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Mitigation Strategies (one per line)"
              value={mitigationStrategiesText}
              onChangeText={setMitigationStrategiesText}
              placeholder="Strategy 1&#10;Strategy 2&#10;Strategy 3"
              multiline
              numberOfLines={6}
            />
            <Input
              label="Contingency Plans (one per line)"
              value={contingencyPlansText}
              onChangeText={setContingencyPlansText}
              placeholder="Plan A&#10;Plan B&#10;Fallback options"
              multiline
              numberOfLines={6}
            />
            <Text style={styles.note}>
              Note: Risk register (individual risks with severity) can be managed in the main project risks section.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.disabledText}>
          Team management editor is only available on web
        </Text>
        <Button title="Close" onPress={onCancel} />
      </View>
    );
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Team Management</Text>
            <TouchableOpacity onPress={onCancel}>
              <FontAwesome name="times" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <FontAwesome
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {renderTabContent()}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            />
            <Button
              title="Save"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  container: {
    padding: 20,
  },
  disabledText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  note: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
