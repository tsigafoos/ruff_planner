import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import MobileProjectRow from './MobileProjectRow';

interface MobileProjectListProps {
  projects: any[];
  tasks?: any[];
  loading?: boolean;
  onRefresh?: () => void;
  onProjectPress?: (project: any) => void;
  onAddProject?: () => void;
}

type FilterType = 'all' | 'active' | 'completed';

/**
 * MobileProjectList - Full mobile project list with FAB
 */
export default function MobileProjectList({
  projects,
  tasks = [],
  loading = false,
  onRefresh,
  onProjectPress,
  onAddProject,
}: MobileProjectListProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');

  // Calculate task counts per project
  const getProjectCounts = (projectId: string) => {
    const projectTasks = tasks.filter(t => (t.project_id || t.projectId) === projectId);
    const completed = projectTasks.filter(t => t.completed_at || t.completedAt).length;
    return { total: projectTasks.length, completed };
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const counts = getProjectCounts(project.id);
    const progress = counts.total > 0 ? counts.completed / counts.total : 0;

    switch (filter) {
      case 'active':
        return progress < 1;
      case 'completed':
        return progress === 1 && counts.total > 0;
      default:
        return true;
    }
  });

  // Sort by most recently updated
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aDate = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt);
    const bDate = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt);
    return bDate.getTime() - aDate.getTime();
  });

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const renderProject = ({ item }: { item: any }) => {
    const counts = getProjectCounts(item.id);
    return (
      <MobileProjectRow
        project={item}
        taskCount={counts.total}
        completedCount={counts.completed}
        onPress={() => onProjectPress?.(item)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="folder-open-o" size={48} color={theme.textTertiary} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No projects yet
      </Text>
      {onAddProject && (
        <TouchableOpacity
          style={[styles.emptyButton, { borderColor: theme.primary }]}
          onPress={onAddProject}
        >
          <Text style={[styles.emptyButtonText, { color: theme.primary }]}>
            Create your first project
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Projects</Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {sortedProjects.length} {sortedProjects.length === 1 ? 'project' : 'projects'}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filter === f.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f.key ? theme.primary : theme.textSecondary },
              filter === f.key && { fontWeight: '600' },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Project List */}
      <FlatList
        data={sortedProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={sortedProjects.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {onAddProject && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={onAddProject}
          activeOpacity={0.8}
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
