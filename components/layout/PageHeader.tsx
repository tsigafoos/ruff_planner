import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useThemeStore, themes } from '@/store/themeStore';

export interface ActionButton {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface PageHeaderProps {
  section: string;      // e.g., "Projects", "Tasks", "Calendar"
  pageName: string;     // e.g., "Active Backlog", "Today", "Month View"
  actions?: ActionButton[];
  subtitle?: string;    // Optional subtitle below the title
}

// Common action presets for reuse
export const commonActions = {
  addTask: (onPress: () => void): ActionButton => ({
    label: 'Add Task',
    icon: 'plus',
    onPress,
    variant: 'primary',
  }),
  addProject: (onPress: () => void): ActionButton => ({
    label: 'Add Project',
    icon: 'plus',
    onPress,
    variant: 'primary',
  }),
  share: (onPress: () => void): ActionButton => ({
    label: 'Share',
    icon: 'share-alt',
    onPress,
    variant: 'secondary',
  }),
  upload: (onPress: () => void): ActionButton => ({
    label: 'Upload',
    icon: 'upload',
    onPress,
    variant: 'secondary',
  }),
  settings: (onPress: () => void): ActionButton => ({
    label: 'Settings',
    icon: 'cog',
    onPress,
    variant: 'ghost',
  }),
  filter: (onPress: () => void): ActionButton => ({
    label: 'Filter',
    icon: 'filter',
    onPress,
    variant: 'ghost',
  }),
};

export default function PageHeader({ 
  section, 
  pageName, 
  actions = [],
  subtitle,
}: PageHeaderProps) {
  const { themeMode } = useThemeStore();
  const theme = themes[themeMode];

  // Only render on web (mobile has different headers)
  if (Platform.OS !== 'web') {
    return null;
  }

  const getButtonStyles = (variant: ActionButton['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          textColor: '#ffffff',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: theme.textSecondary,
        };
      case 'secondary':
      default:
        return {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          textColor: theme.text,
        };
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      {/* Left Section - Title */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionText, { color: theme.textTertiary }]}>
            {section}:
          </Text>
          <Text style={[styles.pageNameText, { color: theme.text }]}>
            {pageName}
          </Text>
        </View>
        {subtitle && (
          <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Section - Actions */}
      {actions.length > 0 && (
        <View style={styles.actionsSection}>
          {actions.map((action, index) => {
            const buttonStyles = getButtonStyles(action.variant);
            return (
              <TouchableOpacity
                key={`${action.label}-${index}`}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: buttonStyles.backgroundColor,
                    borderColor: buttonStyles.borderColor,
                    opacity: action.disabled ? 0.5 : 1,
                  },
                  action.variant === 'ghost' && styles.ghostButton,
                ]}
                onPress={action.onPress}
                disabled={action.disabled}
              >
                {action.icon && (
                  <FontAwesome
                    name={action.icon as any}
                    size={12}
                    color={buttonStyles.textColor}
                  />
                )}
                <Text style={[styles.actionText, { color: buttonStyles.textColor }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pageNameText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.02,
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  ghostButton: {
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
