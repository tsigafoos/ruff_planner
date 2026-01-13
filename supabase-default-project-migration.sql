-- Add is_default column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS projects_user_default ON projects(user_id, is_default) WHERE is_default = TRUE;
