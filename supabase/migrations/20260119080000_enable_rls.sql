-- Enable Row Level Security on all public tables
-- Since all access goes through API routes with service role,
-- we enable RLS but allow service role to bypass it

-- Posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to posts" ON posts
  FOR ALL USING (true) WITH CHECK (true);

-- Media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to media" ON media
  FOR ALL USING (true) WITH CHECK (true);

-- Comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to comments" ON comments
  FOR ALL USING (true) WITH CHECK (true);

-- Anonymous users table
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to anonymous_users" ON anonymous_users
  FOR ALL USING (true) WITH CHECK (true);

-- Favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to favorites" ON favorites
  FOR ALL USING (true) WITH CHECK (true);

-- Reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to reports" ON reports
  FOR ALL USING (true) WITH CHECK (true);

-- Votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to votes" ON votes
  FOR ALL USING (true) WITH CHECK (true);

-- Subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Rate limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to rate_limits" ON rate_limits
  FOR ALL USING (true) WITH CHECK (true);
