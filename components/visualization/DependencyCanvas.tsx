import { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Line, Defs, Marker, Path } from 'react-native-svg';
import { useThemeStore, themes } from '@/store/themeStore';
import { useTaskStore } from '@/store/taskStore';

interface Task {
  id: string;
  title: string;
  priority: number;
  status?: string;
  blocked_by?: string[];
  blockedBy?: string[];
  completed_at?: string;
  completedAt?: string;
}

interface DependencyCanvasProps {
  tasks: Task[];
  projectId: string;
  onTaskClick?: (task: Task) => void;
}

// Parse blocked_by field
function parseBlockedBy(task: Task): string[] {
  const blockedBy = task.blocked_by || task.blockedBy;
  if (!blockedBy) return [];
  if (Array.isArray(blockedBy)) return blockedBy;
  try {
    return JSON.parse(blockedBy as any);
  } catch {
    return [];
  }
}

// Node dimensions
const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;
const NODE_MARGIN = 20;
const CANVAS_PADDING = 40;

export default function DependencyCanvas({ tasks, projectId, onTaskClick }: DependencyCanvasProps) {
  const { themeMode } = useThemeStore();
  const theme = themes[themeMode];
  const { addBlocker, removeBlocker, hasCircularDependency } = useTaskStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [circularWarning, setCircularWarning] = useState<string | null>(null);

  // Separate tasks into connected (have dependencies or are depended upon) and unconnected
  const { connectedTasks, unconnectedTasks, connections } = useMemo(() => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const hasConnection = new Set<string>();
    const connectionList: { from: string; to: string }[] = [];

    // Find all connections
    tasks.forEach(task => {
      const blockers = parseBlockedBy(task);
      blockers.forEach(blockerId => {
        if (taskMap.has(blockerId)) {
          hasConnection.add(task.id);
          hasConnection.add(blockerId);
          connectionList.push({ from: blockerId, to: task.id });
        }
      });
    });

    const connected = tasks.filter(t => hasConnection.has(t.id));
    const unconnected = tasks.filter(t => !hasConnection.has(t.id));

    return {
      connectedTasks: connected,
      unconnectedTasks: unconnected,
      connections: connectionList,
    };
  }, [tasks]);

  // Calculate positions for connected tasks using a layered approach
  const nodePositions = useMemo(() => {
    const positions: { [id: string]: { x: number; y: number } } = {};
    
    if (connectedTasks.length === 0) return positions;

    // Build dependency graph
    const inDegree: { [id: string]: number } = {};
    const outEdges: { [id: string]: string[] } = {};
    
    connectedTasks.forEach(task => {
      inDegree[task.id] = 0;
      outEdges[task.id] = [];
    });

    connections.forEach(({ from, to }) => {
      if (inDegree[to] !== undefined) {
        inDegree[to]++;
      }
      if (outEdges[from]) {
        outEdges[from].push(to);
      }
    });

    // Topological sort to determine layers
    const layers: string[][] = [];
    const remaining = new Set(connectedTasks.map(t => t.id));
    
    while (remaining.size > 0) {
      // Find nodes with no remaining incoming edges
      const layer: string[] = [];
      remaining.forEach(id => {
        if (inDegree[id] === 0) {
          layer.push(id);
        }
      });

      if (layer.length === 0) {
        // Circular dependency - just add remaining nodes
        layer.push(...remaining);
        remaining.clear();
      } else {
        layer.forEach(id => {
          remaining.delete(id);
          outEdges[id]?.forEach(toId => {
            if (inDegree[toId] !== undefined) {
              inDegree[toId]--;
            }
          });
        });
      }

      layers.push(layer);
    }

    // Assign positions based on layers
    let currentX = CANVAS_PADDING;
    layers.forEach((layer, layerIndex) => {
      const layerHeight = layer.length * (NODE_HEIGHT + NODE_MARGIN);
      let currentY = CANVAS_PADDING + (300 - layerHeight) / 2; // Center vertically

      layer.forEach((taskId, nodeIndex) => {
        positions[taskId] = {
          x: currentX,
          y: currentY + nodeIndex * (NODE_HEIGHT + NODE_MARGIN),
        };
      });

      currentX += NODE_WIDTH + NODE_MARGIN * 3;
    });

    return positions;
  }, [connectedTasks, connections]);

  // Calculate canvas dimensions
  const canvasDimensions = useMemo(() => {
    if (Object.keys(nodePositions).length === 0) {
      return { width: 400, height: 300 };
    }

    let maxX = 0;
    let maxY = 0;
    Object.values(nodePositions).forEach(pos => {
      maxX = Math.max(maxX, pos.x + NODE_WIDTH);
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
    });

    return {
      width: Math.max(400, maxX + CANVAS_PADDING),
      height: Math.max(300, maxY + CANVAS_PADDING),
    };
  }, [nodePositions]);

  // Handle task click - open modal
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  }, []);

  // Handle adding a dependency
  const handleAddDependency = useCallback(async (blockerTaskId: string) => {
    if (!selectedTask) return;

    // Check for circular dependency
    if (hasCircularDependency(selectedTask.id, blockerTaskId)) {
      setCircularWarning(`Adding this dependency would create a circular reference.`);
      setTimeout(() => setCircularWarning(null), 4000);
      return;
    }

    const result = await addBlocker(selectedTask.id, blockerTaskId);
    if (result.circular) {
      setCircularWarning(`Circular dependency detected!`);
      setTimeout(() => setCircularWarning(null), 4000);
    }
  }, [selectedTask, addBlocker, hasCircularDependency]);

  // Handle removing a dependency
  const handleRemoveDependency = useCallback(async (blockerTaskId: string) => {
    if (!selectedTask) return;
    await removeBlocker(selectedTask.id, blockerTaskId);
  }, [selectedTask, removeBlocker]);

  // Get priority color
  const getPriorityColor = (priority: number) => {
    const colors: { [key: number]: string } = {
      1: theme.priority?.p1 || '#10B981',
      2: theme.priority?.p2 || '#3B82F6',
      3: theme.priority?.p3 || '#F59E0B',
      4: theme.priority?.p4 || '#EF4444',
    };
    return colors[priority] || theme.textTertiary;
  };

  // Render task node
  const renderTaskNode = (task: Task, position?: { x: number; y: number }, isUnconnected = false) => {
    const isCompleted = !!(task.completed_at || task.completedAt);
    const blockers = parseBlockedBy(task);
    
    const nodeStyle = isUnconnected ? styles.unconnectedNode : [
      styles.connectedNode,
      position && { left: position.x, top: position.y },
    ];

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskNode,
          nodeStyle,
          { 
            backgroundColor: theme.surface, 
            borderColor: getPriorityColor(task.priority),
          },
          isCompleted && { opacity: 0.6 },
        ]}
        onPress={() => handleTaskClick(task)}
        activeOpacity={0.8}
      >
        <View style={styles.nodeContent}>
          <Text 
            style={[styles.nodeTitle, { color: theme.text }]} 
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {blockers.length > 0 && (
            <View style={styles.nodeBlockerInfo}>
              <FontAwesome name="lock" size={10} color={theme.warning} />
              <Text style={[styles.nodeBlockerText, { color: theme.warning }]}>
                {blockers.length}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.nodePriorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
      </TouchableOpacity>
    );
  };

  // Get current blockers for selected task
  const selectedTaskBlockers = selectedTask ? parseBlockedBy(selectedTask) : [];
  const availableBlockers = tasks.filter(t => 
    t.id !== selectedTask?.id && 
    !selectedTaskBlockers.includes(t.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Task Dependencies</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Click a task to manage dependencies
        </Text>
      </View>

      <View style={styles.mainContent}>
        {/* Left Column - Unconnected Tasks */}
        <View style={[styles.leftColumn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
          <View style={[styles.columnHeader, { borderBottomColor: theme.border }]}>
            <FontAwesome name="inbox" size={14} color={theme.textSecondary} />
            <Text style={[styles.columnTitle, { color: theme.textSecondary }]}>
              Unlinked ({unconnectedTasks.length})
            </Text>
          </View>
          <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={true}>
            {unconnectedTasks.length > 0 ? (
              unconnectedTasks.map(task => renderTaskNode(task, undefined, true))
            ) : (
              <View style={styles.emptyColumn}>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                  All tasks are connected
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Center - Connected Tasks Canvas */}
        <View style={[styles.canvas, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ minWidth: canvasDimensions.width }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ minHeight: canvasDimensions.height }}
            >
              {connectedTasks.length > 0 ? (
                <View style={[styles.canvasContent, { width: canvasDimensions.width, height: canvasDimensions.height }]}>
                  {/* SVG Lines */}
                  <Svg 
                    style={StyleSheet.absoluteFill} 
                    width={canvasDimensions.width} 
                    height={canvasDimensions.height}
                  >
                    <Defs>
                      <Marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <Path
                          d="M0,0 L0,7 L10,3.5 z"
                          fill={theme.textTertiary}
                        />
                      </Marker>
                    </Defs>
                    {connections.map(({ from, to }, index) => {
                      const fromPos = nodePositions[from];
                      const toPos = nodePositions[to];
                      if (!fromPos || !toPos) return null;

                      return (
                        <Line
                          key={`${from}-${to}-${index}`}
                          x1={fromPos.x + NODE_WIDTH}
                          y1={fromPos.y + NODE_HEIGHT / 2}
                          x2={toPos.x}
                          y2={toPos.y + NODE_HEIGHT / 2}
                          stroke={theme.textTertiary}
                          strokeWidth={2}
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}
                  </Svg>

                  {/* Task Nodes */}
                  {connectedTasks.map(task => {
                    const pos = nodePositions[task.id];
                    return pos ? renderTaskNode(task, pos, false) : null;
                  })}
                </View>
              ) : (
                <View style={styles.emptyCanvas}>
                  <FontAwesome name="sitemap" size={48} color={theme.textTertiary} />
                  <Text style={[styles.emptyCanvasText, { color: theme.textSecondary }]}>
                    No dependencies yet
                  </Text>
                  <Text style={[styles.emptyCanvasSubtext, { color: theme.textTertiary }]}>
                    Click a task on the left to add dependencies
                  </Text>
                </View>
              )}
            </ScrollView>
          </ScrollView>
        </View>
      </View>

      {/* Circular Dependency Warning */}
      {circularWarning && (
        <View style={[styles.warningBanner, { backgroundColor: theme.warning }]}>
          <FontAwesome name="exclamation-triangle" size={14} color="#000" />
          <Text style={styles.warningText}>{circularWarning}</Text>
        </View>
      )}

      {/* Connection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedTask?.title}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Dependencies */}
            <View style={styles.modalSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Depends On ({selectedTaskBlockers.length})
              </Text>
              {selectedTaskBlockers.length > 0 ? (
                <View style={styles.blockersList}>
                  {selectedTaskBlockers.map(blockerId => {
                    const blockerTask = tasks.find(t => t.id === blockerId);
                    if (!blockerTask) return null;
                    return (
                      <View 
                        key={blockerId} 
                        style={[styles.blockerItem, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                      >
                        <Text style={[styles.blockerItemText, { color: theme.text }]} numberOfLines={1}>
                          {blockerTask.title}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => handleRemoveDependency(blockerId)}
                          style={styles.removeBlockerBtn}
                        >
                          <FontAwesome name="times-circle" size={16} color={theme.error} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.noDepsText, { color: theme.textTertiary }]}>
                  No dependencies
                </Text>
              )}
            </View>

            {/* Add Dependency */}
            <View style={styles.modalSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Add Dependency
              </Text>
              <ScrollView style={styles.availableList} showsVerticalScrollIndicator={true}>
                {availableBlockers.length > 0 ? (
                  availableBlockers.map(task => (
                    <TouchableOpacity
                      key={task.id}
                      style={[styles.availableItem, { borderColor: theme.border }]}
                      onPress={() => handleAddDependency(task.id)}
                    >
                      <View style={[styles.availableDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                      <Text style={[styles.availableItemText, { color: theme.text }]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <FontAwesome name="plus-circle" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.noDepsText, { color: theme.textTertiary }]}>
                    No available tasks
                  </Text>
                )}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: 220,
    borderRightWidth: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  columnContent: {
    flex: 1,
    padding: 12,
  },
  emptyColumn: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  canvas: {
    flex: 1,
    borderWidth: 0,
  },
  canvasContent: {
    position: 'relative',
  },
  emptyCanvas: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyCanvasText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyCanvasSubtext: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  taskNode: {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unconnectedNode: {
    marginBottom: 10,
  },
  connectedNode: {
    position: 'absolute',
  },
  nodeContent: {
    flex: 1,
    marginRight: 8,
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  nodeBlockerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  nodeBlockerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  nodePriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  warningBanner: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? 400 : '90%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  modalSection: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  blockersList: {
    gap: 8,
  },
  blockerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  blockerItemText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  removeBlockerBtn: {
    padding: 4,
  },
  noDepsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  availableList: {
    maxHeight: 200,
  },
  availableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableItemText: {
    fontSize: 14,
    flex: 1,
  },
  closeModalBtn: {
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
