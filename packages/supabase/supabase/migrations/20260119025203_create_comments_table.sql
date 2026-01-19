-- Comments table for post discussions
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up comments by post
CREATE INDEX comments_post_id_idx ON comments(post_id);

-- Index for fingerprint lookups
CREATE INDEX comments_fingerprint_idx ON comments(fingerprint);
