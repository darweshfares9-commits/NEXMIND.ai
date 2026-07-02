import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { NexSidebar } from "@/components/nexmind/Sidebar";
import { BrainHub } from "@/components/nexmind/Brain";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/nexmind-logo.png";

export const Route = createFileRoute("/_authenticated/hub")({
  head: () => ({ meta: [{ title: "NexMind · Galaxy" }] }),
  component: HubPage,
});

function HubPage() {
  const [email, setEmail] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
  }, []);

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <MatrixGrid />
      <NexSidebar email={email} />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-border shrink-0 bg-background/60 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="" width={22} height={22} className="rounded-md shrink-0" />
            <span className="text-sm font-semibold truncate">NexMind</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">/ Home</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </div>
        </header>


        <div className="flex-1 min-h-0">
          <BrainHub />
        </div>
      </main>
    </div>
  );
}
