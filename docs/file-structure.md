# File Structure

```text
Translate/
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── next-env.d.ts
├── .env.example
├── README.md
├── prisma/
│   └── schema.prisma
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── file-structure.md
│   └── ui.md
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── health/route.ts
    │   │   ├── languages/route.ts
    │   │   └── translate/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   └── translator-page.tsx
    ├── hooks/
    │   ├── use-speech-recognition.ts
    │   └── use-speech-synthesis.ts
    ├── lib/
    │   ├── languages.ts
    │   └── translation/
    │       ├── index.ts
    │       ├── openai-provider.ts
    │       └── types.ts
    └── types/
        └── speech-recognition.d.ts
```

The app is intentionally small at the root level so it can evolve into a monorepo later without breaking the current product surface.