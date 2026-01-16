import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from './ui/Icon';
import Card from './ui/Card';
import { useTheme } from '@/components/useTheme';

interface ProjectCardProps {
  project: any;
  taskCount?: number;
  completedCount?: number;
  onPress?: () => void;
}

export default function ProjectCard({ project, taskCount, completedCount, onPress }: ProjectCardProps) {
  const theme = useTheme();
  
  // Calculate progress
  const progress = taskCount && taskCount > 0 
    ? Math.round(((completedCount || 0) / taskCount) * 100) 
    : 0;
  
  // Project type badge (supports both old 'methodology' and new 'project_type')
  const projectType = project.project_type || project.projectType || project.methodology || 'waterfall';
  const isAgile = projectType === 'agile';
  const isMaintenance = projectType === 'maintenance';
  
  // Badge configuration based on project type
  const badgeConfig = isMaintenance 
    ? { icon: 'wrench' as const, label: 'Maintenance', color: '#F59E0B' }
    : isAgile 
      ? { icon: 'columns' as const, label: 'Agile', color: undefined }
      : { icon: 'tasks' as const, label: 'Waterfall', color: undefined };
  
  return (
    <Card style={styles.card}>
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.content}
        activeOpacity={0.7}
      >
        {/* Color accent line */}
        <View style={[styles.accentLine, { backgroundColor: project.color || theme.primary }]} />
        
        <View style={styles.mainContent}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: (project.color || theme.primary) + '15' },
              ]}
            >
              <Icon
                name={project.icon || 'folder'}
                size={20}
                color={project.color || theme.primary}
              />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {project.name}
              </Text>
              <View style={styles.badges}>
                <View style={[
                  styles.methodologyBadge, 
                  { 
                    backgroundColor: isMaintenance ? '#FEF3C7' : theme.surfaceSecondary 
                  }
                ]}>
                  <Icon 
                    name={badgeConfig.icon} 
                    size={10} 
                    color={badgeConfig.color || theme.textTertiary} 
                  />
                  <Text style={[
                    styles.methodologyText, 
                    { color: badgeConfig.color || theme.textTertiary }
                  ]}>
                    {badgeConfig.label}
                  </Text>
                </View>
              </View>
            </View>
            <Icon name="chevron-right" size={12} color={theme.textTertiary} />
          </View>
          
          {/* Progress bar (if tasks exist) */}
          {taskCount !== undefined && taskCount > 0 && (
            <View style={styles.progressSection}>
              <View style={[styles.progressBar, { backgroundColor: theme.surfaceTertiary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: progress === 100 ? theme.success : project.color || theme.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textTertiary }]}>
                {completedCount || 0}/{taskCount} tasks ({progress}%)
              </Text>
            </View>
          )}
          
          {/* Empty state */}
          {(taskCount === undefined || taskCount === 0) && (
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              No tasks yet
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    minHeight: Platform.OS === 'web' ? 72 : 80,
  },
  accentLine: {
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  mainContent: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 4,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  name: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  methodologyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodologyText: {
    fontSize: 10,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 10,
    paddingLeft: 52,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 52,
    fontStyle: 'italic',
  },
});
