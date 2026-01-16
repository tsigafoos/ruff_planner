import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

interface MobileProjectRowProps {
  project: any;
  taskCount?: number;
  completedCount?: number;
  onPress?: () => void;
}

/**
 * MobileProjectRow - Compact project row for mobile
 */
export default function MobileProjectRow({ 
  project, 
  taskCount = 0,
  completedCount = 0,
  onPress,
}: MobileProjectRowProps) {
  const theme = useTheme();

  const projectType = project.project_type || project.projectType || 'waterfall';
  const icon = project.icon || 'folder';
  const color = project.color || theme.primary;

  // Progress calculation
  const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
  const remainingTasks = taskCount - completedCount;

  // Project type label
  const typeLabels: Record<string, string> = {
    waterfall: 'Waterfall',
    agile: 'Agile',
    maintenance: 'Maintenance',
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Project Icon */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <FontAwesome name={icon as any} size={18} color={color} />
      </View>

      {/* Project Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.typeLabel, { color: theme.textTertiary }]}>
            {typeLabels[projectType]}
          </Text>
          {taskCount > 0 && (
            <>
              <View style={[styles.dot, { backgroundColor: theme.textTertiary }]} />
              <Text style={[styles.taskCount, { color: theme.textSecondary }]}>
                {remainingTasks > 0 ? `${remainingTasks} remaining` : 'All done!'}
              </Text>
            </>
          )}
        </View>

        {/* Progress bar */}
        {taskCount > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: progress === 100 ? theme.success : color,
                  width: `${progress}%`,
                }
              ]} 
            />
          </View>
        )}
      </View>

      {/* Chevron */}
      <FontAwesome name="chevron-right" size={12} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  taskCount: {
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
