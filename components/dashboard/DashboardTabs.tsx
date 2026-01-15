import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardLayout } from '@/types';

interface DashboardTabsProps {
  onAddDashboard: () => void;
}

/**
 * DashboardTabs - Tab bar for multiple dashboards
 */
export default function DashboardTabs({ onAddDashboard }: DashboardTabsProps) {
  const theme = useTheme();
  const { dashboards, activeDashboardId, setActiveDashboard, editMode } = useDashboardStore();

  const renderTab = (dashboard: DashboardLayout, index: number) => {
    const isActive = dashboard.id === activeDashboardId;
    const isHome = dashboard.isDefault;
    
    return (
      <TouchableOpacity
        key={dashboard.id}
        style={[
          styles.tab,
          { 
            backgroundColor: isActive ? theme.primary + '15' : 'transparent',
            borderColor: isActive ? theme.primary : 'transparent',
          },
        ]}
        onPress={() => setActiveDashboard(dashboard.id)}
      >
        {/* Icon/Emoji */}
        <View style={styles.tabIcon}>
          {dashboard.emoji ? (
            <Text style={styles.tabEmoji}>{dashboard.emoji}</Text>
          ) : dashboard.scope === 'global' ? (
            <FontAwesome name="globe" size={14} color={isActive ? theme.primary : theme.textSecondary} />
          ) : (
            <FontAwesome name="folder" size={14} color={isActive ? theme.primary : theme.textSecondary} />
          )}
        </View>
        
        {/* Name */}
        <Text 
          style={[
            styles.tabName, 
            { color: isActive ? theme.primary : theme.text }
          ]}
          numberOfLines={1}
        >
          {dashboard.name}
        </Text>
        
        {/* Home indicator */}
        {isHome && (
          <View style={[styles.homeIndicator, { backgroundColor: theme.primary }]}>
            <FontAwesome name="home" size={8} color="#fff" />
          </View>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {dashboards
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((dashboard, index) => renderTab(dashboard, index))}
        
        {/* Add Dashboard Button */}
        <TouchableOpacity
          style={[styles.addTab, { borderColor: theme.border }]}
          onPress={onAddDashboard}
        >
          <FontAwesome name="plus" size={12} color={theme.primary} />
          <Text style={[styles.addTabText, { color: theme.primary }]}>Add Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Edit mode indicator */}
      {editMode && (
        <View style={[styles.editModeIndicator, { backgroundColor: theme.primary }]}>
          <FontAwesome name="pencil" size={10} color="#fff" />
          <Text style={styles.editModeText}>Editing</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
  },
  tabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
    maxWidth: 160,
  },
  tabIcon: {
    width: 20,
    alignItems: 'center',
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabName: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  homeIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -9,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  addTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  editModeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
