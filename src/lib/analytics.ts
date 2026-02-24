import { supabase } from "@/integrations/supabase/client";

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

export async function trackEvent(eventName: string, eventData?: Record<string, any>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData ?? {},
      user_id: user?.id ?? null,
      session_id: getSessionId(),
    });
  } catch {
    // Silently fail — analytics should never break the app
  }
}
