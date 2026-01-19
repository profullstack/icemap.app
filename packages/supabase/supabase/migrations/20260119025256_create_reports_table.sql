-- Reports table for flagged posts
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  fingerprint TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by status
CREATE INDEX reports_status_idx ON reports(status);

-- Index for looking up reports by post
CREATE INDEX reports_post_id_idx ON reports(post_id);
