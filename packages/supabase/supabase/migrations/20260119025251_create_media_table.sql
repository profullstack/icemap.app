-- Media table for images/videos attached to posts
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  original_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up media by post
CREATE INDEX media_post_id_idx ON media(post_id);
