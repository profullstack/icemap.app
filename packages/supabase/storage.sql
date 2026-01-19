-- Storage bucket configuration for Supabase
-- Run this in Supabase SQL Editor or via API

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policy: Anyone can read media files (public bucket)
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Storage policy: Server-side only uploads (via service role key)
-- No client-side uploads allowed
CREATE POLICY "Server-side upload only"
ON storage.objects FOR INSERT
WITH CHECK (false); -- Client uploads blocked, server uses service role
