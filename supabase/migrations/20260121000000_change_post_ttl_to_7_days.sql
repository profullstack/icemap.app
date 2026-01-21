-- Change post TTL from 8 hours to 7 days
ALTER TABLE posts
ALTER COLUMN expires_at
SET DEFAULT NOW() + INTERVAL '7 days';
