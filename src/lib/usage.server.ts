// Server-only quota helpers. Use service role to atomically bump counters.
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTierConfig, type Tier } from "./tiers";

export interface QuotaCheck {
  allowed: boolean;
  tier: Tier;
  used: number;
  limit: number;
  reason?: string;
}

export async function checkAndIncrementMessageQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaCheck> {
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

  const { data: existing } = await supabase
    .from("usage_logs")
    .select("messages_count")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();

  const currentCount = existing?.messages_count ?? 0;

  if (currentCount >= config.dailyMessages) {
    return {
      allowed: false,
      tier,
      used: currentCount,
      limit: config.dailyMessages,
      reason: `وصلت إلى الحد اليومي (${config.dailyMessages} رسالة). جدّد غداً أو ارقِ خطتك.`,
    };
  }

  if (existing) {
    await supabase
      .from("usage_logs")
      .update({ messages_count: currentCount + 1 })
      .eq("user_id", userId)
      .eq("day", today);
  } else {
    await supabase
      .from("usage_logs")
      .insert({ user_id: userId, day: today, messages_count: 1 });
  }

  return {
    allowed: true,
    tier,
    used: currentCount + 1,
    limit: config.dailyMessages,
  };
}

export async function bumpVoiceSeconds(
  supabase: SupabaseClient,
  userId: string,
  seconds: number,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("usage_logs")
    .select("voice_seconds")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  const next = (existing?.voice_seconds ?? 0) + Math.ceil(seconds);
  if (existing) {
    await supabase.from("usage_logs").update({ voice_seconds: next }).eq("user_id", userId).eq("day", today);
  } else {
    await supabase.from("usage_logs").insert({ user_id: userId, day: today, voice_seconds: next });
  }
}
