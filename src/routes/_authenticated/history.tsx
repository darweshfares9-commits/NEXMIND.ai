import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { NexSidebar } from "@/components/nexmind/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { findTool } from "@/lib/tools";
import { MessageSquare, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "NexMind · History" }] }),
  component: HistoryPage,
});

interface Row { id: string; title: string; tool_slug: string; updated_at: string; }

function HistoryPage() {
  const [email, setEmail] = useState<string>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, title, tool_slug, updated_at")
      .order("updated_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  async function remove(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="relative min-h-screen flex">
      <MatrixGrid />
      <NexSidebar email={email} />
      <main className="flex-1 px-6 md:px-12 py-12 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-2">History</h1>
        <p className="text-sm text-muted-foreground mb-8">جميع محادثاتك السابقة محفوظة هنا.</p>

        {loading && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}
        {!loading && rows.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            لا توجد محادثات بعد. <Link to="/hub" className="underline" style={{ color: "var(--cyan)" }}>ابدأ من Galaxy</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
          {rows.map((r) => {
            const tool = findTool(r.tool_slug);
            return (
              <div key={r.id} className="group glass-cell rounded-xl p-4 flex items-start justify-between gap-3"
                style={{ border: "1px solid oklch(0.82 0.19 200 / 0.15)" }}>
                <Link to="/tools/$slug" params={{ slug: r.tool_slug }} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{r.title}</span>
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                    {tool?.label ?? r.tool_slug} · {new Date(r.updated_at).toLocaleDateString()}
                  </div>
                </Link>
                <button onClick={() => remove(r.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
