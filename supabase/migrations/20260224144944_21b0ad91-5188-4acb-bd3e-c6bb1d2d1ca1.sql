
-- Fix storage policies: remove anonymous access, require authentication

DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes" ON storage.objects;

CREATE POLICY "Authenticated uploads only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner reads only" ON storage.objects
FOR SELECT USING (
  bucket_id = 'uploads' 
  AND auth.uid() = owner
);

CREATE POLICY "Owner deletes only" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' 
  AND auth.uid() = owner
);
