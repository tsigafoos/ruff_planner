-- Migration: Add recurrence column to tasks table
-- This enables recurring task functionality with auto-regeneration

-- Add the recurrence column as JSONB to store the full recurrence config
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurrence JSONB DEFAULT NULL;

-- Add an index for querying recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_enabled 
ON tasks ((recurrence->>'enabled')) 
WHERE recurrence IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN tasks.recurrence IS 'JSON configuration for recurring tasks: {enabled, interval, customDays, daysOfWeek, dayOfMonth, endDate, endAfterOccurrences, occurrenceCount, parentTaskId, regenerateOnComplete, preserveTime}';
