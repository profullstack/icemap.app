-- Note: pg_cron must be enabled in Supabase dashboard before running these
-- Enable pg_cron extension (requires Supabase Pro plan or self-hosted)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Scheduled job to delete expired posts every 15 minutes
-- SELECT cron.schedule(
--   'delete-expired-posts',
--   '*/15 * * * *',
--   $$DELETE FROM posts WHERE expires_at < NOW()$$
-- );

-- Clean up orphaned rate limits older than 24 hours
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *',
--   $$DELETE FROM rate_limits WHERE last_post_at < NOW() - INTERVAL '24 hours'$$
-- );

-- Alternative: Create a function that can be called by an external cron service
CREATE OR REPLACE FUNCTION cleanup_expired_posts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM posts WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM rate_limits WHERE last_post_at < NOW() - INTERVAL '24 hours'
    RETURNING fingerprint
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
