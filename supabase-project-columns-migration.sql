-- Migration to add missing columns to projects table
-- Run this in Supabase SQL Editor

-- Add project_type column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'waterfall';

-- Add objective column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS objective text;

-- Add scope columns
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS scope_in text;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS scope_out text;

-- Add deliverables column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb;

-- Add milestones column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]'::jsonb;

-- Add date columns
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;

-- Add team_roles column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_roles jsonb DEFAULT '[]'::jsonb;

-- Add risks column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS risks jsonb DEFAULT '[]'::jsonb;

-- Add dependencies column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS dependencies jsonb DEFAULT '[]'::jsonb;

-- Add success_criteria column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS success_criteria jsonb DEFAULT '[]'::jsonb;

-- Add assumptions column (JSONB array)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS assumptions jsonb DEFAULT '[]'::jsonb;

-- Add constraints column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS constraints text;

-- Add team_management column (JSONB object)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_management jsonb;

-- Add is_default column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Ensure resources is a JSONB array (not object)
-- First check if it exists and update type if needed
DO $$
BEGIN
    -- If resources column doesn't exist, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'resources'
    ) THEN
        ALTER TABLE projects ADD COLUMN resources jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update any existing resources that are empty objects {} to empty arrays []
UPDATE projects 
SET resources = '[]'::jsonb 
WHERE resources IS NULL OR resources = '{}'::jsonb;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
