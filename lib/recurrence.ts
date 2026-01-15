import { addDays, addWeeks, addMonths, addYears, setDate, getDate, lastDayOfMonth, setHours, setMinutes } from 'date-fns';
import { RecurrenceConfig, RecurrenceInterval, DayOfWeek, Task } from '@/types';

/**
 * Calculate the next due date based on recurrence configuration
 */
export function calculateNextDueDate(
  currentDueDate: Date | undefined,
  recurrence: RecurrenceConfig,
  completedDate?: Date
): Date {
  // Use completed date or current due date as base
  const baseDate = completedDate || currentDueDate || new Date();
  let nextDate = new Date(baseDate);

  switch (recurrence.interval) {
    case 'daily':
      nextDate = addDays(baseDate, 1);
      break;

    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Find next occurrence on specified days
        nextDate = getNextDayOfWeek(baseDate, recurrence.daysOfWeek);
      } else {
        nextDate = addWeeks(baseDate, 1);
      }
      break;

    case 'biweekly':
      nextDate = addWeeks(baseDate, 2);
      break;

    case 'monthly':
      if (recurrence.dayOfMonth) {
        // Set to specific day of next month
        nextDate = addMonths(baseDate, 1);
        if (recurrence.dayOfMonth === -1) {
          // Last day of month
          nextDate = lastDayOfMonth(nextDate);
        } else {
          // Specific day, but clamp to month's last day
          const lastDay = getDate(lastDayOfMonth(nextDate));
          const targetDay = Math.min(recurrence.dayOfMonth, lastDay);
          nextDate = setDate(nextDate, targetDay);
        }
      } else {
        nextDate = addMonths(baseDate, 1);
      }
      break;

    case 'quarterly':
      nextDate = addMonths(baseDate, 3);
      break;

    case 'yearly':
      nextDate = addYears(baseDate, 1);
      break;

    case 'custom':
      if (recurrence.customDays) {
        nextDate = addDays(baseDate, recurrence.customDays);
      } else {
        nextDate = addDays(baseDate, 1); // Fallback to daily
      }
      break;

    default:
      nextDate = addDays(baseDate, 1);
  }

  // Preserve time if requested
  if (recurrence.preserveTime && currentDueDate) {
    nextDate = setHours(nextDate, currentDueDate.getHours());
    nextDate = setMinutes(nextDate, currentDueDate.getMinutes());
  }

  return nextDate;
}

/**
 * Get the next occurrence of specified days of week
 */
function getNextDayOfWeek(fromDate: Date, daysOfWeek: DayOfWeek[]): Date {
  const dayMap: Record<DayOfWeek, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDays = daysOfWeek.map(d => dayMap[d]).sort((a, b) => a - b);
  const currentDay = fromDate.getDay();
  
  // Find the next day in the list after today
  let nextDayNum = targetDays.find(d => d > currentDay);
  let daysToAdd: number;

  if (nextDayNum !== undefined) {
    daysToAdd = nextDayNum - currentDay;
  } else {
    // Wrap to next week, use first day in list
    daysToAdd = 7 - currentDay + targetDays[0];
  }

  return addDays(fromDate, daysToAdd);
}

/**
 * Check if recurrence should continue (hasn't hit end conditions)
 */
export function shouldContinueRecurrence(recurrence: RecurrenceConfig, nextDueDate: Date): boolean {
  if (!recurrence.enabled) return false;

  // Check end date
  if (recurrence.endDate && nextDueDate > recurrence.endDate) {
    return false;
  }

  // Check occurrence count
  if (recurrence.endAfterOccurrences && recurrence.occurrenceCount) {
    if (recurrence.occurrenceCount >= recurrence.endAfterOccurrences) {
      return false;
    }
  }

  return true;
}

/**
 * Create a regenerated task from a completed recurring task
 */
export function createRegeneratedTask(
  completedTask: Task,
  completedDate: Date = new Date()
): Partial<Task> | null {
  if (!completedTask.recurrence || !completedTask.recurrence.enabled) {
    return null;
  }

  const recurrence = completedTask.recurrence;
  
  // Calculate next due date
  const nextDueDate = calculateNextDueDate(
    completedTask.dueDate,
    recurrence,
    recurrence.regenerateOnComplete ? completedDate : undefined
  );

  // Check if we should continue
  if (!shouldContinueRecurrence(recurrence, nextDueDate)) {
    return null;
  }

  // Calculate next start date if original had one
  let nextStartDate: Date | undefined;
  if (completedTask.startDate && completedTask.dueDate) {
    const daysBetween = Math.floor(
      (completedTask.dueDate.getTime() - completedTask.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextStartDate = addDays(nextDueDate, -daysBetween);
  }

  // Create new task data
  const newTask: Partial<Task> = {
    title: completedTask.title,
    description: completedTask.description,
    priority: completedTask.priority,
    projectId: completedTask.projectId,
    labelIds: completedTask.labelIds || [],
    userId: completedTask.userId,
    status: 'to_do',
    projectPhase: completedTask.projectPhase,
    category: completedTask.category,
    assigneeId: completedTask.assigneeId,
    dueDate: nextDueDate,
    startDate: nextStartDate,
    recurrence: {
      ...recurrence,
      occurrenceCount: (recurrence.occurrenceCount || 0) + 1,
      parentTaskId: recurrence.parentTaskId || completedTask.id,
    },
  };

  return newTask;
}

/**
 * Get human-readable recurrence description
 */
export function getRecurrenceDescription(recurrence: RecurrenceConfig): string {
  if (!recurrence.enabled) return 'Not recurring';

  const descriptions: Record<RecurrenceInterval, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    custom: recurrence.customDays ? `Every ${recurrence.customDays} days` : 'Custom',
  };

  let desc = descriptions[recurrence.interval];

  // Add day details for weekly
  if (recurrence.interval === 'weekly' && recurrence.daysOfWeek?.length) {
    const dayNames = recurrence.daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3));
    desc += ` on ${dayNames.join(', ')}`;
  }

  // Add day details for monthly
  if (recurrence.interval === 'monthly' && recurrence.dayOfMonth) {
    if (recurrence.dayOfMonth === -1) {
      desc += ' (last day)';
    } else {
      desc += ` (day ${recurrence.dayOfMonth})`;
    }
  }

  // Add end condition
  if (recurrence.endDate) {
    desc += ` until ${recurrence.endDate.toLocaleDateString()}`;
  } else if (recurrence.endAfterOccurrences) {
    const remaining = recurrence.endAfterOccurrences - (recurrence.occurrenceCount || 0);
    desc += ` (${remaining} remaining)`;
  }

  return desc;
}

/**
 * Default recurrence configuration
 */
export function getDefaultRecurrence(): RecurrenceConfig {
  return {
    enabled: false,
    interval: 'weekly',
    regenerateOnComplete: true,
    preserveTime: true,
  };
}

/**
 * Quick recurrence presets
 */
export const RECURRENCE_PRESETS: { label: string; config: Partial<RecurrenceConfig> }[] = [
  { label: 'Daily', config: { interval: 'daily' } },
  { label: 'Weekdays', config: { interval: 'weekly', daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] } },
  { label: 'Weekly', config: { interval: 'weekly' } },
  { label: 'Biweekly', config: { interval: 'biweekly' } },
  { label: 'Monthly', config: { interval: 'monthly' } },
  { label: 'Quarterly', config: { interval: 'quarterly' } },
  { label: 'Yearly', config: { interval: 'yearly' } },
];
