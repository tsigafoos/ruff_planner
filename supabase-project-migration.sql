-- Migration script to add comprehensive project management fields
-- Run this in your Supabase SQL Editor after the initial setup

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'waterfall' CHECK (project_type IN ('waterfall', 'agile')),
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS scope_in TEXT,
ADD COLUMN IF NOT EXISTS scope_out TEXT,
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS team_roles JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS risks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS success_criteria JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assumptions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS constraints TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.project_type IS 'Project methodology: waterfall or agile';
COMMENT ON COLUMN projects.objective IS 'Project objective/goal';
COMMENT ON COLUMN projects.scope_in IS 'What is included in the project scope';
COMMENT ON COLUMN projects.scope_out IS 'What is excluded from the project scope';
COMMENT ON COLUMN projects.deliverables IS 'Array of project deliverables';
COMMENT ON COLUMN projects.milestones IS 'Array of key milestones with dates';
COMMENT ON COLUMN projects.resources IS 'Project resources: people, budget, tools';
COMMENT ON COLUMN projects.team_roles IS 'Array of team roles and responsibilities';
COMMENT ON COLUMN projects.risks IS 'Array of risks with mitigation strategies';
COMMENT ON COLUMN projects.dependencies IS 'Array of project dependencies';
COMMENT ON COLUMN projects.success_criteria IS 'Array of success criteria/KPIs';
COMMENT ON COLUMN projects.assumptions IS 'Array of project assumptions';
COMMENT ON COLUMN projects.constraints IS 'Project constraints';
