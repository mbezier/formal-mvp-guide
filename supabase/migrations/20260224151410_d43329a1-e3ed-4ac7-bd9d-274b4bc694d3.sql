
-- Tighten the insert policy: limit what can be inserted
-- Replace the permissive policy with one that validates event_name length
DROP POLICY IF EXISTS "Allow inserts" ON public.analytics_events;

CREATE POLICY "Allow tracked inserts" ON public.analytics_events
FOR INSERT WITH CHECK (
  char_length(event_name) <= 100
  AND (event_data IS NULL OR pg_column_size(event_data) <= 1024)
);
