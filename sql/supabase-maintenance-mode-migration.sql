-- Maintenance Mode Migration
-- Adds category field to tasks for maintenance project classification
-- Run this in Supabase SQL Editor

-- Add category column to tasks (for maintenance project tickets)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category);

-- Comment for documentation
COMMENT ON COLUMN tasks.category IS 'Maintenance project category: bug, enhancement, support, other';

-- Note: project_type column already exists on projects table
-- Values: 'waterfall', 'agile', 'maintenance'
