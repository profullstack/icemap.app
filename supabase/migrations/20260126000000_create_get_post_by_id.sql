-- Create function to get a single post by ID with properly formatted location
CREATE OR REPLACE FUNCTION get_post_by_id(p_id UUID)
RETURNS TABLE (
  id UUID,
  location TEXT,
  city TEXT,
  state TEXT,
  cross_street TEXT,
  summary TEXT,
  incident_type TEXT,
  fingerprint TEXT,
  links JSONB,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    ST_AsText(p.location::geometry) AS location,
    p.city,
    p.state,
    p.cross_street,
    p.summary,
    p.incident_type,
    p.fingerprint,
    p.links,
    p.created_at,
    p.expires_at
  FROM posts p
  WHERE p.id = p_id
    AND p.expires_at >= NOW();
END;
$$;
