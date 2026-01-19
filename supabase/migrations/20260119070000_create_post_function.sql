-- Function to create a post with proper geography handling
CREATE OR REPLACE FUNCTION create_post(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_city TEXT,
  p_state TEXT,
  p_cross_street TEXT,
  p_summary TEXT,
  p_incident_type TEXT,
  p_fingerprint TEXT,
  p_links JSONB DEFAULT '[]'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  INSERT INTO posts (
    location,
    city,
    state,
    cross_street,
    summary,
    incident_type,
    fingerprint,
    links
  ) VALUES (
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_city,
    p_state,
    p_cross_street,
    p_summary,
    p_incident_type,
    p_fingerprint,
    p_links
  ) RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;
