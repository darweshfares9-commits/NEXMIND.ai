import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findTool } from "@/lib/tools";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
}

interface Row {
  id: string;
  title: string;
  tool_slug: string;
  updated_at: string;
}

export function HistoryPanel({ open, onClose }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("conversations")
      .select("id, title, tool_slug, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [open]);

  async function remove(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-screen w-80 z-50 transform transition-transform duration-300 border-l flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          borderColor: "oklch(0.82 0.19 200 / 0.15)",
          background: "color-mix(in oklab, var(--surface) 85%, transparent)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b shrink-0" style={{ borderColor: "oklch(0.82 0.19 200 / 0.1)" }}>
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground">History</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && <div className="text-xs text-muted-foreground px-3 py-4">جارٍ التحميل…</div>}
          {!loading && rows.length === 0 && (
            <div className="text-xs text-muted-foreground px-3 py-4 text-center">لا توجد محادثات بعد.</div>
          )}
          {rows.map((r) => {
            const tool = findTool(r.tool_slug);
            return (
              <div
                key={r.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition"
              >
                <Link
                  to="/tools/$slug"
                  params={{ slug: r.tool_slug }}
                  onClick={onClose}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{r.title}</span>
                  </div>
                  <div className="text-[9px] tracking-widest uppercase text-muted-foreground mt-0.5 truncate">
                    {tool?.label ?? r.tool_slug}
                  </div>
                </Link>
                <button
                  onClick={() => remove(r.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
