
DROP POLICY IF EXISTS "Authenticated reads" ON public.analytics_events;
CREATE POLICY "Users read own events" ON public.analytics_events
FOR SELECT TO authenticated
USING (user_id = auth.uid());
