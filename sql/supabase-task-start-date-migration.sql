-- Add start_date column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();

-- Update existing tasks to have start_date = created_at if start_date is null
UPDATE tasks SET start_date = created_at WHERE start_date IS NULL;
