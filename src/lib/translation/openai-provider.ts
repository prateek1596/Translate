import type { TranslateInput, TranslateOutput } from "@/lib/translation/types";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export async function translateWithOpenAI(input: TranslateInput): Promise<TranslateOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // In local development or CI without OpenAI configured, return a deterministic
    // mock translation so the API remains usable for smoke tests.
    return {
      translatedText: `${input.text} [mock-${input.targetLanguage}]`,
      provider: "mock"
    };
  }

  const model = process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini";
  const prompt = [
    `You are a high-precision translation engine.`,
    `Translate from ${input.sourceLanguage} to ${input.targetLanguage}.`,
    `Return only the translated text with no markdown, no quotes, and no commentary.`,
    `Preserve meaning, names, numbers, and formatting unless translation requires changes.`,
    `If the source language is ambiguous, infer it silently and translate naturally.`
  ].join(" ");

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: input.text }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI translation failed: ${response.status} ${details}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const translatedText = payload.choices?.[0]?.message?.content?.trim();

  if (!translatedText) {
    throw new Error("OpenAI returned an empty translation");
  }

  return {
    translatedText,
    provider: "openai"
  };
}