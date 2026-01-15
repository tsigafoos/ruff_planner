import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardTemplate } from '@/types';
import DashboardGrid from './DashboardGrid';
import DashboardEditor from './DashboardEditor';

interface DynamicDashboardProps {
  projectId?: string;
  userId: string;
  defaultTemplate?: DashboardTemplate;
  tasks?: any[];
  projects?: any[];
  onTaskClick?: (task: any) => void;
  onProjectClick?: (project: any) => void;
  showToolbar?: boolean;
}

/**
 * DynamicDashboard - Complete dynamic dashboard with editing capabilities
 */
export default function DynamicDashboard({
  projectId,
  userId,
  defaultTemplate = 'waterfall',
  tasks = [],
  projects = [],
  onTaskClick,
  onProjectClick,
  showToolbar = true,
}: DynamicDashboardProps) {
  const theme = useTheme();
  const { 
    currentLayout, 
    editMode, 
    loading,
    setEditMode, 
    loadLayout, 
    createLayout,
    saveLayout,
    resetToTemplate,
  } = useDashboardStore();

  const [editorVisible, setEditorVisible] = useState(false);

  // Load or create layout on mount
  useEffect(() => {
    const initLayout = async () => {
      await loadLayout(projectId, userId);
      
      // If no layout was loaded, create a default one
      if (!useDashboardStore.getState().currentLayout) {
        createLayout(
          projectId ? 'Project Dashboard' : 'My Dashboard',
          defaultTemplate,
          projectId,
          userId
        );
      }
    };
    
    if (userId) {
      initLayout();
    }
  }, [projectId, userId, defaultTemplate]);

  const handleEditToggle = () => {
    if (editMode) {
      // Save and exit edit mode
      saveLayout();
      setEditMode(false);
    } else {
      setEditMode(true);
      setEditorVisible(true);
    }
  };

  const handleReset = () => {
    resetToTemplate();
    saveLayout();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dashboard Toolbar */}
      {showToolbar && (
        <View style={[styles.toolbar, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
          <View style={styles.toolbarLeft}>
            <FontAwesome name="th-large" size={16} color={theme.textSecondary} />
            <Text style={[styles.toolbarTitle, { color: theme.text }]}>
              {currentLayout?.name || 'Dashboard'}
            </Text>
            {currentLayout?.template && currentLayout.template !== 'custom' && (
              <View style={[styles.templateBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.templateBadgeText, { color: theme.primary }]}>
                  {currentLayout.template.charAt(0).toUpperCase() + currentLayout.template.slice(1)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.toolbarRight}>
            {editMode && (
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handleReset}
              >
                <FontAwesome name="refresh" size={14} color={theme.textSecondary} />
                <Text style={[styles.toolbarButtonText, { color: theme.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.toolbarButton, 
                { 
                  backgroundColor: editMode ? theme.success : theme.primary,
                  borderColor: editMode ? theme.success : theme.primary,
                }
              ]}
              onPress={handleEditToggle}
            >
              <FontAwesome name={editMode ? 'check' : 'pencil'} size={14} color="#fff" />
              <Text style={[styles.toolbarButtonText, { color: '#fff' }]}>
                {editMode ? 'Save' : 'Edit Dashboard'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dashboard Grid */}
      <View style={styles.gridContainer}>
        {currentLayout ? (
          <DashboardGrid
            layout={currentLayout}
            tasks={tasks}
            projects={projects}
            onTaskClick={onTaskClick}
            onProjectClick={onProjectClick}
          />
        ) : (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <FontAwesome name="dashboard" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Dashboard Configured
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Click "Edit Dashboard" to set up your layout
            </Text>
          </View>
        )}
      </View>

      {/* Dashboard Editor Modal */}
      <DashboardEditor
        visible={editorVisible}
        onClose={() => {
          setEditorVisible(false);
          if (!editMode) {
            setEditMode(false);
          }
        }}
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
    marginBottom: 16,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolbarTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  templateBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  templateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    padding: Platform.OS === 'web' ? 16 : 12,
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
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
