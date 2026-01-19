-- Add links column to posts table for news/social media links
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- Add check constraint to limit to 3 links
ALTER TABLE posts
ADD CONSTRAINT posts_links_max_3 CHECK (jsonb_array_length(links) <= 3);

-- Add comment for documentation
COMMENT ON COLUMN posts.links IS 'Array of link objects with url and optional title, max 3 links';
