-- Increase media bucket file size limit from 50MB to 500MB
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'media';
