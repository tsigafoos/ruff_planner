import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface Resource {
  id: string;
  name: string;
  url?: string;
  type?: 'link' | 'file' | 'folder' | 'doc' | 'image';
  description?: string;
}

export interface ResourcesWidgetProps {
  resources?: Resource[];
  onResourceClick?: (resource: Resource) => void;
  onAddResource?: () => void;
  showHeader?: boolean;
  maxItems?: number;
}

/**
 * ResourcesWidget - Directory viewer of project resources
 */
export default function ResourcesWidget({
  resources = [],
  onResourceClick,
  onAddResource,
  showHeader = true,
  maxItems = 8,
}: ResourcesWidgetProps) {
  const theme = useTheme();

  const getResourceIcon = (type?: string): string => {
    switch (type) {
      case 'file': return 'file-o';
      case 'folder': return 'folder-o';
      case 'doc': return 'file-text-o';
      case 'image': return 'file-image-o';
      case 'link':
      default: return 'link';
    }
  };

  const getResourceColor = (type?: string): string => {
    switch (type) {
      case 'file': return '#3B82F6';
      case 'folder': return '#F59E0B';
      case 'doc': return '#10B981';
      case 'image': return '#EC4899';
      case 'link':
      default: return '#6366F1';
    }
  };

  const handleResourcePress = (resource: Resource) => {
    if (onResourceClick) {
      onResourceClick(resource);
    } else if (resource.url) {
      Linking.openURL(resource.url);
    }
  };

  const displayedResources = resources.slice(0, maxItems);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <FontAwesome name="folder-open" size={14} color={theme.textSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Resources</Text>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>{resources.length}</Text>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.resourcesList}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.resourcesListContent}
      >
        {displayedResources.map((resource) => {
          const icon = getResourceIcon(resource.type);
          const color = getResourceColor(resource.type);
          
          return (
            <TouchableOpacity
              key={resource.id}
              style={[styles.resourceItem, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={[styles.resourceIcon, { backgroundColor: color + '15' }]}>
                <FontAwesome name={icon as any} size={12} color={color} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={[styles.resourceName, { color: theme.text }]} numberOfLines={1}>
                  {resource.name}
                </Text>
                {resource.description && (
                  <Text style={[styles.resourceDesc, { color: theme.textTertiary }]} numberOfLines={1}>
                    {resource.description}
                  </Text>
                )}
              </View>
              <FontAwesome 
                name="external-link" 
                size={10} 
                color={theme.textTertiary} 
              />
            </TouchableOpacity>
          );
        })}

        {resources.length > maxItems && (
          <Text style={[styles.moreText, { color: theme.textSecondary }]}>
            +{resources.length - maxItems} more
          </Text>
        )}

        {resources.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="folder-open-o" size={24} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              No resources
            </Text>
          </View>
        )}
      </ScrollView>

      {onAddResource && (
        <TouchableOpacity
          style={[styles.addButton, { borderColor: theme.border, borderTopColor: theme.border }]}
          onPress={onAddResource}
        >
          <FontAwesome name="plus" size={10} color={theme.primary} />
          <Text style={[styles.addButtonText, { color: theme.primary }]}>Add Resource</Text>
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
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resourcesList: {
    flex: 1,
  },
  resourcesListContent: {
    padding: 10,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  resourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceInfo: {
    flex: 1,
    minWidth: 0,
  },
  resourceName: {
    fontSize: 12,
    fontWeight: '500',
  },
  resourceDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  moreText: {
    fontSize: 11,
    textAlign: 'center',
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 11,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderTopWidth: 1,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
