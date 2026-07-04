import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createNexMindAi(groqApiKey: string) {
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
    },
  });
}