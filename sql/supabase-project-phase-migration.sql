-- Migration: Add project_phase column to tasks table
-- Purpose: Enable Agile Kanban lanes (Brainstorm → Design → Logic → Polish → Done)
-- Note: This field is only used when the associated project has project_type = 'agile'
--       Waterfall projects ignore this field completely.

-- Add project_phase column to tasks table
-- Values: 'brainstorm', 'design', 'logic', 'polish', 'done', or NULL
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_phase TEXT;

-- Add a check constraint to ensure valid phase values
-- (NULL is allowed for Waterfall tasks or tasks not yet assigned a phase)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_phase_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_phase_check 
  CHECK (project_phase IS NULL OR project_phase IN ('brainstorm', 'design', 'logic', 'polish', 'done'));

-- Create index for efficient filtering by phase (useful for Kanban lane queries)
CREATE INDEX IF NOT EXISTS tasks_project_phase ON tasks(project_phase) WHERE project_phase IS NOT NULL;

-- Set default phase for existing in-progress tasks in Agile projects
-- (Optional: Run this only if you want to auto-assign existing tasks)
-- UPDATE tasks t
-- SET project_phase = 'brainstorm'
-- FROM projects p
-- WHERE t.project_id = p.id
--   AND p.project_type = 'agile'
--   AND t.status = 'in_progress'
--   AND t.project_phase IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN tasks.project_phase IS 'Agile workflow phase: brainstorm, design, logic, polish, done. Only used for Agile projects. NULL for Waterfall projects.';
