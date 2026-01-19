-- Rate limits table for spam prevention
CREATE TABLE rate_limits (
  fingerprint TEXT PRIMARY KEY,
  last_post_at TIMESTAMPTZ NOT NULL,
  post_count INTEGER DEFAULT 1
);

-- Function to check if a user can post
CREATE OR REPLACE FUNCTION can_user_post(
  p_fingerprint TEXT,
  p_window_seconds INTEGER DEFAULT 3600
)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_post_at TIMESTAMPTZ;
BEGIN
  SELECT last_post_at INTO v_last_post_at
  FROM rate_limits
  WHERE fingerprint = p_fingerprint;

  IF v_last_post_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN NOW() > v_last_post_at + (p_window_seconds || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to record a post for rate limiting
CREATE OR REPLACE FUNCTION record_post(p_fingerprint TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rate_limits (fingerprint, last_post_at, post_count)
  VALUES (p_fingerprint, NOW(), 1)
  ON CONFLICT (fingerprint)
  DO UPDATE SET
    last_post_at = NOW(),
    post_count = rate_limits.post_count + 1;
END;
$$ LANGUAGE plpgsql;
