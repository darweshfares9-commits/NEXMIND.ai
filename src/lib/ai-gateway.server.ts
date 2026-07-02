import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * NexMind AI gateway — routes all model calls through OpenRouter.
 * Server-only. Never import from browser code.
 */
export function createNexMindAi(openRouterApiKey: string) {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      "Authorization": `Bearer ${openRouterApiKey}`,
    },
  });
}
