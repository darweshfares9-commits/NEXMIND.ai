// Speech-to-Text via Lovable AI Gateway (Whisper-compatible).
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.getUser(token);
        if (!u.user) return new Response("Unauthorized", { status: 401 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof Blob)) return new Response("file required", { status: 400 });

        const upstream = new FormData();
        const ext = ({
          "audio/webm": "webm",
          "audio/mp4": "mp4",
          "audio/mpeg": "mp3",
          "audio/wav": "wav",
        } as Record<string, string>)[file.type.split(";")[0]] ?? "webm";
        upstream.append("file", file, `rec.${ext}`);
        upstream.append("model", "openai/gpt-4o-mini-transcribe");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          return new Response(`STT failed: ${t}`, { status: res.status });
        }
        const json = await res.json();
        return Response.json({ text: json.text ?? "" });
      },
    },
  },
});
