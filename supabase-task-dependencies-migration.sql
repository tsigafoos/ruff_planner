-- Task Dependencies Migration
-- Adds assignee and blocked_by fields to tasks table
-- Run this in Supabase SQL Editor

-- Add assignee_id column (single assignee per task)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id);

-- Add blocked_by column (array of task IDs that block this task)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS blocked_by JSONB DEFAULT '[]'::jsonb;

-- Create index for efficient dependency queries
CREATE INDEX IF NOT EXISTS idx_tasks_blocked_by ON tasks USING GIN (blocked_by);

-- Create index for assignee queries
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks (assignee_id);

-- Comment for documentation
COMMENT ON COLUMN tasks.assignee_id IS 'User ID of the task assignee (single owner)';
COMMENT ON COLUMN tasks.blocked_by IS 'Array of task IDs that must be completed before this task can start';

-- Example usage:
-- To set blocked_by: UPDATE tasks SET blocked_by = '["task-id-1", "task-id-2"]' WHERE id = 'some-task-id';
-- To add a blocker: UPDATE tasks SET blocked_by = blocked_by || '"new-task-id"' WHERE id = 'some-task-id';
-- To remove a blocker: UPDATE tasks SET blocked_by = blocked_by - 'task-id-to-remove' WHERE id = 'some-task-id';
-- To check if blocked: SELECT * FROM tasks WHERE jsonb_array_length(blocked_by) > 0;
