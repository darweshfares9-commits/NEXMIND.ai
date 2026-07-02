import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getTierConfig, type Tier } from "./tiers";

export type UsageSnapshot = {
  tier: Tier;
  tierName: string;
  used: number;
  limit: number;
  remaining: number;
  voiceSecondsUsed: number;
  voiceSecondsLimit: number;
};

export const getUsageSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UsageSnapshot> => {
    const { supabase, userId } = context;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, active_until")
      .eq("user_id", userId)
      .maybeSingle();

    let tier: Tier = "free";
    if (sub?.tier && (!sub.active_until || new Date(sub.active_until) > new Date())) {
      tier = sub.tier as Tier;
    }
    const config = getTierConfig(tier);

    const today = new Date().toISOString().slice(0, 10);
    const { data: log } = await supabase
      .from("usage_logs")
      .select("messages_count, voice_seconds")
      .eq("user_id", userId)
      .eq("day", today)
      .maybeSingle();

    const used = log?.messages_count ?? 0;
    return {
      tier,
      tierName: config.name,
      used,
      limit: config.dailyMessages,
      remaining: Math.max(0, config.dailyMessages - used),
      voiceSecondsUsed: log?.voice_seconds ?? 0,
      voiceSecondsLimit: config.voiceSecondsPerDay,
    };
  });
