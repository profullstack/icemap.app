-- Posts table for incident reports
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  city TEXT,
  state TEXT,
  cross_street TEXT,
  summary TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '8 hours'
);

-- Spatial index for bounding box queries
CREATE INDEX posts_location_idx ON posts USING GIST(location);

-- Index for auto-deletion queries
CREATE INDEX posts_expires_at_idx ON posts(expires_at);

-- Index for fingerprint lookups (rate limiting)
CREATE INDEX posts_fingerprint_idx ON posts(fingerprint);

-- Index for incident type filtering
CREATE INDEX posts_incident_type_idx ON posts(incident_type);
