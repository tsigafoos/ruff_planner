import { View, Text, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface BurndownChartProps {
  /** Total number of tasks/points */
  totalTasks: number;
  /** Number of completed tasks/points */
  completedTasks: number;
  /** Sprint duration in days */
  sprintDays?: number;
  /** Show summary stats at top */
  showSummary?: boolean;
  /** Show legend at bottom */
  showLegend?: boolean;
  /** Title for the chart */
  title?: string;
}

/**
 * BurndownChart - Reusable sprint burndown chart component
 * Shows ideal vs actual progress over a sprint
 */
export default function BurndownChart({
  totalTasks,
  completedTasks,
  sprintDays = 14,
  showSummary = true,
  showLegend = true,
  title = 'Sprint Burndown',
}: BurndownChartProps) {
  const theme = useTheme();

  const remainingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Determine if on track
  const isOnTrack = remainingTasks <= totalTasks * (1 - completionRate / 100) * 1.1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isOnTrack ? '#10B98120' : '#F59E0B20' },
          ]}
        >
          <FontAwesome
            name={isOnTrack ? 'check' : 'exclamation'}
            size={10}
            color={isOnTrack ? '#10B981' : '#F59E0B'}
          />
          <Text
            style={[
              styles.statusText,
              { color: isOnTrack ? '#10B981' : '#F59E0B' },
            ]}
          >
            {isOnTrack ? 'On Track' : 'Behind'}
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      {showSummary && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{totalTasks}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{completedTasks}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Done</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>{remainingTasks}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Remaining</Text>
          </View>
        </View>
      )}

      {/* Chart Area */}
      <View style={styles.chart}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>{totalTasks}</Text>
          <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>
            {Math.round(totalTasks / 2)}
          </Text>
          <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>0</Text>
        </View>

        {/* Chart content */}
        <View style={styles.chartContent}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: '0%', borderColor: theme.border }]} />
          <View style={[styles.gridLine, { top: '50%', borderColor: theme.border }]} />
          <View style={[styles.gridLine, { top: '100%', borderColor: theme.border }]} />

          {/* Bars */}
          <View style={styles.bars}>
            {Array.from({ length: sprintDays }).map((_, idx) => {
              const dayProgress = (idx + 1) / sprintDays;
              const idealRemaining = Math.max(0, totalTasks * (1 - dayProgress));
              const actualProgress = completionRate / 100;

              // Simulate actual progress
              const simulatedActual =
                idx < sprintDays * 0.5
                  ? totalTasks * (1 - (actualProgress * (idx + 1)) / (sprintDays * 0.5))
                  : remainingTasks;
              const actualRemaining =
                idx < sprintDays * actualProgress * 1.2
                  ? Math.max(0, simulatedActual)
                  : remainingTasks;

              const chartHeight = 100;
              const idealHeight = (idealRemaining / Math.max(totalTasks, 1)) * chartHeight;
              const actualHeight = (actualRemaining / Math.max(totalTasks, 1)) * chartHeight;

              // Determine if this is "today"
              const isToday = idx === Math.floor(sprintDays * Math.min(0.9, actualProgress + 0.3));

              return (
                <View key={idx} style={styles.day}>
                  <View style={styles.barGroup}>
                    {/* Ideal line marker */}
                    <View
                      style={[
                        styles.idealMarker,
                        { bottom: `${idealHeight}%`, backgroundColor: '#9CA3AF' },
                      ]}
                    />
                    {/* Actual bar */}
                    <View
                      style={[
                        styles.actualBar,
                        {
                          height: `${actualHeight}%`,
                          backgroundColor:
                            actualHeight > idealHeight ? '#EF444440' : '#3B82F640',
                        },
                      ]}
                    />
                    {/* Today marker */}
                    {isToday && (
                      <View
                        style={[styles.todayLine, { backgroundColor: theme.primary }]}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* X-axis labels */}
          <View style={styles.xAxis}>
            <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>Day 1</Text>
            <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>
              Day {Math.floor(sprintDays / 2)}
            </Text>
            <Text style={[styles.axisLabel, { color: theme.textTertiary }]}>
              Day {sprintDays}
            </Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              Ideal Burndown
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>On/Ahead</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Behind</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 8,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  chart: {
    flexDirection: 'row',
    height: 120,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed' as any,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  day: {
    flex: 1,
    height: '100%',
  },
  barGroup: {
    flex: 1,
    position: 'relative',
  },
  idealMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  actualBar: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 0,
    borderRadius: 2,
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
  },
});
