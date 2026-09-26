-- Restore the RLS policies on storage.objects that the 2026-09-25 move to the
-- self-hosted Supabase stack on dev2 left behind.
--
-- The move dumped DDL for the app schemas only, and pg_dump files a policy
-- under its table's schema, so every policy ON storage.objects was dropped
-- while the media bucket (copied as data) survived. With RLS on and no
-- policy, storage.objects denies every anon/authenticated read and write;
-- only service-role access and public object URLs keep working.
--
-- Final state after replaying the repo's SQL:
--   supabase/migrations/20260119061259_create_media_bucket.sql   4 policies
--   packages/supabase/storage.sql                                "Server-side upload only"
-- storage.sql was a hand-run script ("Run this in Supabase SQL Editor"); its
-- "Public read access for media" has the same name and definition as the
-- migration's, and its "Server-side upload only" (WITH CHECK (false)) is a
-- permissive policy, so it grants nothing on its own. It is restored so the
-- stack matches what the cloud project most likely held.
--
-- The repo never created a trigger on auth.* or storage.* tables, so only
-- policies are restored here.
--
-- Idempotent: safe to re-run.

DROP POLICY IF EXISTS "Public read access for media" ON storage.objects;
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

-- packages/supabase/storage.sql
DROP POLICY IF EXISTS "Server-side upload only" ON storage.objects;
CREATE POLICY "Server-side upload only"
ON storage.objects FOR INSERT
WITH CHECK (false); -- Client uploads blocked, server uses service role
