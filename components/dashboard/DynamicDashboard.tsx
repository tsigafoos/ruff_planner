import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from 'react-native';
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
  /** When false, parent owns DashboardCreationModal (e.g. Insights screen). */
  showCreationModal?: boolean;
  /** Smaller loading UI for embedded Insights custom tab. */
  embedded?: boolean;
  /** When `showCreationModal` is false, empty-state CTA asks parent to open creation (sidebar / Insights). */
  onRequestCreateDashboard?: () => void;
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
  showCreationModal = true,
  embedded = false,
  onRequestCreateDashboard,
}: DynamicDashboardProps) {
  const theme = useTheme();
  const { 
    dashboards,
    currentDashboard, 
    editMode, 
    loading,
    setEditMode, 
    createDashboard,
    saveDashboard,
    addRow,
  } = useDashboardStore();

  const [creationModalVisible, setCreationModalVisible] = useState(false);

  const visibleDashboards = useMemo(
    () =>
      projectId
        ? dashboards.filter((d) => d.scope === 'project' && d.projectId === projectId)
        : dashboards,
    [dashboards, projectId],
  );

  const gridDashboard =
    currentDashboard &&
    (!projectId ||
      (currentDashboard.scope === 'project' && currentDashboard.projectId === projectId))
      ? currentDashboard
      : null;

  useEffect(() => {
    if (embedded) return;
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { loadDashboards: load, selectFirstProjectDashboard: selectFirst } =
        useDashboardStore.getState();
      await load(userId);
      if (!cancelled && projectId) {
        selectFirst(projectId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, projectId, embedded]);

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
    if (embedded) {
      return (
        <View style={[styles.embeddedLoading, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading dashboard…
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading dashboards...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'web' && projectId ? styles.containerWebProject : null,
        embedded && Platform.OS === 'web' ? styles.containerEmbeddedWeb : null,
      ]}
    >
      {/* Dashboard Tabs */}
      {showTabs && (
        <DashboardTabs
          onAddDashboard={() => setCreationModalVisible(true)}
          projectIdFilter={projectId ?? null}
        />
      )}

      {/* Dashboard Toolbar */}
      {showToolbar && (gridDashboard || (!projectId && currentDashboard)) && (
        <View style={[styles.toolbar, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
          <View style={styles.toolbarLeft}>
            {(gridDashboard || currentDashboard)!.emoji && (
              <Text style={styles.dashboardEmoji}>{(gridDashboard || currentDashboard)!.emoji}</Text>
            )}
            <View>
              <Text style={[styles.toolbarTitle, { color: theme.text }]}>
                {(gridDashboard || currentDashboard)!.name}
              </Text>
              <View style={styles.toolbarMeta}>
                {(gridDashboard || currentDashboard)!.scope === 'global' ? (
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
                  {(gridDashboard || currentDashboard)!.rows.length} lanes
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
        style={[
          styles.gridContainer,
          Platform.OS === 'web' && projectId ? styles.gridContainerWebProject : null,
          embedded && Platform.OS === 'web' ? styles.gridContainerEmbeddedWeb : null,
        ]}
        contentContainerStyle={styles.gridContentContainer}
        showsVerticalScrollIndicator
      >
        {gridDashboard ? (
          <DashboardGrid
            layout={gridDashboard}
            tasks={tasks}
            projects={projects}
            resources={resources}
            onTaskClick={onTaskClick}
            onProjectClick={onProjectClick}
          />
        ) : visibleDashboards.length === 0 ? (
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
              onPress={() =>
                showCreationModal
                  ? setCreationModalVisible(true)
                  : onRequestCreateDashboard?.()
              }
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

      {showCreationModal && (
        <DashboardCreationModal
          visible={creationModalVisible}
          onClose={() => setCreationModalVisible(false)}
          onCreated={handleDashboardCreated}
          projects={projects}
          userId={userId}
          defaultProjectId={projectId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /** Project page: height follows grid so shell scroll can move the whole dashboard */
  containerWebProject: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%' as any,
    alignSelf: 'stretch',
  },
  /** Insights custom tab on web: height follows grid so AppLayout main column scrolls */
  containerEmbeddedWeb: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%' as any,
    alignSelf: 'stretch',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  embeddedLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashboardEmoji: {
    fontSize: 22,
  },
  toolbarTitle: {
    fontSize: 15,
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
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  gridContainer: {
    flex: 1,
  },
  gridContainerWebProject: {
    flexGrow: 0,
    width: '100%' as any,
    alignSelf: 'stretch',
  },
  gridContainerEmbeddedWeb: {
    flexGrow: 0,
    width: '100%' as any,
    alignSelf: 'stretch',
  },
  gridContentContainer: {
    padding: Platform.OS === 'web' ? 12 : 10,
    paddingBottom: 28,
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
