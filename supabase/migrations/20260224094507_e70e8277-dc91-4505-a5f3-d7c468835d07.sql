
-- Create storage bucket for uploaded Excel files (no auth required for demo)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads (for demo mode without auth)
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Allow anonymous reads
CREATE POLICY "Allow anonymous reads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Allow anonymous deletes
CREATE POLICY "Allow anonymous deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads');
