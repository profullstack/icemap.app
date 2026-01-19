-- Votes table for upvotes/downvotes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, fingerprint)
);

-- Index for looking up votes by post
CREATE INDEX votes_post_id_idx ON votes(post_id);

-- Index for looking up user's votes
CREATE INDEX votes_fingerprint_idx ON votes(fingerprint);

-- Function to get vote count for a post
CREATE OR REPLACE FUNCTION get_post_vote_count(p_post_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(vote_type) FROM votes WHERE post_id = p_post_id),
    0
  );
END;
$$ LANGUAGE plpgsql;
