-- Subscriptions table for area notifications
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  sw_lat DOUBLE PRECISION NOT NULL,
  sw_lng DOUBLE PRECISION NOT NULL,
  ne_lat DOUBLE PRECISION NOT NULL,
  ne_lng DOUBLE PRECISION NOT NULL,
  push_endpoint TEXT,
  push_p256dh TEXT,
  push_auth TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fingerprint lookups
CREATE INDEX subscriptions_fingerprint_idx ON subscriptions(fingerprint);

-- Function to find subscriptions that should be notified for a new post
CREATE OR REPLACE FUNCTION find_subscriptions_for_post(p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS TABLE (
  id UUID,
  fingerprint TEXT,
  push_endpoint TEXT,
  push_p256dh TEXT,
  push_auth TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.fingerprint, s.push_endpoint, s.push_p256dh, s.push_auth
  FROM subscriptions s
  WHERE p_lat >= s.sw_lat AND p_lat <= s.ne_lat
    AND p_lng >= s.sw_lng AND p_lng <= s.ne_lng
    AND s.push_endpoint IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
