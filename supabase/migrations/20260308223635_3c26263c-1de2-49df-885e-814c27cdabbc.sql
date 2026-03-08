INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('generated-images', 'generated-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']);

CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

CREATE POLICY "Service role can upload generated images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'generated-images');