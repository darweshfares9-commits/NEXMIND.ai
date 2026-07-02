
-- Subscriptions
CREATE TABLE public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','starter','pro','business')),
  active_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription read" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own subscription insert" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Usage logs
CREATE TABLE public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  messages_count int NOT NULL DEFAULT 0,
  voice_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
GRANT SELECT, INSERT, UPDATE ON public.usage_logs TO authenticated;
GRANT ALL ON public.usage_logs TO service_role;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage" ON public.usage_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shared conversations
CREATE TABLE public.shared_conversations (
  token text PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shared_conversations TO anon, authenticated;
GRANT INSERT, DELETE ON public.shared_conversations TO authenticated;
GRANT ALL ON public.shared_conversations TO service_role;
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read shared" ON public.shared_conversations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner create shared" ON public.shared_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner delete shared" ON public.shared_conversations FOR DELETE TO authenticated USING (auth.uid() = owner_id);
