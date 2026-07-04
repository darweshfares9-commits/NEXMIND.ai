import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createNexMindAi(googleApiKey: string) {
  return createOpenAICompatible({
    name: "google-ai",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    headers: {
      "Authorization": `Bearer ${googleApiKey}`,
    },
  });
}
