-- Anonymous users table - maps fingerprints to consistent anonymous IDs
CREATE TABLE anonymous_users (
  fingerprint TEXT PRIMARY KEY,
  anonymous_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to generate random anonymous ID
CREATE OR REPLACE FUNCTION generate_anonymous_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := 'anon_';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create anonymous ID for a fingerprint
CREATE OR REPLACE FUNCTION get_or_create_anonymous_id(p_fingerprint TEXT)
RETURNS TEXT AS $$
DECLARE
  v_anonymous_id TEXT;
BEGIN
  -- Try to get existing anonymous ID
  SELECT anonymous_id INTO v_anonymous_id
  FROM anonymous_users
  WHERE fingerprint = p_fingerprint;

  -- If not found, create one
  IF v_anonymous_id IS NULL THEN
    v_anonymous_id := generate_anonymous_id();

    -- Insert with conflict handling in case of race condition
    INSERT INTO anonymous_users (fingerprint, anonymous_id)
    VALUES (p_fingerprint, v_anonymous_id)
    ON CONFLICT (fingerprint) DO UPDATE SET fingerprint = EXCLUDED.fingerprint
    RETURNING anonymous_id INTO v_anonymous_id;
  END IF;

  RETURN v_anonymous_id;
END;
$$ LANGUAGE plpgsql;
