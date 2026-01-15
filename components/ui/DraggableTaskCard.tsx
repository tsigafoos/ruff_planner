import { View, StyleSheet, Platform, GestureResponderEvent } from 'react-native';
import TaskCard from '@/components/TaskCard';

export interface DraggableTaskCardProps {
  /** The task data */
  task: any;
  /** Whether this task is currently being dragged */
  isDragging?: boolean;
  /** Whether any drag is in progress */
  dragActive?: boolean;
  /** Called when task is pressed (for editing) */
  onPress?: () => void;
  /** Called when task completion is toggled */
  onComplete?: () => void;
  /** Called when task is deleted */
  onDelete?: () => void;
  /** Called when drag starts (web: MouseEvent, native: GestureResponderEvent) */
  onDragStart?: (e: any) => void;
  /** Called during drag move (native only) */
  onDragMove?: (e: GestureResponderEvent) => void;
  /** Called when drag ends */
  onDragEnd?: () => void;
}

/**
 * DraggableTaskCard - Wrapper that adds drag-and-drop capability to TaskCard
 * Handles both web (mouse events) and native (gesture responder) platforms
 */
export default function DraggableTaskCard({
  task,
  isDragging = false,
  dragActive = false,
  onPress,
  onComplete,
  onDelete,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableTaskCardProps) {
  const isWeb = Platform.OS === 'web';

  // Web drag handlers
  const webDragProps = isWeb && onDragStart ? {
    onMouseDown: (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging && !dragActive) {
        onDragStart(e);
      }
    },
  } : {};

  // Native gesture responder props
  const nativeDragProps = !isWeb && onDragStart ? {
    onStartShouldSetResponder: () => !isDragging && !dragActive,
    onMoveShouldSetResponder: () => !isDragging && !dragActive,
    onResponderGrant: (e: GestureResponderEvent) => {
      if (!isDragging && !dragActive) {
        onDragStart(e);
      }
    },
    onResponderMove: onDragMove,
    onResponderRelease: onDragEnd,
  } : {};

  return (
    <View 
      style={[
        styles.wrapper,
        isDragging && styles.wrapperDragging,
        isWeb && (isDragging ? styles.wrapperGrabbing : styles.wrapperGrab),
      ] as any}
      {...webDragProps}
      {...nativeDragProps}
    >
      <TaskCard
        task={task}
        onPress={() => {
          // Only trigger press if not dragging
          if (!dragActive) {
            onPress?.();
          }
        }}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  wrapperDragging: {
    opacity: 0.5,
  },
  wrapperGrab: Platform.select({
    web: {
      cursor: 'grab',
    } as any,
    default: {},
  }),
  wrapperGrabbing: Platform.select({
    web: {
      cursor: 'grabbing',
    } as any,
    default: {},
  }),
});
