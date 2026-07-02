import { createFileRoute, Link } from "@tanstack/react-router";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { TIERS } from "@/lib/tiers";
import { Check, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "NexMind · Pricing" },
      { name: "description", content: "خطط الاشتراك في NexMind. ابدأ مجاناً وارقِ متى شئت." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const tiers = Object.values(TIERS);
  return (
    <div className="relative min-h-screen">
      <MatrixGrid />
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> رجوع
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-center mb-3">خطط NexMind</h1>
        <p className="text-center text-muted-foreground mb-12">
          ابدأ مجاناً. ارقِ خطتك متى احتجت أكثر.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t) => (
            <div
              key={t.id}
              className="relative glass-cell rounded-2xl p-6 flex flex-col"
              style={{
                border: t.highlight
                  ? "1px solid oklch(0.82 0.19 200 / 0.6)"
                  : "1px solid oklch(0.82 0.19 200 / 0.15)",
                boxShadow: t.highlight ? "0 0 30px oklch(0.82 0.19 200 / 0.25)" : undefined,
              }}
            >
              {t.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, var(--cyan), oklch(0.55 0.18 220))",
                    color: "oklch(0.1 0.02 240)",
                  }}
                >
                  الأكثر شعبية
                </div>
              )}
              <div className="text-sm tracking-widest uppercase text-muted-foreground">{t.name}</div>
              <div className="mt-3 mb-1">
                <span className="text-4xl font-bold">{t.pricePerMonth}</span>
                <span className="text-sm text-muted-foreground mr-1">ج/شهر</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} style={{ color: "var(--cyan)" }} className="mt-1 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled={t.id === "free"}
                className="mt-6 w-full py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                style={{
                  background: t.highlight
                    ? "linear-gradient(135deg, var(--cyan), oklch(0.55 0.18 220))"
                    : "color-mix(in oklab, var(--surface) 60%, transparent)",
                  color: t.highlight ? "oklch(0.1 0.02 240)" : "inherit",
                  border: "1px solid oklch(0.82 0.19 200 / 0.2)",
                }}
                onClick={() => {
                  if (t.id !== "free") {
                    alert("الدفع سيُفعَّل قريباً عبر Stripe/Paddle.");
                  }
                }}
              >
                {t.id === "free" ? "الخطة الحالية" : "اشترك الآن"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          * الدفع الفعلي قيد التفعيل. تواصل معنا للاشتراك المبكر.
        </p>
      </div>
    </div>
  );
}
