import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardTemplate } from '@/types';
import DashboardGrid from './DashboardGrid';
import DashboardTabs from './DashboardTabs';
import DashboardCreationModal from './DashboardCreationModal';

interface DynamicDashboardProps {
  projectId?: string;
  userId: string;
  defaultTemplate?: DashboardTemplate;
  tasks?: any[];
  projects?: any[];
  resources?: any[];
  onTaskClick?: (task: any) => void;
  onProjectClick?: (project: any) => void;
  showToolbar?: boolean;
  showTabs?: boolean;
}

/**
 * DynamicDashboard - Complete dynamic dashboard with tabs and editing capabilities
 */
export default function DynamicDashboard({
  projectId,
  userId,
  defaultTemplate = 'waterfall',
  tasks = [],
  projects = [],
  resources = [],
  onTaskClick,
  onProjectClick,
  showToolbar = true,
  showTabs = true,
}: DynamicDashboardProps) {
  const theme = useTheme();
  const { 
    dashboards,
    currentDashboard, 
    editMode, 
    loading,
    setEditMode, 
    loadDashboards, 
    createDashboard,
    saveDashboard,
    addRow,
  } = useDashboardStore();

  const [creationModalVisible, setCreationModalVisible] = useState(false);

  // Load dashboards on mount
  useEffect(() => {
    if (userId) {
      loadDashboards(userId);
    }
  }, [userId]);

  const handleSave = async () => {
    await saveDashboard();
    setEditMode(false);
  };

  const handleStartEditing = () => {
    setEditMode(true);
  };

  const handleDashboardCreated = (dashboardId: string) => {
    // Dashboard is already set as active by createDashboard
    // Edit mode is already enabled by the modal
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading dashboards...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dashboard Tabs */}
      {showTabs && (
        <DashboardTabs onAddDashboard={() => setCreationModalVisible(true)} />
      )}

      {/* Dashboard Toolbar */}
      {showToolbar && currentDashboard && (
        <View style={[styles.toolbar, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
          <View style={styles.toolbarLeft}>
            {/* Dashboard Info */}
            {currentDashboard.emoji && (
              <Text style={styles.dashboardEmoji}>{currentDashboard.emoji}</Text>
            )}
            <View>
              <Text style={[styles.toolbarTitle, { color: theme.text }]}>
                {currentDashboard.name}
              </Text>
              <View style={styles.toolbarMeta}>
                {currentDashboard.scope === 'global' ? (
                  <View style={styles.scopeBadge}>
                    <FontAwesome name="globe" size={10} color={theme.textTertiary} />
                    <Text style={[styles.scopeText, { color: theme.textTertiary }]}>Global</Text>
                  </View>
                ) : (
                  <View style={styles.scopeBadge}>
                    <FontAwesome name="folder" size={10} color={theme.textTertiary} />
                    <Text style={[styles.scopeText, { color: theme.textTertiary }]}>Project</Text>
                  </View>
                )}
                <Text style={[styles.laneCount, { color: theme.textTertiary }]}>
                  {currentDashboard.rows.length} lanes
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.toolbarRight}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={[styles.toolbarButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => addRow()}
                >
                  <FontAwesome name="plus" size={12} color={theme.text} />
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>Add Lane</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.toolbarButton, { backgroundColor: theme.success, borderColor: theme.success }]}
                  onPress={handleSave}
                >
                  <FontAwesome name="check" size={12} color="#fff" />
                  <Text style={[styles.toolbarButtonText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={handleStartEditing}
              >
                <FontAwesome name="pencil" size={12} color="#fff" />
                <Text style={[styles.toolbarButtonText, { color: '#fff' }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Dashboard Content */}
      <ScrollView 
        style={styles.gridContainer} 
        contentContainerStyle={styles.gridContentContainer}
        showsVerticalScrollIndicator
      >
        {currentDashboard ? (
          <DashboardGrid
            layout={currentDashboard}
            tasks={tasks}
            projects={projects}
            resources={resources}
            onTaskClick={onTaskClick}
            onProjectClick={onProjectClick}
          />
        ) : dashboards.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <FontAwesome name="dashboard" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Dashboards Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Create your first custom dashboard
            </Text>
            <TouchableOpacity
              style={[styles.createFirstButton, { backgroundColor: theme.primary }]}
              onPress={() => setCreationModalVisible(true)}
            >
              <FontAwesome name="plus" size={14} color="#fff" />
              <Text style={styles.createFirstButtonText}>Create Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <FontAwesome name="hand-pointer-o" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              Select a Dashboard
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Choose from the tabs above
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Dashboard Creation Modal */}
      <DashboardCreationModal
        visible={creationModalVisible}
        onClose={() => setCreationModalVisible(false)}
        onCreated={handleDashboardCreated}
        projects={projects}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  loadingText: {
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardEmoji: {
    fontSize: 24,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolbarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scopeText: {
    fontSize: 11,
  },
  laneCount: {
    fontSize: 11,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolbarButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  gridContainer: {
    flex: 1,
  },
  gridContentContainer: {
    padding: Platform.OS === 'web' ? 16 : 12,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    gap: 16,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
