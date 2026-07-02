import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/nexmind-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexMind — منصة الذكاء الاصطناعي" },
      { name: "description", content: "NexMind — منصة واحدة لكل أدواتك من الذكاء الاصطناعي." },
      { property: "og:title", content: "NexMind" },
      { property: "og:description", content: "منصة واحدة لكل أدواتك من الذكاء الاصطناعي." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) navigate({ to: "/hub", replace: true });
      else setChecking(false);
    });
    return () => { cancelled = true; };
  }, [navigate]);

  if (checking) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="NexMind" width={28} height={28} className="rounded-md" />
          <span className="text-base font-semibold tracking-tight">NexMind</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground px-3 py-1.5">Pricing</Link>
          <Link to="/auth" className="text-muted-foreground hover:text-foreground px-3 py-1.5">Sign in</Link>
          <Link to="/auth" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <img
            src={logo}
            alt="NexMind"
            width={96}
            height={96}
            className="mx-auto mb-8 rounded-2xl shadow-2xl"
            style={{ filter: "drop-shadow(0 0 40px oklch(0.6 0.2 240 / 0.4))" }}
          />
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            منصة واحدة لكل أدواتك.
          </h1>
          <p className="text-base text-muted-foreground mb-8">
            دردشة، صوت، بحث، صور وكود — في مكان واحد.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/auth" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              ابدأ مجاناً
            </Link>
            <Link to="/pricing" className="px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-accent">
              الخطط والأسعار
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-5 text-xs text-muted-foreground flex items-center justify-center gap-4">
        <Link to="/terms" className="hover:text-foreground">شروط الاستخدام</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-foreground">سياسة الخصوصية</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} NexMind</span>
      </footer>
    </div>
  );
}

