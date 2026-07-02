// ElevenLabs Text-to-Speech (streaming MP3).
import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: string; voiceId?: string };

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.getUser(token);
        if (!u.user) return new Response("Unauthorized", { status: 401 });

        const { text, voiceId } = (await request.json()) as Body;
        if (!text || text.length === 0) return new Response("text required", { status: 400 });
        if (text.length > 4000) return new Response("text too long", { status: 400 });

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) return new Response("ElevenLabs not configured", { status: 500 });

        const voice = voiceId || "EXAVITQu4vr4xnSDxMaL"; // Sarah

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          const err = await upstream.text().catch(() => "");
          return new Response(`TTS failed: ${err}`, { status: upstream.status });
        }

        // Track voice usage (estimate: 15 chars/sec)
        const { bumpVoiceSeconds } = await import("@/lib/usage.server");
        bumpVoiceSeconds(supabaseAdmin, u.user.id, text.length / 15).catch(() => {});

        return new Response(upstream.body, {
          headers: { "Content-Type": "audio/mpeg" },
        });
      },
    },
  },
});
