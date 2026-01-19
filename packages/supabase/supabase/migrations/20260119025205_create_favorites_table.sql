-- Favorites table for saved posts
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, fingerprint)
);

-- Index for looking up user's favorites
CREATE INDEX favorites_fingerprint_idx ON favorites(fingerprint);

-- Index for looking up favorites by post
CREATE INDEX favorites_post_id_idx ON favorites(post_id);
