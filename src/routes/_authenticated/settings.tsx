import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { NexSidebar } from "@/components/nexmind/Sidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "NexMind · Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState<string>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
  }, []);
  return (
    <div className="relative min-h-screen flex">
      <MatrixGrid />
      <NexSidebar email={email} />
      <main className="flex-1 px-12 py-16 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">Account: <span className="text-foreground">{email}</span></p>

        <section className="glass-cell rounded-xl p-6">
          <h2 className="text-sm tracking-[0.3em] text-glow-cyan mb-2" style={{ color: "var(--cyan)" }}>
            AI ENGINE
          </h2>
          <p className="text-sm text-muted-foreground">
            NexMind runs on the built-in Lovable AI Gateway by default (Gemini, GPT, and more — no keys required).
            Bring-your-own-key support for OpenAI / Anthropic / others can be added on request.
          </p>
        </section>
      </main>
    </div>
  );
}
