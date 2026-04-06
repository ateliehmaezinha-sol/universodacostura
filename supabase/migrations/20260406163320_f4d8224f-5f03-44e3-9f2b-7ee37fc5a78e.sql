
DROP POLICY "Authenticated users can read generated images" ON storage.objects;

CREATE POLICY "Users can read own generated images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
