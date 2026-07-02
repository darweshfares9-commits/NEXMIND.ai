import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteParticipant } from "livekit-client";
import { MatrixGrid } from "@/components/ops/MatrixGrid";
import { NexSidebar } from "@/components/nexmind/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/live")({
  head: () => ({ meta: [{ title: "NexMind · Live Call" }] }),
  component: LivePage,
});

function LivePage() {
  const [email, setEmail] = useState<string>();
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string>();
  const [participants, setParticipants] = useState<string[]>([]);
  const roomRef = useRef<Room | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
    return () => { void roomRef.current?.disconnect(); };
  }, []);

  async function start() {
    setStatus("connecting");
    setError(undefined);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      const { token: lkToken, url } = await res.json();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
        setParticipants((prev) => [...prev, p.identity]);
      });
      room.on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
        setParticipants((prev) => prev.filter((x) => x !== p.identity));
      });
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio && audioContainerRef.current) {
          const el = track.attach();
          audioContainerRef.current.appendChild(el);
        }
      });
      room.on(RoomEvent.Disconnected, () => setStatus("idle"));

      await room.connect(url, lkToken);
      await room.localParticipant.setMicrophoneEnabled(true);
      setStatus("live");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setStatus("error");
    }
  }

  async function stop() {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setStatus("idle");
    setParticipants([]);
  }

  async function toggleMute() {
    const lp = roomRef.current?.localParticipant;
    if (!lp) return;
    await lp.setMicrophoneEnabled(muted);
    setMuted(!muted);
  }

  return (
    <div className="relative min-h-screen flex">
      <MatrixGrid />
      <NexSidebar email={email} />
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="glass-cell rounded-2xl p-10 max-w-md w-full text-center" style={{ border: "1px solid oklch(0.82 0.19 200 / 0.2)" }}>
          <h1 className="text-2xl font-semibold mb-2">Live Call</h1>
          <p className="text-sm text-muted-foreground mb-8">
            مكالمة صوتية مباشرة عبر LiveKit. الـ AI Agent يجب أن يكون مفعّلاً في حساب LiveKit الخاص بك.
          </p>

          <div className="mb-8">
            <div
              className="mx-auto w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background:
                  status === "live"
                    ? "radial-gradient(circle, oklch(0.78 0.2 145) 0%, oklch(0.45 0.18 280) 100%)"
                    : "radial-gradient(circle, oklch(0.82 0.18 65) 0%, oklch(0.45 0.18 280) 100%)",
                boxShadow:
                  status === "live"
                    ? "0 0 60px oklch(0.78 0.2 145 / 0.6)"
                    : "0 0 30px oklch(0.82 0.18 65 / 0.3)",
                animation: status === "live" ? "pulse 2s ease-in-out infinite" : undefined,
              }}
            >
              <Phone size={42} style={{ color: "oklch(0.1 0.02 240)" }} />
            </div>
            <div className="mt-4 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {status === "idle" && "Ready"}
              {status === "connecting" && "Connecting…"}
              {status === "live" && "● Live"}
              {status === "error" && "Error"}
            </div>
            {participants.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {participants.length} agent(s) connected
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            {status === "live" ? (
              <>
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition"
                  style={{ background: "color-mix(in oklab, var(--surface) 60%, transparent)", border: "1px solid oklch(0.82 0.19 200 / 0.2)" }}
                >
                  {muted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={stop}
                  className="px-6 py-3 rounded-lg flex items-center gap-2 transition"
                  style={{ background: "oklch(0.6 0.22 25)", color: "white" }}
                >
                  <PhoneOff size={16} /> إنهاء
                </button>
              </>
            ) : (
              <button
                onClick={start}
                disabled={status === "connecting"}
                className="px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--cyan), oklch(0.55 0.18 220))",
                  color: "oklch(0.1 0.02 240)",
                }}
              >
                <Phone size={16} /> ابدأ مكالمة
              </button>
            )}
          </div>

          {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
          <div ref={audioContainerRef} className="hidden" />
        </div>
      </main>
    </div>
  );
}
