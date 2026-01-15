import { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { PageHeader } from '@/components/layout';

export interface PageAction {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export interface PageWrapperProps {
  /** Section name (shown in breadcrumb on web) */
  section?: string;
  /** Page title */
  title: string;
  /** Subtitle or count text */
  subtitle?: string;
  /** Whether the page is loading */
  loading?: boolean;
  /** Action buttons to show in header */
  actions?: PageAction[];
  /** The page content */
  children: ReactNode;
  /** Show back button (for detail pages) */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Use ScrollView wrapper */
  scrollable?: boolean;
  /** Empty state - shown when no children or explicitly set */
  emptyState?: {
    icon?: string;
    title: string;
    subtitle?: string;
  };
  /** Whether to show empty state */
  isEmpty?: boolean;
}

/**
 * PageWrapper - Standardized page structure component
 * Provides consistent header, loading, and empty states across all pages
 */
export default function PageWrapper({
  section,
  title,
  subtitle,
  loading = false,
  actions = [],
  children,
  showBack = false,
  onBack,
  scrollable = false,
  emptyState,
  isEmpty = false,
}: PageWrapperProps) {
  const theme = useTheme();

  // Render header for mobile
  const renderMobileHeader = () => (
    <View style={[styles.mobileHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.mobileHeaderLeft}>
        {showBack && onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <FontAwesome name="angle-left" size={18} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.mobileHeaderText}>
          <Text style={[styles.mobileTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.mobileSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {actions.length > 0 && (
        <View style={styles.mobileActions}>
          {actions.slice(0, 2).map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.mobileActionButton,
                action.variant === 'primary' 
                  ? { backgroundColor: theme.primary }
                  : { backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border }
              ]}
              onPress={action.onPress}
            >
              {action.icon && (
                <FontAwesome 
                  name={action.icon as any} 
                  size={14} 
                  color={action.variant === 'primary' ? '#ffffff' : theme.text} 
                />
              )}
              <Text 
                style={[
                  styles.mobileActionText, 
                  { color: action.variant === 'primary' ? '#ffffff' : theme.text }
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.centerContent}>
      {emptyState?.icon && (
        <FontAwesome name={emptyState.icon as any} size={48} color={theme.textTertiary} style={styles.emptyIcon} />
      )}
      <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>{emptyState?.title || 'No items'}</Text>
      {emptyState?.subtitle && (
        <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>{emptyState.subtitle}</Text>
      )}
    </View>
  );

  // Render main content
  const renderContent = () => {
    if (loading) return renderLoading();
    if (isEmpty && emptyState) return renderEmpty();
    return children;
  };

  const contentElement = scrollable ? (
    <ScrollView 
      style={styles.scrollContent} 
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={true}
    >
      {renderContent()}
    </ScrollView>
  ) : (
    <View style={styles.content}>
      {renderContent()}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header - PageHeader on web, custom on mobile */}
      {Platform.OS === 'web' ? (
        <PageHeader
          section={section || title}
          pageName={title}
          subtitle={subtitle}
          actions={actions.map(a => ({
            label: a.label,
            icon: a.icon,
            onPress: a.onPress,
            variant: a.variant,
          }))}
        />
      ) : (
        renderMobileHeader()
      )}

      {/* Content */}
      {contentElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Mobile header
  mobileHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mobileHeaderText: {
    flex: 1,
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  mobileSubtitle: {
    fontSize: 14,
  },
  mobileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mobileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  mobileActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  // Center content (loading/empty)
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
