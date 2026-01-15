import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/components/useTheme';
import { useThemeStore } from '@/store/themeStore';

export interface StatusLaneProps {
  /** Lane identifier */
  laneKey: string;
  /** Display label */
  label: string;
  /** Number of items in lane */
  count: number;
  /** Children (task cards) */
  children: React.ReactNode;
  /** Whether this lane is being dragged over */
  isDragOver?: boolean;
  /** Whether any drag is active (to dim non-target lanes) */
  isDragActive?: boolean;
  /** Lane index for color cycling */
  colorIndex?: number;
  /** Ref callback for drag detection */
  onRefReady?: (ref: View | null) => void;
  /** Data attribute for web drag detection */
  dataLaneKey?: string;
}

// Fixed lane colors - Light mode HSL(225, 2%, 95%→70%), Dark mode HSL(225, 2%, 5%→30%)
const LIGHT_LANE_COLORS = [
  { background: 'hsl(225, 2%, 95%)', stroke: 'hsl(225, 2%, 85%)' },
  { background: 'hsl(225, 2%, 90%)', stroke: 'hsl(225, 2%, 80%)' },
  { background: 'hsl(225, 2%, 85%)', stroke: 'hsl(225, 2%, 75%)' },
  { background: 'hsl(225, 2%, 80%)', stroke: 'hsl(225, 2%, 70%)' },
  { background: 'hsl(225, 2%, 75%)', stroke: 'hsl(225, 2%, 65%)' },
  { background: 'hsl(225, 2%, 70%)', stroke: 'hsl(225, 2%, 60%)' },
];

const DARK_LANE_COLORS = [
  { background: 'hsl(225, 2%, 5%)', stroke: 'hsl(225, 2%, 15%)' },
  { background: 'hsl(225, 2%, 10%)', stroke: 'hsl(225, 2%, 20%)' },
  { background: 'hsl(225, 2%, 15%)', stroke: 'hsl(225, 2%, 25%)' },
  { background: 'hsl(225, 2%, 20%)', stroke: 'hsl(225, 2%, 30%)' },
  { background: 'hsl(225, 2%, 25%)', stroke: 'hsl(225, 2%, 35%)' },
  { background: 'hsl(225, 2%, 30%)', stroke: 'hsl(225, 2%, 40%)' },
];

/**
 * StatusLane - Reusable lane component for status-based task grouping
 * Used in dashboards for Kanban-style layouts with horizontal scrolling
 */
export default function StatusLane({
  laneKey,
  label,
  count,
  children,
  isDragOver = false,
  isDragActive = false,
  colorIndex = 0,
  onRefReady,
  dataLaneKey,
}: StatusLaneProps) {
  const theme = useTheme();
  const { resolvedTheme } = useThemeStore();
  const isDark = theme.background === '#0f0f11' || resolvedTheme === 'dark';
  
  const laneColors = isDark 
    ? DARK_LANE_COLORS[colorIndex % DARK_LANE_COLORS.length] 
    : LIGHT_LANE_COLORS[colorIndex % LIGHT_LANE_COLORS.length];

  return (
    <View 
      ref={onRefReady}
      {...(Platform.OS === 'web' ? {
        // @ts-ignore - data attributes for web
        'data-lane-key': dataLaneKey || laneKey,
      } : {})}
      style={[
        styles.lane, 
        { 
          backgroundColor: laneColors.background,
          borderColor: isDragOver ? theme.primary : laneColors.stroke,
          borderWidth: isDragOver ? 2 : 1,
          opacity: isDragActive && !isDragOver ? 0.5 : 1,
        }
      ]}
    >
      <View style={[styles.laneHeader, { borderBottomColor: theme.border }]}>
        <Text style={[styles.laneTitle, { color: isDark ? theme.text : '#1a1a1a' }]}>
          {label}
        </Text>
        <View style={[styles.laneCount, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
          <Text style={[styles.laneCountText, { color: isDark ? theme.text : '#1a1a1a' }]}>
            {count}
          </Text>
        </View>
      </View>
      <ScrollView 
        style={styles.laneContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {children}
        {count === 0 && (
          <View style={styles.laneEmpty}>
            <Text style={[styles.laneEmptyText, { color: isDark ? theme.textTertiary : '#717171' }]}>
              No tasks
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    width: Platform.OS === 'web' ? 240 : 220,
    marginRight: 8,
    borderRadius: 10,
    maxHeight: Platform.OS === 'web' ? '60vh' as any : 500,
  },
  laneHeader: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  laneTitle: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
  },
  laneCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  laneCountText: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
    fontWeight: '600',
  },
  laneContent: {
    flex: 1,
    padding: 8,
  },
  laneEmpty: {
    padding: 24,
    alignItems: 'center',
  },
  laneEmptyText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
  },
});
