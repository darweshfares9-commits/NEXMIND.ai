import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Send, Mic, Square, Volume2, Download, Share2, Menu } from "lucide-react";
import { toast } from "sonner";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { NexSidebar } from "@/components/nexmind/Sidebar";
import { HistoryPanel } from "@/components/nexmind/HistoryPanel";
import { findTool, CATEGORY_COLOR } from "@/lib/tools";
import { supabase } from "@/integrations/supabase/client";
import { exportConversationToPdf } from "@/lib/export";

export const Route = createFileRoute("/_authenticated/tools/$slug")({
  beforeLoad: ({ params }) => {
    if (!findTool(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const t = findTool(params.slug);
    return { meta: [{ title: t ? `NexMind · ${t.label}` : "NexMind · Tool" }] };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Unknown tool. <Link to="/hub" className="ml-2 underline">Back to Galaxy</Link>
    </div>
  ),
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = findTool(slug)!;
  const Icon = tool.icon;
  const color = CATEGORY_COLOR[tool.category];
  const navigate = useNavigate();

  const [email, setEmail] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [usage, setUsage] = useState<{ used: number; limit: number; tier: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastAssistantSpoken = useRef<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? undefined);
      setUserId(data.user?.id);
    });
  }, []);

  useEffect(() => { refreshUsage(); }, [userId]);

  async function refreshUsage() {
    if (!userId) return;
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: log }, { data: sub }] = await Promise.all([
      supabase.from("usage_logs").select("messages_count").eq("user_id", userId).eq("day", today).maybeSingle(),
      supabase.from("subscriptions").select("tier").eq("user_id", userId).maybeSingle(),
    ]);
    const tier = sub?.tier ?? "free";
    const limit = tier === "free" ? 20 : tier === "starter" ? 100 : tier === "pro" ? 1000 : 5000;
    setUsage({ used: log?.messages_count ?? 0, limit, tier });
  }

  const { messages, sendMessage, status } = useChat({
    id: `tool-${slug}`,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, toolSlug: slug },
      }),
      // Inject bearer
      fetch: async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const tok = data.session?.access_token;
        const headers = new Headers(init?.headers);
        if (tok) headers.set("Authorization", `Bearer ${tok}`);
        const res = await fetch(url, { ...init, headers });
        if (res.status === 429) {
          const j = await res.clone().json().catch(() => ({}));
          toast.error(j.message ?? "تجاوزت الحد اليومي");
        }
        return res;
      },
    }),
    onFinish: async (msg) => {
      refreshUsage();
      // Persist messages
      await persistMessages(msg.message);
      // TTS for last reply
      if (voiceOn && msg.message?.role === "assistant") {
        const txt = extractText(msg.message);
        if (txt && txt !== lastAssistantSpoken.current) {
          lastAssistantSpoken.current = txt;
          speak(txt).catch(console.error);
        }
      }
    },
    onError: (err) => console.error("[chat]", err),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function ensureConversation(): Promise<string | null> {
    if (conversationId) return conversationId;
    if (!userId) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, tool_slug: slug, title: input.slice(0, 50) || tool.label })
      .select("id")
      .single();
    if (error) { console.error(error); return null; }
    setConversationId(data.id);
    return data.id;
  }

  async function persistMessages(latest?: UIMessage) {
    if (!userId || !latest) return;
    const cid = await ensureConversation();
    if (!cid) return;
    const text = extractText(latest);
    if (!text) return;
    await supabase.from("messages").insert({
      conversation_id: cid,
      user_id: userId,
      role: latest.role,
      content: text,
    });
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    // Persist user msg first
    if (userId) {
      const cid = await ensureConversation();
      if (cid) {
        supabase.from("messages").insert({ conversation_id: cid, user_id: userId, role: "user", content: text });
      }
    }
    await sendMessage({ text });
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      audioChunks.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && audioChunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunks.current, { type: rec.mimeType });
        if (blob.size < 1024) { toast.error("التسجيل قصير جداً"); return; }
        await transcribe(blob);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("لم يتم منح صلاحية المايك");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    const { data } = await supabase.auth.getSession();
    const tok = data.session?.access_token;
    const form = new FormData();
    form.append("file", blob, "recording.webm");
    const res = await fetch("/api/stt", {
      method: "POST",
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      body: form,
    });
    if (!res.ok) { toast.error("فشل التفريغ"); return; }
    const j = await res.json();
    setInput((prev) => (prev ? prev + " " : "") + (j.text ?? ""));
    inputRef.current?.focus();
  }

  async function speak(text: string) {
    const { data } = await supabase.auth.getSession();
    const tok = data.session?.access_token;
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
      body: JSON.stringify({ text: text.slice(0, 3000) }),
    });
    if (!res.ok) { toast.error("فشل تشغيل الصوت"); return; }
    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
  }

  async function handleShare() {
    if (!conversationId || !userId) { toast.error("لا توجد محادثة لمشاركتها"); return; }
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const { error } = await supabase
      .from("shared_conversations")
      .insert({ token, conversation_id: conversationId, owner_id: userId });
    if (error) { toast.error("فشل إنشاء الرابط"); return; }
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط المشاركة!");
  }

  function handleExport() {
    const conv = messages.map((m) => ({ role: m.role, content: extractText(m) }));
    exportConversationToPdf(tool.label, conv);
  }

  function loadConversation(id: string) {
    setHistoryOpen(false);
    setConversationId(id);
    navigate({ to: "/tools/$slug", params: { slug }, search: { c: id } as never });
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <MatrixGrid />
      <NexSidebar email={email} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onSelect={loadConversation} />

      <main className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 px-6 flex items-center justify-between border-b shrink-0"
          style={{
            borderColor: "oklch(0.82 0.19 200 / 0.1)",
            background: "color-mix(in oklab, var(--surface) 30%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setHistoryOpen(true)} className="text-muted-foreground hover:text-foreground transition">
              <Menu size={18} />
            </button>
            <Link to="/hub" className="text-muted-foreground hover:text-foreground transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{
                  background: "color-mix(in oklab, var(--surface) 60%, transparent)",
                  border: `1px solid ${color}`,
                  color,
                  boxShadow: `0 0 14px ${color}`,
                }}
              >
                <Icon size={16} />
              </div>
              <div>
                <div className="text-sm font-medium tracking-tight">{tool.label}</div>
                <div className="text-[9px] tracking-[0.3em] text-muted-foreground uppercase">
                  {tool.description}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {usage && (
              <Link
                to="/pricing"
                className="text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-md transition"
                style={{
                  border: "1px solid oklch(0.82 0.19 200 / 0.2)",
                  color: usage.used >= usage.limit ? "oklch(0.7 0.2 25)" : "var(--muted-foreground)",
                }}
              >
                {usage.used}/{usage.limit} · {usage.tier}
              </Link>
            )}
            <button
              onClick={() => setVoiceOn((v) => !v)}
              title="Voice replies"
              className="w-8 h-8 rounded-md flex items-center justify-center transition"
              style={{
                border: "1px solid oklch(0.82 0.19 200 / 0.2)",
                color: voiceOn ? "var(--cyan)" : undefined,
              }}
            >
              <Volume2 size={14} />
            </button>
            {messages.length > 0 && (
              <>
                <button onClick={handleExport} title="Export PDF" className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ border: "1px solid oklch(0.82 0.19 200 / 0.2)" }}>
                  <Download size={14} />
                </button>
                <button onClick={handleShare} title="Share" className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ border: "1px solid oklch(0.82 0.19 200 / 0.2)" }}>
                  <Share2 size={14} />
                </button>
              </>
            )}
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-20">
                Send your first message to start with <span style={{ color }}>{tool.label}</span>.
              </div>
            )}
            {messages.map((m: UIMessage) => (
              <Bubble key={m.id} role={m.role} color={color}>
                <Parts message={m} />
              </Bubble>
            ))}
            {status === "submitted" && (
              <Bubble role="assistant" color={color}>
                <span className="inline-flex gap-1">
                  <Dot /><Dot delay={120} /><Dot delay={240} />
                </span>
              </Bubble>
            )}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="px-4 md:px-12 pb-6 pt-3 border-t shrink-0"
          style={{ borderColor: "oklch(0.82 0.19 200 / 0.1)" }}
        >
          <div className="max-w-3xl mx-auto flex items-end gap-3 glass-cell rounded-xl p-3">
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition shrink-0"
              style={{
                background: recording ? "oklch(0.6 0.22 25)" : "color-mix(in oklab, var(--surface) 60%, transparent)",
                border: "1px solid oklch(0.82 0.19 200 / 0.2)",
                color: recording ? "white" : undefined,
              }}
              title={recording ? "إيقاف التسجيل" : "تسجيل صوتي"}
            >
              {recording ? <Square size={14} /> : <Mic size={16} />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              dir="auto"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              placeholder={`Ask ${tool.label}…`}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm max-h-40"
              style={{ unicodeBidi: "plaintext" }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${color}, oklch(0.4 0.15 280))`,
                color: "oklch(0.1 0.02 240)",
                boxShadow: `0 0 18px ${color}`,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function extractText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function Bubble({ role, color, children }: { role: string; color: string; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        dir="auto"
        className={`max-w-[92%] sm:max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${isUser ? "" : "glass-cell"}`}
        style={
          isUser
            ? {
                background: "color-mix(in oklab, var(--cyan) 18%, var(--surface))",
                border: "1px solid oklch(0.82 0.19 200 / 0.3)",
                unicodeBidi: "plaintext",
              }
            : { borderColor: `${color}`, unicodeBidi: "plaintext" }
        }
      >
        {children}
      </div>
    </div>
  );
}

function Parts({ message }: { message: UIMessage }) {
  const text = extractText(message);
  if (!text) return null;
  if (message.role === "user") return <div dir="auto" className="whitespace-pre-wrap">{text}</div>;
  return (
    <div
      dir="auto"
      className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-li:my-0.5"
      style={{ unicodeBidi: "plaintext" }}
    >
      <ReactMarkdown
        components={{
          p: ({ node: _n, ...props }) => <p dir="auto" {...props} />,
          li: ({ node: _n, ...props }) => <li dir="auto" {...props} />,
          h1: ({ node: _n, ...props }) => <h1 dir="auto" {...props} />,
          h2: ({ node: _n, ...props }) => <h2 dir="auto" {...props} />,
          h3: ({ node: _n, ...props }) => <h3 dir="auto" {...props} />,
          code: ({ node: _n, ...props }) => <code dir="ltr" style={{ unicodeBidi: "isolate" }} {...props} />,
        }}
      >{text}</ReactMarkdown>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
