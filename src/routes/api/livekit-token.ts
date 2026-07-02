// LiveKit access token (HS256 JWT) via Web Crypto — works on Workers/Edge.
import { createFileRoute } from "@tanstack/react-router";

function b64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function signJwt(payload: object, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(enc));
  return `${enc}.${b64url(sig)}`;
}

type Body = { room?: string };

export const Route = createFileRoute("/api/livekit-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.getUser(token);
        if (!u.user) return new Response("Unauthorized", { status: 401 });

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const url = process.env.LIVEKIT_URL;
        if (!apiKey || !apiSecret || !url) {
          return new Response("LiveKit not configured", { status: 500 });
        }

        const body = (await request.json().catch(() => ({}))) as Body;
        const room = body.room || `nexmind-${u.user.id.slice(0, 8)}`;
        const identity = u.user.email ?? u.user.id;
        const now = Math.floor(Date.now() / 1000);

        const payload = {
          iss: apiKey,
          sub: identity,
          nbf: now,
          exp: now + 60 * 60 * 2, // 2 hours
          name: identity,
          video: {
            room,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
          },
        };

        const jwt = await signJwt(payload, apiSecret);
        return Response.json({ token: jwt, url, room, identity });
      },
    },
  },
});
