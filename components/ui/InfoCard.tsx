import { View, Text, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface InfoCardProps {
  /** Icon name from FontAwesome */
  icon: string;
  /** Icon color */
  iconColor?: string;
  /** Label text (shown at top) */
  label: string;
  /** Main value (large text) */
  value: string | number;
  /** Optional subtext below value */
  subtext?: string;
  /** Value color override */
  valueColor?: string;
  /** Optional progress bar (0-100) */
  progress?: number;
  /** Progress bar color */
  progressColor?: string;
  /** Card style variant */
  variant?: 'default' | 'compact';
}

/**
 * InfoCard - Reusable metric/summary card component
 * Used in dashboards for displaying key stats like health, progress, days remaining, etc.
 */
export default function InfoCard({
  icon,
  iconColor,
  label,
  value,
  subtext,
  valueColor,
  progress,
  progressColor,
  variant = 'default',
}: InfoCardProps) {
  const theme = useTheme();
  const finalIconColor = iconColor || theme.primary;
  const finalValueColor = valueColor || theme.text;
  const finalProgressColor = progressColor || theme.primary;

  if (variant === 'compact') {
    return (
      <View style={[styles.cardCompact, { backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.valueCompact, { color: finalValueColor }]}>{value}</Text>
        <Text style={[styles.labelCompact, { color: theme.textSecondary }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <FontAwesome name={icon as any} size={16} color={finalIconColor} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: finalValueColor }]}>{value}</Text>
        {subtext && (
          <Text style={[styles.subtext, { color: theme.textSecondary }]}>{subtext}</Text>
        )}
      </View>
      {progress !== undefined && (
        <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: finalProgressColor 
              }
            ]} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 180 : 150,
    maxWidth: Platform.OS === 'web' ? 250 : '48%' as any,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardCompact: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelCompact: {
    fontSize: 11,
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  valueCompact: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
