# SpeakFlow

SpeakFlow is a startup-grade active speech translator MVP. It captures speech in the browser, translates it on the server through a pluggable ML provider, and speaks the translated result back with browser TTS.

## What is included

- Product architecture and deployment notes in `docs/architecture.md`
- API contract in `docs/api.md`
- Database schema in `prisma/schema.prisma` and `docs/database.md`
- Responsive production UI in `src/components/translator-page.tsx`
- Translation API in `src/app/api/translate/route.ts`

Each speaking session is persisted in PostgreSQL through Prisma, with every translated segment stored as an append-only message.

## Run locally

1. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`.
2. Install dependencies.
3. Run `npm run dev`.

The app uses browser speech recognition and speech synthesis, so it works best in Chromium-based browsers.