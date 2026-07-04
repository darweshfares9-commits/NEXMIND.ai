import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createNexMindAi } from "@/lib/ai-gateway.server";
import { findTool } from "@/lib/tools";

type Body = { messages?: unknown; toolSlug?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth: verify the caller from the bearer token
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ")
          ? auth.slice(7)
          : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = userData.user.id;

        // Quota
        const { checkAndIncrementMessageQuota } = await import("@/lib/usage.server");
        const quota = await checkAndIncrementMessageQuota(supabaseAdmin, userId);
        if (!quota.allowed) {
          return new Response(
            JSON.stringify({ error: "quota_exceeded", message: quota.reason, tier: quota.tier }),
            { status: 429, headers: { "content-type": "application/json" } },
          );
        }

        const { messages, toolSlug } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.VITE_GROQ_API_KEY;
            if (!key) return new Response("Missing GROQ_API_KEY", { status: 500 });

        const tool = toolSlug ? findTool(toolSlug) : undefined;
        const IDENTITY = "أنت NexMind، مساعد ذكاء اصطناعي متطور بواسطة المهندس فارس درويش. أجب بدقة ووضوح. استخدم Markdown للتنسيق.";

        const system = `${IDENTITY}\n\n${tool?.systemPrompt ?? "أنت مساعد عام متعدد الاستخدامات."}`;

        const ai = createNexMindAi(key);
        const result = streamText({
          model: ai("llama-3.3-70b-versatile"),
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
