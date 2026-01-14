-- Fix resources column to default to array instead of object
-- Run this AFTER supabase-resources-column-setup.sql
-- Run this in your Supabase SQL Editor

-- First, ensure the column exists (if you haven't run the setup script)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'resources'
    ) THEN
        ALTER TABLE projects ADD COLUMN resources JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update the default value for resources column to be an array
ALTER TABLE projects 
ALTER COLUMN resources SET DEFAULT '[]'::jsonb;

-- Update existing projects that have {} (object) to [] (array)
UPDATE projects 
SET resources = '[]'::jsonb 
WHERE resources = '{}'::jsonb OR resources IS NULL;

-- Verify the change
SELECT id, name, resources FROM projects LIMIT 5;
