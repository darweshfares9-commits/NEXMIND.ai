import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/share/$token")({
  head: () => ({ meta: [{ title: "NexMind · Shared Conversation" }] }),
  component: SharePage,
});

interface Msg {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

function SharePage() {
  const { token } = Route.useParams();
  const [title, setTitle] = useState("Conversation");
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    (async () => {
      const { data: share } = await supabase
        .from("shared_conversations")
        .select("conversation_id")
        .eq("token", token)
        .maybeSingle();
      if (!share) { setError("الرابط غير صالح أو محذوف."); return; }

      const { data: conv } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", share.conversation_id)
        .maybeSingle();
      if (conv?.title) setTitle(conv.title);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", share.conversation_id)
        .order("created_at", { ascending: true });
      setMessages(msgs ?? []);
    })();
  }, [token]);

  return (
    <div className="relative min-h-screen">
      <MatrixGrid />
      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">NexMind · Shared</div>
        <h1 className="text-2xl font-semibold mb-8">{title}</h1>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {!error && messages === null && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}

        <div className="space-y-4">
          {messages?.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-4 text-sm leading-relaxed glass-cell ${m.role === "user" ? "" : ""}`}
              style={{
                border: "1px solid oklch(0.82 0.19 200 / 0.15)",
                background: m.role === "user" ? "color-mix(in oklab, var(--cyan) 10%, var(--surface))" : undefined,
              }}
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{m.role}</div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
