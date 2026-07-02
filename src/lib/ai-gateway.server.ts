import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * NexMind AI gateway — routes all model calls through Lovable AI Gateway.
 * Server-only. Never import from browser code.
 */
export function createNexMindAi(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
