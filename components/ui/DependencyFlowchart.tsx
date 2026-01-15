import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useMemo } from 'react';

export interface DependencyTask {
  id: string;
  title: string;
  priority?: number;
  blockedBy?: string[];
  isCompleted?: boolean;
}

export interface DependencyFlowchartProps {
  /** Tasks to display */
  tasks: DependencyTask[];
  /** Called when a task is clicked */
  onTaskClick?: (task: DependencyTask) => void;
  /** Called when "View Full" is pressed */
  onViewFull?: () => void;
  /** Maximum tasks to show per layer */
  maxPerLayer?: number;
  /** Show the header */
  showHeader?: boolean;
}

// Priority colors
const PRIORITY_COLORS: { [key: number]: string } = {
  1: '#10B981',
  2: '#3B82F6',
  3: '#F59E0B',
  4: '#EF4444',
};

const NODE_WIDTH = 140;
const NODE_HEIGHT = 40;
const NODE_GAP = 16;

/**
 * DependencyFlowchart - Simplified dependency visualization widget
 * Shows task dependencies as a flowchart-style diagram
 */
export default function DependencyFlowchart({
  tasks,
  onTaskClick,
  onViewFull,
  maxPerLayer = 4,
  showHeader = true,
}: DependencyFlowchartProps) {
  const theme = useTheme();

  // Parse blocked_by for each task
  const parseBlockedBy = (task: DependencyTask): string[] => {
    const blockedBy = task.blockedBy;
    if (!blockedBy) return [];
    if (Array.isArray(blockedBy)) return blockedBy;
    try {
      return JSON.parse(blockedBy as any);
    } catch {
      return [];
    }
  };

  // Build dependency graph and layers
  const { layers, connections, hasNoConnections } = useMemo(() => {
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const hasConnection = new Set<string>();
    const connectionList: { from: string; to: string }[] = [];

    // Find all connections
    tasks.forEach((task) => {
      const blockers = parseBlockedBy(task);
      blockers.forEach((blockerId) => {
        if (taskMap.has(blockerId)) {
          hasConnection.add(task.id);
          hasConnection.add(blockerId);
          connectionList.push({ from: blockerId, to: task.id });
        }
      });
    });

    const connectedTasks = tasks.filter((t) => hasConnection.has(t.id));

    if (connectedTasks.length === 0) {
      return { layers: [], connections: [], hasNoConnections: true };
    }

    // Build in-degree for topological sort
    const inDegree: { [id: string]: number } = {};
    const outEdges: { [id: string]: string[] } = {};

    connectedTasks.forEach((task) => {
      inDegree[task.id] = 0;
      outEdges[task.id] = [];
    });

    connectionList.forEach(({ from, to }) => {
      if (inDegree[to] !== undefined) {
        inDegree[to]++;
      }
      if (outEdges[from]) {
        outEdges[from].push(to);
      }
    });

    // Topological sort
    const resultLayers: DependencyTask[][] = [];
    const remaining = new Set(connectedTasks.map((t) => t.id));

    while (remaining.size > 0) {
      const layer: string[] = [];
      remaining.forEach((id) => {
        if (inDegree[id] === 0) {
          layer.push(id);
        }
      });

      if (layer.length === 0) {
        layer.push(...remaining);
        remaining.clear();
      } else {
        layer.forEach((id) => {
          remaining.delete(id);
          outEdges[id]?.forEach((toId) => {
            if (inDegree[toId] !== undefined) {
              inDegree[toId]--;
            }
          });
        });
      }

      const layerTasks = layer
        .map((id) => taskMap.get(id)!)
        .filter(Boolean)
        .slice(0, maxPerLayer);
      resultLayers.push(layerTasks);
    }

    return {
      layers: resultLayers.slice(0, 4), // Limit to 4 layers for widget
      connections: connectionList,
      hasNoConnections: false,
    };
  }, [tasks, maxPerLayer]);

  // Get priority color
  const getPriorityColor = (priority?: number) => {
    return PRIORITY_COLORS[priority || 4] || theme.textTertiary;
  };

  if (hasNoConnections) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {showHeader && (
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <FontAwesome name="sitemap" size={16} color={theme.primary} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>Dependencies</Text>
            </View>
          </View>
        )}
        <View style={styles.emptyContainer}>
          <FontAwesome name="link" size={32} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No dependencies yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Add "blocked by" relationships to tasks
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header */}
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <FontAwesome name="sitemap" size={16} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Dependencies</Text>
          </View>
          {onViewFull && (
            <TouchableOpacity onPress={onViewFull}>
              <Text style={[styles.viewFullText, { color: theme.primary }]}>View Full</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Flowchart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={styles.flowchartContent}
      >
        <View style={styles.flowchart}>
          {layers.map((layer, layerIndex) => (
            <View key={layerIndex} style={styles.layer}>
              {layer.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.node,
                    {
                      backgroundColor: theme.surface,
                      borderColor: getPriorityColor(task.priority),
                    },
                    task.isCompleted && styles.nodeCompleted,
                  ]}
                  onPress={() => onTaskClick?.(task)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.nodeTitle,
                      { color: theme.text },
                      task.isCompleted && styles.nodeTitleCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View
                    style={[
                      styles.nodePriorityDot,
                      { backgroundColor: getPriorityColor(task.priority) },
                    ]}
                  />
                </TouchableOpacity>
              ))}
              
              {/* Arrow between layers */}
              {layerIndex < layers.length - 1 && (
                <View style={styles.arrowContainer}>
                  <FontAwesome name="long-arrow-right" size={20} color={theme.textTertiary} />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Stats */}
      <View style={[styles.stats, { borderTopColor: theme.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {layers.flat().length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Connected</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{connections.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Links</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{layers.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Layers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewFullText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  flowchartContent: {
    padding: 16,
  },
  flowchart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  node: {
    width: NODE_WIDTH,
    minHeight: NODE_HEIGHT,
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeCompleted: {
    opacity: 0.6,
  },
  nodeTitle: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    marginRight: 6,
  },
  nodeTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  nodePriorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  arrowContainer: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
