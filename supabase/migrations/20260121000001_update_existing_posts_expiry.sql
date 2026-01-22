-- Update existing posts to expire 7 days from creation instead of 8 hours
UPDATE posts
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at < created_at + INTERVAL '7 days';
