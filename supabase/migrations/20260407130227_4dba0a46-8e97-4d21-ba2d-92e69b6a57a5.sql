-- Fix 1: Add owner-only UPDATE policy on storage.objects for uploads bucket
CREATE POLICY "Owner updates only"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'uploads' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'uploads' AND auth.uid() = owner);

-- Fix 2: Replace permissive anonymous INSERT policy on analytics_events with authenticated-only
DROP POLICY "Allow tracked inserts" ON public.analytics_events;

CREATE POLICY "Authenticated tracked inserts"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND char_length(event_name) <= 100
  AND (event_data IS NULL OR pg_column_size(event_data) <= 1024)
);