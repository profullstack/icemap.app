-- Create function to get nearby posts within a radius
CREATE OR REPLACE FUNCTION get_nearby_posts(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION,
  p_exclude_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  id UUID,
  location TEXT,
  city TEXT,
  state TEXT,
  cross_street TEXT,
  summary TEXT,
  incident_type TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
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
    p.expires_at,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_meters
  FROM posts p
  WHERE p.expires_at >= NOW()
    AND (p_exclude_id IS NULL OR p.id != p_exclude_id)
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT p_limit;
END;
$$;
