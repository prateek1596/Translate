import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { translateText } from "@/lib/translation";
import { prisma } from "@/lib/prisma";

const translateRequestSchema = z.object({
  sessionId: z.string().trim().min(1).max(64).optional(),
  text: z.string().trim().min(1).max(8000),
  sourceLanguage: z.string().trim().min(1).max(64),
  targetLanguage: z.string().trim().min(1).max(64),
  provider: z.string().trim().min(1).max(64).optional()
});

export async function POST(request: NextRequest) {
  try {
    const payload = translateRequestSchema.parse(await request.json());
    const startedAt = performance.now();

    const session = payload.sessionId
      ? await prisma.translationSession.upsert({
          where: { id: payload.sessionId },
          update: {
            sourceLang: payload.sourceLanguage,
            targetLang: payload.targetLanguage,
            status: "ACTIVE"
          },
          create: {
            id: payload.sessionId,
            sourceLang: payload.sourceLanguage,
            targetLang: payload.targetLanguage,
            status: "ACTIVE"
          }
        })
      : await prisma.translationSession.create({
          data: {
            sourceLang: payload.sourceLanguage,
            targetLang: payload.targetLanguage,
            status: "ACTIVE"
          }
        });

    const result = await translateText(payload as any);
    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    await prisma.translationMessage.create({
      data: {
        sessionId: session.id,
        sourceText: payload.text,
        translatedText: result.translatedText,
        provider: result.provider,
        sourceLang: payload.sourceLanguage,
        targetLang: payload.targetLanguage,
        latencyMs
      }
    });

    await prisma.translationSession.update({
      where: { id: session.id },
      data: {
        sourceLang: payload.sourceLanguage,
        targetLang: payload.targetLanguage,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      translatedText: result.translatedText,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      provider: result.provider,
      latencyMs
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid translation request",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}