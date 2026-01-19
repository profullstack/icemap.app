-- Create function to get posts within a bounding box
CREATE OR REPLACE FUNCTION get_posts_in_bounds(
  min_lat DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lng DOUBLE PRECISION
) RETURNS TABLE (
  id UUID,
  location TEXT,
  city TEXT,
  state TEXT,
  cross_street TEXT,
  summary TEXT,
  incident_type TEXT,
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
    p.created_at,
    p.expires_at
  FROM posts p
  WHERE p.expires_at >= NOW()
    AND ST_Intersects(
      p.location,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
    );
END;
$$;
