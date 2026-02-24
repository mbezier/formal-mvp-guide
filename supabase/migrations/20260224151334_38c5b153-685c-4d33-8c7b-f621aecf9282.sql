
-- Analytics events table for tracking user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (including anonymous visitors)
CREATE POLICY "Allow inserts" ON public.analytics_events
FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (for admin queries)
CREATE POLICY "Authenticated reads" ON public.analytics_events
FOR SELECT USING (auth.role() = 'authenticated');
