import type { TranslateInput, TranslateOutput } from "@/lib/translation/types";
import { translateWithOpenAI } from "@/lib/translation/openai-provider";

export async function translateText(input: TranslateInput): Promise<TranslateOutput> {
  const provider = input.provider ?? "openai";

  switch (provider) {
    case "openai":
      return translateWithOpenAI(input);
    default:
      // Fallback to OpenAI for unknown providers
      return translateWithOpenAI(input);
  }
}