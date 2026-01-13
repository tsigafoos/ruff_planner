-- Migration script to add documentation field to projects table
-- Run this in your Supabase SQL Editor

-- Add documentation field (JSONB to store multiple documents/charts)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS documentation JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN projects.documentation IS 'Array of documentation items: {type: "mermaid" | "markdown" | "text", title: string, content: string}';
