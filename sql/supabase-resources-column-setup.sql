-- Add resources column to projects table if it doesn't exist
-- Run this FIRST before sql/supabase-resources-array-fix.sql
-- Run this in your Supabase SQL Editor

-- Add resources column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Update any existing NULL values to empty array
UPDATE projects 
SET resources = '[]'::jsonb 
WHERE resources IS NULL;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'resources';
