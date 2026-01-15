import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '@/components/useTheme';
import { ReactNode } from 'react';

export interface SectionCardProps {
  /** Section title */
  title?: string;
  /** Section subtitle/label */
  label?: string;
  /** Content to render */
  children: ReactNode;
  /** Right side header content (e.g., action button) */
  headerRight?: ReactNode;
  /** Optional additional style */
  style?: ViewStyle;
  /** No padding inside */
  noPadding?: boolean;
}

/**
 * SectionCard - Reusable section container with consistent styling
 */
export default function SectionCard({
  title,
  label,
  children,
  headerRight,
  style,
  noPadding = false,
}: SectionCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {(title || label || headerRight) && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View>
            {label && (
              <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            )}
            {title && (
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            )}
          </View>
          {headerRight}
        </View>
      )}
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
});
