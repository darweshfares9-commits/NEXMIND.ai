// Subscription tier definitions for NexMind.
export type Tier = "free" | "starter" | "pro" | "business";

export interface TierConfig {
  id: Tier;
  name: string;
  pricePerMonth: number; // EGP
  dailyMessages: number;
  monthlyMessages: number;
  voiceSecondsPerDay: number;
  liveCallsEnabled: boolean;
  exportEnabled: boolean;
  shareEnabled: boolean;
  features: string[];
  highlight?: boolean;
}

export const TIERS: Record<Tier, TierConfig> = {
  free: {
    id: "free",
    name: "Free",
    pricePerMonth: 0,
    dailyMessages: 20,
    monthlyMessages: 600,
    voiceSecondsPerDay: 0,
    liveCallsEnabled: false,
    exportEnabled: false,
    shareEnabled: true,
    features: [
      "20 رسالة يومياً",
      "كل الأدوات النصية",
      "مشاركة المحادثات",
      "بدون صوت / مكالمات",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    pricePerMonth: 99,
    dailyMessages: 100,
    monthlyMessages: 2000,
    voiceSecondsPerDay: 300,
    liveCallsEnabled: false,
    exportEnabled: true,
    shareEnabled: true,
    features: [
      "100 رسالة يومياً",
      "5 دقائق صوت يومياً",
      "تصدير PDF/Word",
      "أولوية معالجة",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    pricePerMonth: 199,
    dailyMessages: 1000,
    monthlyMessages: 20000,
    voiceSecondsPerDay: 3600,
    liveCallsEnabled: true,
    exportEnabled: true,
    shareEnabled: true,
    highlight: true,
    features: [
      "1000 رسالة يومياً",
      "ساعة صوت يومياً",
      "مكالمات لايف بالفيديو",
      "كل الميزات",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    pricePerMonth: 299,
    dailyMessages: 5000,
    monthlyMessages: 100000,
    voiceSecondsPerDay: 18000,
    liveCallsEnabled: true,
    exportEnabled: true,
    shareEnabled: true,
    features: [
      "حد شبه لا نهائي",
      "5 ساعات صوت يومياً",
      "API Access (قريباً)",
      "دعم مخصص",
    ],
  },
};

export function getTierConfig(tier: string | null | undefined): TierConfig {
  if (tier && tier in TIERS) return TIERS[tier as Tier];
  return TIERS.free;
}
