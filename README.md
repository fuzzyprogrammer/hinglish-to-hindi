# Hinglish ↔ Hindi Converter

Zero-cost, static, bilingual converter at https://hinglish.openpixal.com.
- English site: `/`  ·  Hindi site: `/hi/`
- Tech: Astro 5 (static), Tailwind 4, @indic-transliteration/sanscript, Vitest.
- Engine: `src/lib/transliteration.ts` (client-side; 27 verified fixtures in
  `src/lib/transliteration.test.ts`).

## Commands
```
npm run dev              # local dev server
npm run build            # static build → dist/
npm run preview          # preview dist/ locally
npm run test             # vitest (27 fixtures)
npm run check            # astro check (typecheck + lint)
npm run deploy           # build + deploy to Cloudflare Pages (production)
npm run deploy:preview   # build + deploy to Cloudflare Pages (preview branch)
```

## Agent workflow
Task/workflow agents live in `.opencode/agent/`. Orchestrator judges the QA gates
G1 (English) and G2 (combined) recorded in `docs/GATES.md`.

## Localization
`SITE_URL`, `HI_LIVE`, locales and nav in `src/lib/constants.ts`; UI strings in
`src/lib/i18n.ts`. All absolute URLs derive from `SITE_URL`.
