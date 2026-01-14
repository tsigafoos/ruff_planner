-- Migration script to set up Supabase Storage for project resources
-- Run this in your Supabase SQL Editor

-- Create storage bucket for user files (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload files to their own folder
-- Files are stored as: user_files/{user_id}/filename
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: The folder structure in storage will be:
-- user_files/{user_id}/{filename}
-- or
-- user_files/{user_id}/{folder_name}/{filename}
