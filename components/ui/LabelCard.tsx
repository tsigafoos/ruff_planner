import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface LabelCardProps {
  /** Label ID */
  id: string;
  /** Label name */
  name: string;
  /** Label color */
  color?: string;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Called when edit is pressed */
  onEdit?: () => void;
  /** Called when delete is pressed */
  onDelete?: () => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Task count with this label */
  taskCount?: number;
}

/**
 * LabelCard - Reusable component for displaying a label
 */
export default function LabelCard({
  id,
  name,
  color,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  taskCount,
}: LabelCardProps) {
  const theme = useTheme();
  const labelColor = color || theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.colorDot, { backgroundColor: labelColor }]} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        {taskCount !== undefined && (
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <FontAwesome name="pencil" size={14} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <FontAwesome name="trash-o" size={14} color={theme.error || '#EF4444'} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
