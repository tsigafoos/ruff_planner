-- Add status column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'to_do';

-- Update existing tasks to have appropriate status based on completed_at
UPDATE tasks SET status = 'completed' WHERE completed_at IS NOT NULL;
UPDATE tasks SET status = 'to_do' WHERE completed_at IS NULL AND status IS NULL;
