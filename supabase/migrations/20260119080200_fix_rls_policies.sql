-- Drop overly permissive policies and create role-specific ones
-- Service role automatically bypasses RLS, so we create restrictive policies for anon role

-- Posts table
DROP POLICY IF EXISTS "Service role has full access to posts" ON posts;
CREATE POLICY "Allow public read on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Deny anon insert on posts" ON posts FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on posts" ON posts FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on posts" ON posts FOR DELETE TO anon USING (false);

-- Media table
DROP POLICY IF EXISTS "Service role has full access to media" ON media;
CREATE POLICY "Allow public read on media" ON media FOR SELECT USING (true);
CREATE POLICY "Deny anon insert on media" ON media FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on media" ON media FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on media" ON media FOR DELETE TO anon USING (false);

-- Comments table
DROP POLICY IF EXISTS "Service role has full access to comments" ON comments;
CREATE POLICY "Allow public read on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Deny anon insert on comments" ON comments FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on comments" ON comments FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on comments" ON comments FOR DELETE TO anon USING (false);

-- Anonymous users table
DROP POLICY IF EXISTS "Service role has full access to anonymous_users" ON anonymous_users;
CREATE POLICY "Deny anon select on anonymous_users" ON anonymous_users FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on anonymous_users" ON anonymous_users FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on anonymous_users" ON anonymous_users FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on anonymous_users" ON anonymous_users FOR DELETE TO anon USING (false);

-- Favorites table
DROP POLICY IF EXISTS "Service role has full access to favorites" ON favorites;
CREATE POLICY "Deny anon select on favorites" ON favorites FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on favorites" ON favorites FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on favorites" ON favorites FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on favorites" ON favorites FOR DELETE TO anon USING (false);

-- Reports table
DROP POLICY IF EXISTS "Service role has full access to reports" ON reports;
CREATE POLICY "Deny anon select on reports" ON reports FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on reports" ON reports FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on reports" ON reports FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on reports" ON reports FOR DELETE TO anon USING (false);

-- Votes table
DROP POLICY IF EXISTS "Service role has full access to votes" ON votes;
CREATE POLICY "Deny anon select on votes" ON votes FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on votes" ON votes FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on votes" ON votes FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on votes" ON votes FOR DELETE TO anon USING (false);

-- Subscriptions table
DROP POLICY IF EXISTS "Service role has full access to subscriptions" ON subscriptions;
CREATE POLICY "Deny anon select on subscriptions" ON subscriptions FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on subscriptions" ON subscriptions FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on subscriptions" ON subscriptions FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on subscriptions" ON subscriptions FOR DELETE TO anon USING (false);

-- Rate limits table
DROP POLICY IF EXISTS "Service role has full access to rate_limits" ON rate_limits;
CREATE POLICY "Deny anon select on rate_limits" ON rate_limits FOR SELECT TO anon USING (false);
CREATE POLICY "Deny anon insert on rate_limits" ON rate_limits FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update on rate_limits" ON rate_limits FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete on rate_limits" ON rate_limits FOR DELETE TO anon USING (false);
