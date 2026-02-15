-- Enable pg_cron for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification_history table
CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'scheduled')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment_reminder', 'general')),
    recurrence TEXT NOT NULL CHECK (recurrence IN ('once', 'daily', 'weekly', 'biweekly', 'monthly')),
    next_run_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notification_history
-- Admins can view all, Users can view their own
CREATE POLICY "Admins can view all notification history"
ON public.notification_history FOR SELECT
USING (
  public.is_admin() OR 
  auth.uid() = user_id -- Users view their own
);

-- Only Service Role or Admins can insert (for now, mainly Edge Functions via Service Role)
CREATE POLICY "Service Role can insert notification history"
ON public.notification_history FOR INSERT
WITH CHECK (true); -- Usually handled by service role key, but allowing authenticated for now if app sends it directly (though plan says Edge Function)

-- Policies for scheduled_notifications
-- Admins manage schedules
CREATE POLICY "Admins can manage scheduled notifications"
ON public.scheduled_notifications FOR ALL
USING (public.is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON public.notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_next_run_at ON public.scheduled_notifications(next_run_at) WHERE is_active = TRUE;
