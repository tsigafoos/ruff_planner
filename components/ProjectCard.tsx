import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Card from './ui/Card';
import { useTheme } from '@/components/useTheme';

interface ProjectCardProps {
  project: any;
  taskCount?: number;
  onPress?: () => void;
}

export default function ProjectCard({ project, taskCount, onPress }: ProjectCardProps) {
  const theme = useTheme();
  
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: project.color + '20' },
          ]}
        >
          <FontAwesome
            name={(project.icon || 'folder') as any}
            size={24}
            color={project.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{project.name}</Text>
          {taskCount !== undefined && (
            <Text style={[styles.count, { color: theme.textSecondary }]}>{taskCount} tasks</Text>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  count: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
  },
});
