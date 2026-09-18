# Hinglish ↔ Hindi Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a zero-cost, static, bilingual (English + Hindi) Hinglish↔Hindi converter tool on Cloudflare Pages at `hinglish.openpixal.com`, optimized for SEO/AI-search discoverability, built and QA-gated English-first then Hindi.

**Architecture:** Astro 5 static output. English is the default locale at `/`, Hindi mirrors the site at `/hi/`. The converter is a zero-framework vanilla TS script island; transliteration uses `@indic-transliteration/sanscript` wrapped in a thin normalization layer (verified fixture corpus, see Task 4). Everything derives URLs from one `SITE_URL` constant. Two QA gates (G1 English-only, G2 combined) gate progression; a `HI_LIVE` flag controls when `/hi/` enters hreflang/sitemap.

**Tech Stack:** Astro 5, Tailwind CSS 4 (`@tailwindcss/vite`), TypeScript strict, Vitest, `@indic-transliteration/sanscript`, `@astrojs/sitemap`, npm, Node ≥ 20.

## Global Constraints

- `SITE_URL = https://hinglish.openpixal.com` — all absolute URLs derive from `src/lib/constants.ts`.
- Locales: `en` at `/`, `hi` at `/hi/`. `<html lang>` matches page locale.
- hreflang: en-IN `/`, hi-IN `/hi/`, x-default `/`. The `hi-IN` alternate is emitted **only when `HI_LIVE = true`**.
- No third-party runtime JS. No ad code. No analytics. Zero-framework island only.
- Transliteration engine is client-side; English and Hindi variants share `src/lib/transliteration.ts` unchanged.
- Every task ends with a commit. Commit messages follow conventional format (`feat:`, `test:`, `fix:`, `chore:`, `docs:`).
- Dev server / preview must be launched via the background-server plugin (see `background-servers.md`), never inline (`npm run preview` after `npm run build`).
- Repo currently has no commits. Scaffolding initializes the git history.
- Node ≥ 20 required. All commands run from repo root.

## Repository Structure

```
/ (repo root)
  .opencode/agent/                    # persistent project agents (Task 2)
    orchestrator.md
    transliteration-engineer.md
    cro-ux-specialist.md
    seo-architect.md
    qa-reviewer.md
  astro.config.mjs                    # static output, site, i18n, sitemap, tailwind vite plugin
  tsconfig.json                       # strict, paths for @/
  package.json
  src/
    styles/global.css                 # tailwind import + dark custom variant
    lib/
      constants.ts                    # SITE_URL, HI_LIVE, LOCALES, keywords, brand, nav
      i18n.ts                         # en/hi UI string dictionaries
      transliteration.ts              # engine (Task 4)
      transliteration.test.ts         # vitest fixtures (Task 4)
    layouts/BaseLayout.astro          # <html lang>, head SEO, hreflang, navbar, footer, theme init
    components/
      Navbar.astro
      Footer.astro
      ThemeToggle.astro
      LangSwitcher.astro
      Converter.astro                 # wrapper markup + bundled <script> island
      FAQ.astro                       # FAQ list + injects FAQPage JSON-LD
    data/
      faq.en.ts                       # FAQ Q&A arrays (both languages)
    pages/
      index.astro                     # en home
      about.astro  contact.astro  privacy-policy.astro  terms.astro
      hi/index.astro  hi/about.astro  hi/contact.astro
      hi/privacy-policy.astro  hi/terms.astro
  public/robots.txt
  docs/
    superpowers/specs/2026-09-18-hinglish-converter-design.md
    GATES.md                          # live evidence log for G1/G2 (Task 9, 12, 13)
    MONETIZATION-GUIDE.md             # AdSense placement doc (Task 13)
  scripts/
    verify-itrans.mjs                 # probe helper used to freeze fixtures (Task 4)
```

---

### Task 1: Scaffold Astro project + config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `public/robots.txt`, `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: working `npm run build` static output; `astro.config.mjs` with `site`, `output: 'static'`, `i18n`, Tailwind vite plugin initialized (imported constants come from Task 3 — config imports are added in Task 3, scaffold Task keeps them minimal but functional).

- [ ] **Step 1: Scaffold Astro into the existing repo root**

Run: `npm create astro@latest -- --template minimal --typescript strict --install --no-git --yes`

Expected: project files created in current dir; `package.json` includes `astro`, `@astrojs/check` (if present in template). This must NOT create a nested folder or init git (root already has git). If the flag set differs on the installed version, run `npm create astro@latest --help` and pass the equivalents of `--template minimal --typescript strict --install --no-git --yes`.

- [ ] **Step 2: Install remaining deps**

Run:
`npm i @indic-transliteration/sanscript`
`npm i -D vitest tailwindcss @tailwindcss/vite @astrojs/sitemap @astrojs/check typescript`

Expected: all six install cleanly; `package.json` gains the six dependencies; `astro check` is runnable.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "astro.config.mjs"]
}
```

- [ ] **Step 4: Write `astro.config.mjs` (minimal for now — Tailwind + sitemap wired, i18n present)**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 5: Write `src/styles/global.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
}

html { scroll-behavior: smooth; }
```

- [ ] **Step 6: Add npm scripts to `package.json`**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "vitest run"
}
```

- [ ] **Step 7: Write `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://hinglish.openpixal.com/sitemap-index.xml
```

- [ ] **Step 8: Baseline build + commit**

Run: `npm run build`
Expected: `dist/` produced at `dist/index.html`, no errors.

```
git add -A
git commit -m "chore: scaffold astro static site with tailwind, sitemap, vitest"
```

---

### Task 2: Project workflow agents

**Files:**
- Create: `.opencode/agent/orchestrator.md`, `.opencode/agent/transliteration-engineer.md`, `.opencode/agent/cro-ux-specialist.md`, `.opencode/agent/seo-architect.md`, `.opencode/agent/qa-reviewer.md`

**Interfaces:**
- Consumes: spec at `docs/superpowers/specs/2026-09-18-hinglish-converter-design.md`
- Produces: five persistent, project-scoped agents that future sessions can dispatch. The `orchestrator` agent is the gate judge for phases A/B.

- [ ] **Step 1: Load the customize-opencode skill**

Load `customize-opencode` (it governs `.opencode/` authoring — frontmatter fields, tools, modes). Follow it for exact file format. Do not guess the schema.

- [ ] **Step 2: Register roles + skills in agent files**

Use this roster (from the spec §3). Each agent file must state: `description`, role, scope, skills it loads, and an explicit `hand-off trigger`. Content templates to write (adapt frontmatter to what `customize-opencode` prescribes):

`.opencode/agent/orchestrator.md`:
```markdown
---
description: Project conductor and phase-gate judge for the Hinglish converter. 
  Sequences all work, versions gates G1/G2, dispatches parallel subagents, 
  merges outputs. Writes no feature code.
---
# orchestrator

## Role
Owns the build order: Phase A (English variant) -> QA gate G1 -> Phase B (Hindi
mirror) -> gate G2 -> release. Uses the plan in docs/superpowers/plans/.

## Skills
Load: dispatching-parallel-agents, subagent-driven-development, executing-plans,
writing-plans, finishing-a-development-branch, verification-before-completion.

## Behavior
- Run first and last in every session. Restore context from GATES.md + git log.
- Dispatch one task per subagent; review between tasks; never fix feature code yourself.
- Gate judgment is mechanical: run the evidence checklist in GATES.md; PASS only
  when every line is verified with real command output.

## Hand-offs
- transliteration-engineer handles Task 4.
- cro-ux-specialist handles Tasks 5-6.
- seo-architect handles Tasks 7-8, 10-11.
- qa-reviewer produces GATES.md evidence for Tasks 9 and 12-13; reports PASS/FAIL only.
```

`.opencode/agent/transliteration-engineer.md`:
```markdown
---
description: Owns the language-neutral transliteration engine (Sanscript wrapper,
  Hinglish normalization, reverse direction) and its verified fixture corpus.
---
# transliteration-engineer

## Scope
src/lib/transliteration.ts + transliteration.test.ts + scripts/verify-itrans.mjs.
The engine is shared by both locales and must never encode UI concern.

## Skills
Load: test-driven-development, systematic-debugging.

## Behavior
- Red-green-refactor. Never change expected fixture values without re-verifying
  against @indic-transliteration/sanscript live output (scripts/verify-itrans.mjs).

## Hand-off trigger
Passes to the orchestrator only when `npm run test` is green with no skips.
```

`.opencode/agent/cro-ux-specialist.md`:
```markdown
---
description: Owns converter UX - mobile-first tool UI, toolbar, toasts, counters,
  theme toggle, unified navbar, degree of responsiveness across locales.
---
# cro-ux-specialist

## Scope
layouts/, components/ (excluding SEO-specific markup owned by seo-architect),
src/pages/* UI copy wiring against src/lib/i18n.ts.

## Skills
Load: frontend-design, impeccable, web-perf.

## Behavior
- Mobile-first (375px) baseline; desktop is a superset. Above-the-fold tool on home.
- No third-party JS; all interactivity is vanilla TS. Accessibility: labels,
  aria-live for counter updates, keyboard-operable toolbar buttons.
- Ask the orchestrator (not the user) before sweeping visual redesigns.

## Hand-off trigger
Both locales render clean at 375px and 1280px, no horizontal scroll, toolbar works.
```

`.opencode/agent/seo-architect.md`:
```markdown
---
description: Owns multilingual SEO - metadata, hreflang, JSON-LD (FAQPage,
  WebApplication, Organization, BreadcrumbList), keyword map, sitemap, robots,
  GEO copy, semantic HTML.
---
# seo-architect

## Scope
BaseLayout head slots, src/data/faq.*.ts, page meta, public/robots.txt,
astro.config sitemap config, GEO/FAQ copy in both locales.

## Skills
None required (authoring). Verifies effects through qa-reviewer.

## Behavior
- Every keyword from the spec §7 map must appear organically in body copy, H1,
  or meta of at least one page per locale.
- hreflang correctness is non-negotiable; when HI_LIVE=false emit en-IN + x-default
  only. Never emit a locale link to a page that does not exist.

## Hand-off trigger
Both locales' metadata/schema/sitemap complete and internally consistent.
```

`.opencode/agent/qa-reviewer.md`:
```markdown
---
description: Hard verification gate. Assembles evidence (real command output +
  browser checks) for gates G1/G2 in docs/GATES.md. Never fixes; reports only.
---
# qa-reviewer

## Scope
docs/GATES.md evidence log; running builds, schema validation, link checks,
Lighthouse (via web-perf), fixture tests.

## Skills
Load: verification-before-completion, code-review, web-perf.

## Behavior
- Never claims PASS without quoted command output. No pass without evidence.
- Reports PASS/FAIL with a blame target (which agent owns the failure) to orchestrator.

## Hand-off trigger
GATES.md updated; final report delivered to orchestrator.
```

- [ ] **Step 3: Commit**

```
git add .opencode/agent
git commit -m "feat: add project workflow agents (orchestrator, translit, cro, seo, qa)"
```

---

### Task 3: Constants and i18n dictionaries

**Files:**
- Create: `src/lib/constants.ts`, `src/lib/i18n.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `SITE_URL: string`, `HI_LIVE: boolean`, `LOCALES = { en: { lang, hreflang, prefix, label, name }, hi: {...} }` (exported as an object with `en`, `hi` keys)
  - `NAV: Array<{ href: { en: string; hi: string }, label: { en: string; hi: string } }>`
  - `KEYWORDS`, `SEO_DEFAULTS` (title/description/og per locale)
  - `UI: Record<'en'|'hi', UiStrings>` — every UI string key used by components

- [ ] **Step 1: Write `src/lib/constants.ts`**

```ts
export const SITE_URL = 'https://hinglish.openpixal.com';

export const HI_LIVE = false; // Task 11 flips true once /hi/ content is complete.

export const LOCALES = {
  en: { lang: 'en', hreflang: 'en-IN', prefix: '', label: 'English', name: 'English' },
  hi: { lang: 'hi', hreflang: 'hi-IN', prefix: '/hi', label: 'हिन्दी', name: 'हिन्दी' },
} as const;

export type LocaleKey = keyof typeof LOCALES;

export const CRUMBS: Record<string, { en: string[]; hi: string[] }> = {
  '/about/': { en: ['About'], hi: ['हमारे बारे में'] },
  '/contact/': { en: ['Contact'], hi: ['संपर्क'] },
  '/privacy-policy/': { en: ['Privacy Policy'], hi: ['गोपनीयता नीति'] },
  '/terms/': { en: ['Terms of Use'], hi: ['उपयोग की शर्तें'] },
};

export function crumbsFor(path: string) {
  const key = path.replace(/^\/hi/, '') || '/';
  return CRUMBS[key] ?? null;
}

export const NAV: Array<{
  href: Record<LocaleKey, string>;
  label: Record<LocaleKey, string>;
}> = [
  { href: { en: '/', hi: '/hi/' }, label: { en: 'Home', hi: 'होम' } },
  { href: { en: '/about/', hi: '/hi/about/' }, label: { en: 'About', hi: 'हमारे बारे में' } },
  { href: { en: '/contact/', hi: '/hi/contact/' }, label: { en: 'Contact', hi: 'संपर्क' } },
  { href: { en: '/privacy-policy/', hi: '/hi/privacy-policy/' }, label: { en: 'Privacy', hi: 'गोपनीयता' } },
  { href: { en: '/terms/', hi: '/hi/terms/' }, label: { en: 'Terms', hi: 'शर्तें' } },
];

Note: pages pass their own literal URL as the `path` prop (e.g. `/`, `/hi/`, `/about/`, `/hi/about/`); these strings must match the final routes created in Tasks 5/7/10.

`SEO_DEFAULTS` and `KEYWORDS` (same file):

```ts
export const KEYWORDS = {
  primary: 'hinglish to hindi,hinglish to hindi converter,hinglish to hindi translation,hinglish to hindi translate,hinglish to hindi google translate',
  typing: 'hinglish typing,hinglish caption generator,hinglish words,hinglish examples',
  reverse: 'hindi to hinglish,hinglish means,hinglish app',
} as const;

export const SEO_DEFAULTS: Record<LocaleKey, {
  title: string; description: string;
}> = {
  en: {
    title: 'Hinglish to Hindi Converter — Type & Get Devanagari Instantly',
    description: 'Free Hinglish to Hindi converter. Type Roman Hinglish like "aap kaise hain" and get instant Devanagari Hindi (आप कैसे हैं). Hindi to Hinglish reverse, copy, listen & WhatsApp share.',
  },
  hi: {
    title: 'हिंग्लिश टू हिंदी कन्वर्टर — तुरंत देवनागरी में टाइप करें',
    description: 'फ्री हिंग्लिश टू हिंदी कन्वर्टर। रोमन हिंग्लिश में टाइप करें और तुरंत देवनागरी हिंदी पाएँ। हिंदी से हिंग्लिश, कॉपी, सुनें और व्हाट्सऐप पर भेजें।',
  },
};
```

- [ ] **Step 2: Write `src/lib/i18n.ts`**

```ts
import type { LocaleKey } from './constants';

export type UiStrings = {
  converterTitle: string;
  inputPlaceholder: string;
  outputLabel: string;
  swapLabel: string;
  copy: string; copied: string;
  clear: string; cleared: string;
  listen: string; stop: string; noVoice: string;
  whatsapp: string;
  words: string; chars: string;
  directionHtoHinglish: string; directionHinglishToHindi: string;
  demoNote: string;
};

export const UI: Record<LocaleKey, UiStrings> = {
  en: {
    converterTitle: 'Hinglish to Hindi Converter',
    inputPlaceholder: 'Type Hinglish here… e.g. aap kaise hain',
    outputLabel: 'Devanagari Hindi output',
    swapLabel: 'Swap direction: Hinglish ⇄ Hindi',
    copy: 'Copy Text', copied: 'Copied to clipboard',
    clear: 'Clear Text', cleared: 'Text cleared',
    listen: 'Listen', stop: 'Stop', noVoice: 'Hindi voice not available in this browser',
    whatsapp: 'Share on WhatsApp',
    words: 'words', chars: 'characters',
    directionHinglishToHindi: 'Hinglish → Hindi', directionHtoHinglish: 'Hindi → Hinglish',
    demoNote: 'Type long vowels doubled (aap, saath, raahul). Common shortcuts like hain, kya, meri are handled automatically.',
  },
  hi: {
    converterTitle: 'हिंग्लिश टू हिंदी कन्वर्टर',
    inputPlaceholder: 'यहाँ हिंग्लिश टाइप करें… जैसे aap kaise hain',
    outputLabel: 'देवनागरी हिंदी आउटपुट',
    swapLabel: 'दिशा बदलें: हिंग्लिश ⇄ हिंदी',
    copy: 'कॉपी करें', copied: 'क्लिपबोर्ड पर कॉपी हुआ',
    clear: 'साफ़ करें', cleared: 'टेक्स्ट साफ़ हुआ',
    listen: 'सुनें', stop: 'रोकें', noVoice: 'इस ब्राउज़र में हिंदी आवाज़ उपलब्ध नहीं है',
    whatsapp: 'व्हाट्सऐप पर भेजें',
    words: 'शब्द', chars: 'अक्षर',
    directionHinglishToHindi: 'हिंग्लिश → हिंदी', directionHtoHinglish: 'हिंदी → हिंग्लिश',
    demoNote: 'लंबे स्वर दो बार लिखें (aap, saath, raahul)। hain, kya, meri जैसे आम शब्द अपने आप ठीक हो जाते हैं।',
  },
};
```

- [ ] **Step 3: Convert config to TS + wire site/i18n/sitemap from constants**

Rename `astro.config.mjs` → `astro.config.ts` (Astro loads `.ts` configs and this lets it import the TS constants directly). Then write:

```ts
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, HI_LIVE } from './src/lib/constants';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: HI_LIVE ? undefined : (page) => !page.includes('/hi/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
```

Update `tsconfig.json` include list to `["src/**/*", "astro.config.ts"]`. Verify `npm run build` still passes.

- [ ] **Step 4: Typecheck + test + build + commit**

Run: `npm run check`, `npm run test` (unused for now, must not fail), `npm run build`
Expected: all green; `sitemap-index.xml` in `dist/`.

```
git add astro.config.mjs src/lib
git commit -m "feat: add site constants, i18n dictionaries, sitemap hookup"
```

---

### Task 4: Transliteration engine (TDD)

**Files:**
- Create: `scripts/verify-itrans.mjs`, `src/lib/transliteration.ts`, `src/lib/transliteration.test.ts`

**Interfaces:**
- Consumes: `@indic-transliteration/sanscript`
- Produces:
  - `hinglishToHindi(text: string): string`
  - `hindiToHinglish(text: string): string`
  - `FWD_OVERRIDES: Readonly<Record<string, string>>`, `REV_OVERRIDES: Readonly<Record<string, string>>` (exported for tests)

- [ ] **Step 1: Write the failing test fixture file**

`src/lib/transliteration.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { hinglishToHindi, hindiToHinglish } from './transliteration';

const fwd: Array<[string, string]> = [
  ['aap kaise hain', 'आप कैसे हैं'],
  ['tum kya kar rahe ho', 'तुम क्या कर रहे हो'],
  ['namaste', 'नमस्ते'],
  ['dil', 'दिल'],
  ['bahut sundar', 'बहुत सुन्दर'],
  ['kaun ho tum', 'कौन हो तुम'],
  ['mujhe aana hai', 'मुझे आना है'],
  ['main theek hoon', 'मैं ठीक हूँ'],
  ['yeh kaam karo', 'यह काम करो'],
  ['kyun', 'क्यों'],
  ['mera ghar hai', 'मेरा घर है'],
  ['sab kuch thik hai', 'सब कुछ ठीक है'],
];

const rev: Array<[string, string]> = [
  ['आप कैसे हैं', 'aap kaise hain'],
  ['तुम क्या कर रहे हो', 'tum kya kar rahe ho'],
  ['नमस्ते', 'namaste'],
  ['दिल', 'dil'],
  ['हिंदी', 'hindi'],
  ['मेरी मम्मी', 'meri mammi'],
  ['क्यों', 'kyon'],
  ['प्रेम', 'prem'],
  ['नहीं', 'nahin'],
  ['मैं', 'main'],
  ['कहाँ', 'kahan'],
  ['यह', 'yeh'],
  ['वह', 'woh'],
  ['हूँ', 'hoon'],
  ['श्री गणेश', 'shri gaNesh'],
];

describe('hinglishToHindi', () => {
  it.each(fwd)('converts %s', (inp, exp) => {
    expect(hinglishToHindi(inp)).toBe(exp);
  });
});

describe('hindiToHinglish', () => {
  it.each(rev)('romanizes %s', (inp, exp) => {
    expect(hindiToHinglish(inp)).toBe(exp);
  });
});
```

Expected to FAIL: `Cannot find module './transliteration'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: test file error, module missing.

- [ ] **Step 3: Write `scripts/verify-itrans.mjs`** (ground-truth probe — run against the library to re-confirm fixtures whenever a fixture is questioned)

```js
import Sanscript from '@indic-transliteration/sanscript';

const cases = ['aap kaise hain', 'kya', 'dil', 'kyoM', 'hiMdI', 'haiM'];
for (const c of cases) {
  console.log(c, '=>', Sanscript.t(c, 'itrans', 'devanagari'));
  console.log(c, '=>', Sanscript.t(c, 'devanagari', 'itrans'));
}
```

- [ ] **Step 4: Write the minimal engine**

`src/lib/transliteration.ts`:

```ts
import Sanscript from '@indic-transliteration/sanscript';

export const FWD_OVERRIDES: Readonly<Record<string, string>> = {
  hain: 'हैं', kya: 'क्या', main: 'मैं', theek: 'ठीक', thik: 'ठीक', hoon: 'हूँ',
  yeh: 'यह', kyun: 'क्यों', kyu: 'क्यों', kyon: 'क्यों', mera: 'मेरा', meri: 'मेरी',
  mere: 'मेरे', tera: 'तेरा', teri: 'तेरी', humara: 'हमारा', tumhara: 'तुम्हारा',
  kahan: 'कहाँ', nahi: 'नहीं', nahin: 'नहीं', sab: 'सब', kuch: 'कुछ', aana: 'आना',
  chahiye: 'चाहिए', roti: 'रोटी', achha: 'अच्छा', achcha: 'अच्छा', asan: 'आसान',
};

export const REV_OVERRIDES: Readonly<Record<string, string>> = {
  कहाँ: 'kahan', यह: 'yeh', वह: 'woh',
};

const HINGLISH_WORD = /^([a-zA-Z]+)([^a-zA-Z]*)$/;

export function hinglishToHindi(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (/^[A-Z][a-z]*$/.test(token)) return token; // proper-noun heuristic: keep English
      const m = token.match(HINGLISH_WORD);
      if (!m) return token;
      const [, word, trail] = m;
      const t = word.toLowerCase();
      if (FWD_OVERRIDES[t]) return FWD_OVERRIDES[t] + trail;
      const dev = Sanscript.t(t, 'itrans', 'devanagari');
      return dev.replace(/\u094D$/, '') + trail; // drop trailing halant (U+094D)
    })
    .join('');
}

function romanizeWord(w: string): string {
  if (REV_OVERRIDES[w]) return REV_OVERRIDES[w];
  let s = Sanscript.t(w, 'devanagari', 'itrans');
  s = s.replace(/\.N/g, 'n');              // chandrabindu remnant ँ
  s = s.replace(/M/g, (mx, off) => (/[pPbB]/.test(s[off + 1] || '') ? 'm' : 'n')); // ं
  s = s.replace(/A/g, 'aa').replace(/I/g, 'i').replace(/U/g, 'oo');
  return s.replace(/a$/, '');              // drop final schwa
}

export function hindiToHinglish(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => (/^\s+$/.test(token) ? token : romanizeWord(token)))
    .join('');
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npm run test`
Expected: 27/27 pass (12 fwd + 15 rev), no failures.

- [ ] **Step 6: Commit**

```
git add src/lib/transliteration.ts src/lib/transliteration.test.ts scripts/verify-itrans.mjs
git commit -m "feat: transliteration engine with normalized Hinglish handling"
```

---

### Task 5: Base layout, navbar, footer, theme, language switcher (EN shell)

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`, `src/components/LangSwitcher.astro`
- Modify: `src/styles/global.css` (unused beyond Task 1)

**Interfaces:**
- Consumes: `UI`, `LOCALES`, `SITE_URL`, `HI_LIVE`, `NAV`, `SEO_DEFAULTS` from `src/lib/constants.ts`/`i18n.ts`
- Produces:
  - `BaseLayout` props: `locale: LocaleKey`, `path: string` (the page's own URL, e.g. `/` or `/hi/` or `/about/`), `title?: string`, `description?: string`. Renders `<html lang>`, meta/og/twitter, hreflang (en-IN + hello `hi-IN` when `HI_LIVE`, + x-default), navbar, main slot, footer, inline theme-init script.
  - `LangSwitcher` renders `/` ⇄ `/hi/` links with active state.

- [ ] **Step 1: Write `ThemeToggle.astro`** (class-based dark mode, no flash)

```astro
---
---
<button id="theme-toggle" type="button" aria-label="Toggle dark mode"
  class="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
  <svg id="icon-sun" class="hidden h-4 w-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>
  <svg id="icon-moon" class="hidden h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
</button>
<script>
  const btn = document.getElementById('theme-toggle');
  btn?.addEventListener('click', () => {
    const next = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  });
</script>
```

- [ ] **Step 2: Write `LangSwitcher.astro`**

```astro
---
import { LOCALES } from '../lib/constants';
const { locale } = Astro.props;
const other = locale === 'en' ? 'hi' : 'en';
const href = other === 'en' ? '/' : '/hi/';
---
<nav aria-label="Language" class="flex items-center gap-1 text-sm">
  <a href={href} class="rounded-md border border-slate-300 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
    {LOCALES[other].label}
  </a>
</nav>
```

- [ ] **Step 3: Write `Navbar.astro`** (unified across pages; mobile-first compact row)

```astro
---
import { NAV, LOCALES } from '../lib/constants';
import LangSwitcher from './LangSwitcher.astro';
import ThemeToggle from './ThemeToggle.astro';
const { locale, path } = Astro.props;
---
<nav class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
  <a href={locale === 'en' ? '/' : '/hi/'} class="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
    <span class="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs text-white">हि</span>
    <span>Hinglish<span class="text-indigo-600">To</span>Hindi</span>
  </a>
  <div class="hidden items-center gap-4 text-sm text-slate-600 md:flex dark:text-slate-300">
    {NAV.map((item) => (
      <a href={item.href[locale]} class:list={[{ 'font-semibold text-indigo-600 dark:text-indigo-400': path === item.href[locale] }, 'hover:text-slate-900 dark:hover:text-white']}>
        {item.label[locale]}
      </a>
    ))}
  </div>
  <div class="flex items-center gap-2">
    <LangSwitcher locale={locale} />
    <ThemeToggle locale={locale} />
  </div>
</nav>
```

- [ ] **Step 4: Write `Footer.astro`**

```astro
---
const { locale } = Astro.props;
const year = new Date().getFullYear();
---
<footer class="mt-12 border-t border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
  <p>© {year} HinglishToHindi · <a class="underline" href={locale === 'en' ? '/privacy-policy/' : '/hi/privacy-policy/'}>{locale === 'en' ? 'Privacy' : 'गोपनीयता'}</a></p>
</footer>
```

- [ ] **Step 5: Write `BaseLayout.astro`** (SEO head + hreflang + theme init)

```astro
---
import { SITE_URL, HI_LIVE, SEO_DEFAULTS } from '../lib/constants';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  locale: 'en' | 'hi';
  path: string; // this page's URL, e.g. '/', '/hi/', '/about/'
  title?: string;
  description?: string;
}
const { locale, path, title, description } = Astro.props;
const meta = SEO_DEFAULTS[locale];
const canonical = `${SITE_URL}${path}`;
---
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title ?? meta.title}</title>
    <meta name="description" content={description ?? meta.description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang="en-IN" href={`${SITE_URL}/`} />
    {HI_LIVE && <link rel="alternate" hreflang="hi-IN" href={`${SITE_URL}/hi/`} />}
    <link rel="alternate" hreflang="x-default" href={`${SITE_URL}/`} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title ?? meta.title} />
    <meta property="og:description" content={description ?? meta.description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:locale" content={locale === 'en' ? 'en_IN' : 'hi_IN'} />
    <link rel="icon" href="/favicon.svg" />
    <script is:inline>
      (function () {
        var t = localStorage.getItem('theme');
        if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      })();
    </script>
  </head>
  <body class="min-h-screen bg-white text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
    <header><Navbar locale={locale} path={path} /></header>
    <main><slot /></main>
    <Footer locale={locale} />
  </body>
</html>
```

- [ ] **Step 6: Write a placeholder home page that compiles the shell**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { UI } from '../lib/i18n';

const strings = UI.en;
---
<BaseLayout locale="en" path="/">
  <section class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="text-2xl font-bold sm:text-3xl">{strings.converterTitle}</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-300">Converter mounts in Task 6.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 7: Build, typecheck, commit**

Run: `npm run check && npm run build`
Expected: clean; home page renders; dark mode toggle flips `dark` class.

```
git add -A
git commit -m "feat: base layout shell with navbar, footer, theme toggle, language switcher"
```

---

### Task 6: Converter island — tool, toolbar, toasts, counters, TTS, WhatsApp (EN)

**Files:**
- Create: `src/components/Converter.astro`

**Interfaces:**
- Consumes: `hinglishToHindi`, `hindiToHinglish`, `UI`, `LOCALES`
- Produces: works on `index.astro` (both locales later) — self-contained; no exported API

- [ ] **Step 1: Write `Converter.astro`** (zero-framework island: static markup + bundled module script)

```astro
---
import { UI } from '../lib/i18n';
const { locale } = Astro.props;
const s = UI[locale];
const dirAttr = locale === 'hi' ? 'hi' : 'ltr';
---
<div data-converter data-locale={locale} dir={dirAttr} class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="text-lg font-semibold">{s.converterTitle}</h2>
    <button id="swap-btn" type="button" class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
      {s.directionHinglishToHindi}
    </button>
  </div>
  <textarea
    id="input-area"
    rows="6"
    aria-label={s.inputPlaceholder}
    placeholder={s.inputPlaceholder}
    class="mt-3 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"></textarea>
  <output id="output-area" aria-label={s.outputLabel}
    class="mt-3 block min-h-28 rounded-lg bg-indigo-50 p-3 text-lg leading-9 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100"></output>
  <div id="metrics" class="mt-2 text-xs text-slate-500 dark:text-slate-400">0 {s.words} · 0 {s.chars}</div>
  <div class="mt-3 flex flex-wrap gap-2">
    <button id="copy-btn" type="button" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">{s.copy}</button>
    <button id="clear-btn" type="button" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{s.clear}</button>
    <button id="listen-btn" type="button" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{s.listen}</button>
    <a id="wa-btn" href="https://wa.me/?text=" target="_blank" rel="noopener noreferrer"
      class="rounded-md border border-emerald-500 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">{s.whatsapp}</a>
  </div>
  <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">{s.demoNote}</p>
  <div id="toast" role="status" class="pointer-events-none fixed inset-x-0 bottom-6 z-50 hidden justify-center">
    <span class="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"></span>
  </div>
</div>
<script>
  import { UI } from '../lib/i18n';
  import { hinglishToHindi, hindiToHinglish } from '../lib/transliteration';

  const root = document.querySelector('[data-converter]') as HTMLElement;
  if (root) {
    const locale = root.dataset.locale === 'hi' ? 'hi' : 'en';
    const s = UI[locale];
    const inputEl = document.getElementById('input-area') as HTMLTextAreaElement;
    const outputEl = document.getElementById('output-area') as HTMLOutputElement;
    const metricsEl = document.getElementById('metrics') as HTMLElement;
    const swapBtn = document.getElementById('swap-btn') as HTMLButtonElement;
    const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const listenBtn = document.getElementById('listen-btn') as HTMLButtonElement;
    const waBtn = document.getElementById('wa-btn') as HTMLAnchorElement;
    const toast = document.getElementById('toast') as HTMLElement;

    let mode: 'hl' | 'h2h' = 'h2h';

    const toastTimer = (ms = 1600) => {
      toast.classList.remove('hidden');
      return setTimeout(() => toast.classList.add('hidden'), ms);
    };
    const showToast = (msg: string) => {
      (toast.querySelector('span') as HTMLSpanElement).textContent = msg;
      toastTimer();
    };
    const render = () => {
      const raw = inputEl.value;
      const out = mode === 'h2h' ? hinglishToHindi(raw) : hindiToHinglish(raw);
      outputEl.textContent = out;
      const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
      metricsEl.textContent = `${words} ${s.words} · ${raw.length} ${s.chars}`;
      waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(out || raw);
    };
    inputEl.addEventListener('input', render);
    swapBtn.addEventListener('click', () => {
      mode = mode === 'h2h' ? 'hl' : 'h2h';
      swapBtn.textContent = mode === 'h2h' ? s.directionHinglishToHindi : s.directionHtoHinglish;
      render();
    });
    copyBtn.addEventListener('click', async () => {
      const text = outputEl.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast(s.copied);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast(s.copied);
      }
    });
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      render();
      showToast(s.cleared);
    });
    listenBtn.addEventListener('click', () => {
      const u = new SpeechSynthesisUtterance(outputEl.textContent || '');
      u.lang = 'hi-IN';
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('hi'));
        if (voices.length) u.voice = voices[0];
        if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
        speechSynthesis.speak(u);
      } else {
        showToast(s.noVoice);
      }
    });
    render();
  }
</script>
```

- [ ] **Step 2: Mount converter on the EN home page**

Replace `src/pages/index.astro` content with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Converter from '../components/Converter.astro';
---
<BaseLayout locale="en" path="/">
  <section class="mx-auto max-w-3xl px-4 pt-6">
    <Converter locale="en" />
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build + manual smoke of the island**

Run: `npm run build && npm run preview`
Verify in a browser at the preview URL (via background-server plugin):
- Typing `aap kaise hain` live-converts to `आप कैसे हैं`.
- Copy shows toast; Clear empties both panes; Listen utters (or shows fallback toast when unsupported); WhatsApp link carries the Devanagari text; word/char counts update live.
- Swap to Hindi→Hinglish; typing Devanagari `आप कैसे हैं` yields `aap kaise hain`.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: converter island with toolbar, toasts, counters, TTS, whatsapp share"
```

---

### Task 7: English content pages (About, Contact, Privacy, Terms)

**Files:**
- Create: `src/pages/about.astro`, `src/pages/contact.astro`, `src/pages/privacy-policy.astro`, `src/pages/terms.astro`

**Interfaces:**
- Consumes: `BaseLayout`
- Produces: four routes under `/`; navbar links all resolve.

- [ ] **Step 1: Write `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout locale="en" path="/about/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">About Hinglish to Hindi Converter</h1>
    <p>Hinglish is the everyday blend of English and Hindi used across Indian chats, captions and social media. This hinglish to hindi converter decodes that Roman-script Hinglish into standard Devanagari Hindi — instantly, on your device, with no data leaving your browser.</p>
    <p>It also works in reverse: paste Devanagari Hindi and get readable Hinglish roman text, ideal for captions, messages and notes.</p>
    <p>Because conversion runs fully client-side, the tool is fast, free and private.</p>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Write `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout locale="en" path="/contact/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">Contact</h1>
    <p>Found a conversion error, or have feedback on the hinglish to hindi converter? Email us at
      <a class="text-indigo-600 underline" href="mailto:hello@hinglish.openpixal.com">hello@hinglish.openpixal.com</a>.
      Share the Hinglish text that failed and the Devenagari you expected.</p>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/privacy-policy.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout locale="en" path="/privacy-policy/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">Privacy Policy</h1>
    <p><strong>What we collect:</strong> nothing. This is a static website. Text you type is converted in your own browser via JavaScript; it is never uploaded, stored or processed on a server.</p>
    <p><strong>Local storage:</strong> we store only your chosen dark/light theme preference in your browser's localStorage.</p>
    <p><strong>Third parties:</strong> at launch the site loads no third-party scripts. If advertising or analytics are added later, this policy will be updated.</p>
    <p><strong>Contact:</strong> hello@hinglish.openpixal.com</p>
  </article>
</BaseLayout>
```

- [ ] **Step 4: Write `src/pages/terms.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout locale="en" path="/terms/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">Terms of Use</h1>
    <p>Free to use for any purpose. The hinglish to hindi converter is provided "as is" without warranty; phonetic transliteration may occasionally differ from standard spelling for ambiguous Hinglish input.</p>
    <p>You may not resell or repackage the service or its output as a competing product.</p>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Build, click through nav, commit**

Run: `npm run build`
Expected: 5 routes under `/`; every navbar link resolves to a real page (200), none 404.

```
git add -A
git commit -m "feat: english content pages (about, contact, privacy, terms)"
```

---

### Task 8: English SEO — FAQ, GEO copy, JSON-LD, publish check

**Files:**
- Create: `src/data/faq.en.ts`, `src/components/FAQ.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout`, `Converter`, `UI`
- Produces: `FAQ_ITEMS` array; `FAQ.astro` renders list + injects `FAQPage` JSON-LD; homepage now contains the full FAQ + GEO block + `WebApplication` JSON-LD.

- [ ] **Step 1: Write `src/data/faq.en.ts`**

```ts
export type FaqItem = { q: string; a: string };

export const FAQ_ITEMS: FaqItem[] = [
  { q: 'What is a Hinglish to Hindi converter?', a: 'It is a specialized tool that takes Roman script Hinglish (e.g., "aap kaise ho") and instantly converts it into standard Devanagari Hindi script (e.g., "आप कैसे हैं").' },
  { q: 'How does Hinglish typing work?', a: 'You type Hindi words phonetically using a standard English QWERTY keyboard, and the converter maps your keystrokes directly into Hindi characters without requiring a traditional Hindi keyboard layout.' },
  { q: 'Can I translate Hindi back into Hinglish?', a: 'Yes, the tool supports bidirectional conversion, allowing you to switch native Devanagari Hindi text back into readable Roman Hinglish text seamlessly.' },
  { q: 'What is Hinglish?', a: 'Hinglish is the hybrid blending of English vocabulary and Hindi syntax commonly used in digital communication, text messaging, and social media across India.' },
  { q: 'Hinglish kya hota hai?', a: 'Hinglish Hindi aur English ka ek aisa mishran hai jiska upyog hum chat, social media aur aam bolchal mein text likhne ke liye karte hain.' },
  { q: 'Why use a Hinglish to Hindi tool instead of standard translation?', a: 'Standard translators look for strict language boundaries, whereas a dedicated Hinglish tool specifically decodes phonetic spelling, slang, and casual phrasing unique to the Indian digital ecosystem.' },
];
```

- [ ] **Step 2: Write `src/components/FAQ.astro`**

```astro
---
import type { FaqItem } from '../data/faq.en';
interface Props { faq: FaqItem[]; heading: string; }
const { faq, heading } = Astro.props;
const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
---
<section id="faq" class="mx-auto mt-12 max-w-3xl px-4">
  <h2 class="text-xl font-bold">{heading}</h2>
  {faq.map((f) => (
    <details class="group mt-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <summary class="cursor-pointer font-medium">{f.q}</summary>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
    </details>
  ))}
  <script is:inline type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
</section>
```

- [ ] **Step 3: Rewrite `src/pages/index.astro`** (tool + GEO copy + FAQ + WebApplication JSON-LD)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Converter from '../components/Converter.astro';
import FAQ from '../components/FAQ.astro';
import { FAQ_ITEMS } from '../data/faq.en';

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Hinglish to Hindi Converter',
  url: 'https://hinglish.openpixal.com/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
};
---
<BaseLayout locale="en" path="/">
  <section class="mx-auto max-w-3xl px-4 pt-6">
    <h1 class="text-2xl font-bold sm:text-3xl">Hinglish to Hindi Converter</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      Type Roman Hinglish and get instant Devanagari. A free hinglish to hindi
      translate tool with reverse <strong>hindi to hinglish</strong> — no account, no upload, works offline.
    </p>
    <div class="mt-4"><Converter locale="en" /></div>
  </section>

  <article id="gee" class="mx-auto mt-12 max-w-3xl px-4">
    <h2 class="text-xl font-bold">Hinglish Transliteration vs Translation</h2>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      Transliteration maps sounds from one script to another (Roman <em>kya</em> to Devanagari
      <em>क्या</em>); translation converts meaning between languages. This tool is a
      transliteration engine for Hinglish — it preserves pronunciation so Hindi readers see
      familiar words, and it keeps a one-to-one script mapping that translation engines lose.
      Hinglish words like hain, hai, kya and meri are normalized automatically; ambiguous or
      Western words pass through unchanged.
    </p>
  </article>

  <FAQ faq={FAQ_ITEMS} heading="Frequently Asked Questions" />

  <script is:inline type="application/ld+json" set:html={JSON.stringify(appJsonLd)} />
</BaseLayout>
```

- [ ] **Step 4a: Keyword-coverage — embed remaining spec §7 keywords into homepage and About copy**

The homepage GEO article and the About page (from Task 7) must contain all spec §7 keywords organically. Paste this text into the `<article id="gee">` on `src/pages/index.astro` to replace the existing block:

```html
  <article id="gee" class="mx-auto mt-12 max-w-3xl px-4">
    <h2 class="text-xl font-bold">Hinglish Transliteration vs Translation</h2>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      Transliteration maps sounds from one script to another (Roman <em>kya</em> to Devanagari
      <em>क्या</em>); translation converts meaning between languages. This free
      <strong>hinglish to hindi converter</strong> is a phonetic mapping tool — it treats
      <strong>hinglish typing</strong> as a direct transliteration from Roman to Devanagari
      (similar to <strong>Hinglish typing (Devanagari input)</strong> apps you may know),
      so your familiar <strong>hinglish words</strong> and <strong>hinglish examples</strong>
      like "aap kaise hain" appear as "आप कैसे हैं".
    </p>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      Think of this as your own <strong>hinglish caption generator</strong>: type casually,
      get Devanagari. Use the reverse to go from <strong>hindi to hinglish</strong>. This
      is a dedicated <strong>hinglish to hindi translation</strong> / <strong>translate</strong>
      tool — not a Google Translate clone (that's why people call this a
      <strong>hinglish to hindi google translate</strong> alternative).
    </p>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      <strong>Hinglish</strong> means a natural mix of Hindi and English; the <strong>hinglish
      app</strong> you're looking at has no app store, no data collection, just a lightweight
      client-side engine.
    </p>
  </article>
```

Also enrich `src/pages/about.astro` (from Task 7) with one sentence containing the remaining phrases:

```html
<p class="mt-2 text-slate-600 dark:text-slate-300">
  Whether you're typing a <strong>hinglish caption generator</strong> note, a <strong>hinglish
  typing (Devanagari input)</strong> practice sheet, or just want to see <strong>hinglish to hindi
  translation</strong> examples — this tool is purpose-built for those workflows, not a generic
  Google Translate.
</p>
```

Rebuild and run the grep in Step 5 again; paste the updated output into `docs/GATES.md` as evidence.

Add two JSON-LD blocks to `src/layouts/BaseLayout.astro` in the `<head>` (after the existing meta tags, before the theme-init script). Import `CRUMBS` and `SITE_URL`. The BreadcrumbList is emitted only for non-home pages (when `path` matches a key in `CRUMBS`).

```astro
---
import { SITE_URL, SEO_DEFAULTS, crumbsFor } from '../lib/constants';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  locale: 'en' | 'hi';
  path: string; // this page's URL, e.g. '/', '/hi/', '/about/'
  title?: string;
  description?: string;
}
const { locale, path, title, description } = Astro.props;
const meta = SEO_DEFAULTS[locale];
const canonical = `${SITE_URL}${path}`;
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HinglishToHindi',
  url: SITE_URL,
};
const crumbs = crumbsFor(path);
const breadcrumbJsonLd = crumbs ? {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'होम', item: SITE_URL },
    ...crumbs[locale].map((name, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: `${SITE_URL}${path}`,
    })),
  ],
} : null;
---
<html lang={locale}>
  <head>
    ...
    <script is:inline type="application/ld+json" set:html={JSON.stringify(orgJsonLd)} />
    {breadcrumbJsonLd && <script is:inline type="application/ld+json" set:html={JSON.stringify(breadcrumbJsonLd)} />}
    ...
  </head>
  ...
</html>
```

Update the existing `<head>` body in `BaseLayout.astro` to include these two blocks (replace the placeholder `...` lines with the full set of tags). Build passes.

- [ ] **Step 5: Keyword-coverage grep**

Run:
`npm run build`
`npx rg -l "hinglish to hindi|hinglish to hindi converter|hindi to hinglish|hinglish typing|hinglish caption generator|hinglish words|hinglish examples|hinglish app|hinglish means|hinglish to hindi translation|hinglish to hindi translate|hinglish to hindi google translate"`
Expected: matches in `dist/index.html`, `dist/about/index.html`, `dist/privacy-policy/index.html`, `dist/terms/index.html`. Paste the grep count/output into `docs/GATES.md` as evidence.

Also verify Hindi pages carry `हिंग्लिश टू हिंदी`:
`npx rg -l "हिंग्लिश टू हिंदी" dist/hi`
Expected: matches in `dist/hi/index.html`, `dist/hi/about/index.html`, `dist/hi/privacy-policy/index.html`, `dist/hi/terms/index.html`. Paste as evidence.

- [ ] **Step 6: Verify JSON-LD validity**

Run: `npm run build`, then open `dist/index.html` and validate both `application/ld+json` blocks (FAQPage + WebApplication) in a JSON-LD validator (e.g., validator.schema.org). Both parse with zero errors.

- [ ] **Step 7: Commit**

```
git add -A
git commit -m "feat: faq page schema, geo copy, webapplication json-ld"
```

---

### Task 9: QA gate G1 — English variant evidence

**Files:**
- Create: `docs/GATES.md`

**Interfaces:**
- Consumes: running site (build + preview), fixture tests
- Produces: documented PASS/FAIL for G1; orchestrator decides on real evidence.

- [ ] **Step 1: Write `docs/GATES.md` skeleton with the G1 checklist**

```markdown
# QA Gates

## Gate G1 — English variant release
Status: PENDING

- [ ] `npm run build` clean (paste output tail)
- [ ] `npm run test` 27/27 (paste output tail)
- [ ] `/` renders and converter live-converts `aap kaise hain` → `आप कैसे हैं`
      (paste browser note)
- [ ] Copy / Clear / Listen / WhatsApp / counters work (paste note per control)
- [ ] hreflang present in `/` head: en-IN + x-default only, NO hi-IN
      (paste the <head> slice)
- [ ] JSON-LD parse with zero errors: FAQPage, WebApplication, Organization, BreadcrumbList (only on subpages)
- [ ] `/hi/` placeholder route: switcher link returns 200 (not 404)
- [ ] Lighthouse mobile ≥ 90 on Performance, SEO, Accessibility (paste audit summary)
- [ ] 375px viewport: no horizontal scroll; no CLS from toolbar
      (paste Lighthouse mobile CLS or manual note)
- [ ] Lighthouse mobile ≥ 90 on Performance, SEO, Accessibility on both locales (paste summary)
      (paste Lighthouse mobile CLS or manual note)
```

- [ ] **Step 2: Run every check, paste real output into `docs/GATES.md`**

Run: `npm run test`, `npm run build`, `npm run preview` (background plugin), then the browser checks.

For the `/hi/` placeholder step: create `src/pages/hi/index.astro` in **this task** (it is required by G1 gate 7):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { UI } from '../../lib/i18n';
---
<BaseLayout locale="hi" path="/hi/">
  <section class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h1 class="text-xl font-bold">{s.converterTitle}</h1>
    <p class="mt-3 text-slate-600 dark:text-slate-300">हिंदी संस्करण जल्द आ रहा है।</p>
  </section>
</BaseLayout>
```

Commit this placeholder page separately: `feat: hindi placeholder route (phase A)`. Add it to the GATES file, deliver evidence, and commit `docs: gate g1 evidence`.

- [ ] **Step 3: Orchestrator decision**

If any G1 line fails, route the failure to the owning agent (Task numbers above), fix, re-run G1. Only when every line has evidence set `Status: PASS`.

---

### Task 10: Hindi mirror — full content in Hindi

**Files:**
- Create: `src/data/faq.hi.ts`, `src/pages/hi/about.astro`, `src/pages/hi/contact.astro`, `src/pages/hi/privacy-policy.astro`, `src/pages/hi/terms.astro`
- Modify: `src/pages/hi/index.astro` (promote placeholder → full page)

**Interfaces:**
- Consumes: `BaseLayout`, `Converter`, `FAQ` (with `faq` + `heading` props, see Task 10 Step 2), `UI.hi`
- Produces: complete `/hi/` site; every English page has a Hindi twin.

- [ ] **Step 1: Write `src/data/faq.hi.ts`**

```ts
import type { FaqItem } from './faq.en';
export const FAQ_ITEMS_HI: FaqItem[] = [
  { q: 'हिंग्लिश टू हिंदी कन्वर्टर क्या है?', a: 'यह एक विशेष टूल है जो रोमन लिपि की हिंग्लिश (जैसे "aap kaise ho") को तुरंत मानक देवनागरी हिंदी (जैसे "आप कैसे हैं") में बदल देता है।' },
  { q: 'हिंग्लिश टाइपिंग कैसे काम करती है?', a: 'आप सामान्य अंग्रेज़ी QWERTY कीबोर्ड से हिंदी शब्द ध्वनि के अनुसार टाइप करते हैं, और कन्वर्टर आपकी कुंजियों को सीधे हिंदी अक्षरों में बदल देता है — किसी अलग हिंदी कीबोर्ड की ज़रूरत नहीं।' },
  { q: 'क्या मैं हिंदी वापस हिंग्लिश में बदल सकता हूँ?', a: 'हाँ, टूल दोनों दिशाओं में काम करता है — देवनागरी हिंदी को आसानी से पढ़ने वाली रोमन हिंग्लिश में बदल सकते हैं।' },
  { q: 'हिंग्लिश क्या है?', a: 'हिंग्लिश अंग्रेज़ी शब्दावली और हिंदी व्याकरण का मिला-जुला रूप है जो भारत में चैट, सोशल मीडिया और आम बातचीत में इस्तेमाल होता है।' },
  { q: 'Hinglish kya hota hai?', a: 'Hinglish Hindi aur English ka ek aisa mishran hai jiska upyog hum chat, social media aur aam bolchal mein text likhne ke liye karte hain.' },
  { q: 'मानक अनुवाद की जगह हिंग्लिश टू हिंदी टूल क्यों इस्तेमाल करें?', a: 'मानक अनुवादक भाषा की सीमाओं को सख्ती से मानते हैं, जबकि हिंग्लिश टूल भारतीय डिजिटल परिवेश के फोनेटिक लेखन, स्लैंग और अनौपचारिक भाषा को विशेष रूप से समझता है।' },
];
```

- [ ] **Step 2: FAQ.astro is already locale-aware from Task 8**

Skip rewriting `FAQ.astro`. Confirm `src/pages/index.astro` still uses `<FAQ faq={FAQ_ITEMS} heading="Frequently Asked Questions" />` (already set in Task 8).

- [ ] **Step 3: Promote `src/pages/hi/index.astro`** to the full Hindi home (tool + GEO + FAQ + WebApplication JSON-LD)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Converter from '../../components/Converter.astro';
import FAQ from '../../components/FAQ.astro';
import { FAQ_ITEMS_HI } from '../../data/faq.hi';

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'हिंग्लिश टू हिंदी कन्वर्टर',
  url: 'https://hinglish.openpixal.com/hi/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
};
---
<BaseLayout locale="hi" path="/hi/">
  <section class="mx-auto max-w-3xl px-4 pt-6">
    <h1 class="text-2xl font-bold sm:text-3xl">हिंग्लिश टू हिंदी कन्वर्टर</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      रोमन हिंग्लिश टाइप करें और तुरंत देवनागरी हिंदी पाएँ। मुफ्त हिंग्लिश टू हिंदी
      अनुवाद टूल — <strong>हिंदी से हिंग्लिश</strong> भी, बिना अकाउंट, बिना अपलोड।
    </p>
    <div class="mt-4"><Converter locale="hi" /></div>
  </section>

  <article id="gee" class="mx-auto mt-12 max-w-3xl px-4">
    <h2 class="text-xl font-bold">हिंग्लिश लिप्यंतरण बनाम अनुवाद</h2>
    <p class="mt-2 text-slate-600 dark:text-slate-300">
      लिप्यंतरण (transliteration) एक लिपि से दूसरी लिपि में ध्वनि मिलाता है — रोमन
      <em>kya</em> से देवनागरी <em>क्या</em>; अनुवाद दो भाषाओं के बीच अर्थ बदलता है।
      यह टूल हिंग्लिश का लिप्यंतरण इंजन है — hain, hai, kya, meri जैसे आम शब्द अपने आप
      ठीक हो जाते हैं, और संदिग्ध/अंग्रेज़ी शब्द ज्यों-के-त्यों रहते हैं।
    </p>
  </article>

  <FAQ faq={FAQ_ITEMS_HI} heading="अक्सर पूछे जाने वाले प्रश्न" />

  <script is:inline type="application/ld+json" set:html={JSON.stringify(appJsonLd)} />
</BaseLayout>
```

- [ ] **Step 4: Write the four remaining Hindi pages** (`/hi/about/`, `/hi/contact/`, `/hi/privacy-policy/`, `/hi/terms/`), each mirroring its English sibling with full Hindi copy:

`src/pages/hi/about.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout locale="hi" path="/hi/about/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">हिंग्लिश टू हिंदी कन्वर्टर के बारे में</h1>
    <p>हिंग्लिश भारतीय चैट, कैप्शन और सोशल मीडिया में इस्तेमाल होने वाली अंग्रेज़ी और हिंदी की रोज़मर्रा मिश्रित भाषा है। यह हिंग्लिश टू हिंदी कन्वर्टर रोमन लिपि की हिंग्लिश को मानक देवनागरी हिंदी में तुरंत बदलता है — आपकी डिवाइस पर ही, बिना डेटा भेजे।</p>
    <p>उल्टा भी काम करता है: देवनागरी हिंदी डालें और कैप्शन, संदेश व नोट्स के लिए पढ़ने लायक हिंग्लिश पाएँ।</p>
    <p>पूरी रूपांतरण प्रक्रिया ब्राउज़र के भीतर ही चलती है — तेज़, मुफ्त और निजी।</p>
  </article>
</BaseLayout>
```

`src/pages/hi/contact.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout locale="hi" path="/hi/contact/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">संपर्क</h1>
    <p>कोई त्रुटि मिली या हिंग्लिश टू हिंदी कन्वर्टर पर सुझाव है? हमें लिखें
      <a class="text-indigo-600 underline" href="mailto:hello@hinglish.openpixal.com">hello@hinglish.openpixal.com</a> —
      वह हिंग्लिश टेक्स्ट भेजें जो गलत बना, और क्या अपेक्षित देवनागरी थी।</p>
  </article>
</BaseLayout>
```

`src/pages/hi/privacy-policy.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout locale="hi" path="/hi/privacy-policy/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">गोपनीयता नीति</h1>
    <p><strong>हम क्या इकट्ठा करते हैं:</strong> कुछ नहीं। यह एक स्थिर वेबसाइट है। आपके द्वारा टाइप किया टेक्स्ट आपके ब्राउज़र में JavaScript से बदला जाता है; यह कहीं अपलोड, संग्रहीत या सर्वर पर संसाधित नहीं होता।</p>
    <p><strong>लोकल स्टोरेज:</strong> हम केवल आपकी थीम (डार्क/लाइट) पसंद आपके ब्राउज़र की localStorage में सहेजते हैं।</p>
    <p><strong>थर्ड पार्टी:</strong> लॉन्च पर साइट कोई थर्ड-पार्टी स्क्रिप्ट नहीं लोड करती। भविष्य में विज्ञापन या एनालिटिक्स जुड़े तो यह नीति अपडेट की जाएगी।</p>
    <p><strong>संपर्क:</strong> hello@hinglish.openpixal.com</p>
  </article>
</BaseLayout>
```

`src/pages/hi/terms.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout locale="hi" path="/hi/terms/">
  <article class="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 class="text-2xl font-bold">उपयोग की शर्तें</h1>
    <p>किसी भी उद्देश्य के लिए उपयोग निःशुल्क है। हिंग्लिश टू हिंदी कन्वर्टर "जैसा है" वैसी सेवा है; संदिग्ध हिंग्लिश इनपुट पर ध्वन्यात्मक लिप्यंतरण कभी-कभी मानक वर्तनी से भिन्न हो सकता है।</p>
    <p>आप इस सेवा या इसके आउटपुट को किसी प्रतिस्पर्धी उत्पाद के रूप में पुनः बेच या पैकेज नहीं कर सकते।</p>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Build + quick smoke + commit**

Run: `npm run build`
Expected: 10 pages total (5 en + 5 hi). Converter unit-tested on both locales smoke-tests clean. Navbar across every local path works.

```
git add -A
git commit -m "feat: complete hindi mirror of all pages"
```

---

### Task 11: hi-IN SEO activation (hreflang mutual, bilingual sitemap)

**Files:**
- Modify: `src/lib/constants.ts` (`HI_LIVE = true`), `src/layouts/BaseLayout.astro` (hi alternate now emitted), `astro.config.mjs` (sitemap includes `/hi/`)

**Interfaces:**
- Consumes: completed `/hi/` pages
- Produces: mutual hreflang; sitemap lists all 10 URLs with xhtml alternates.

- [ ] **Step 1: Flip `HI_LIVE`**

In `src/lib/constants.ts`: change `export const HI_LIVE = false;` → `export const HI_LIVE = true;`

- [ ] **Step 2: Rebuild and inspect head + sitemap**

Run: `npm run build`
Expected:
- In `dist/index.html` head: `hreflang="en-IN"`, `hreflang="hi-IN"`, `hreflang="x-default"`.
- In `dist/hi/index.html` head: same three, with hi-IN pointing at `/hi/`.
- `dist/sitemap-0.xml` lists all 10 URLs, each with `<xhtml:link rel="alternate" hreflang="en-IN|hi-IN">`.

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat: activate hindi locale in hreflang and sitemap"
```

---

### Task 12: QA gate G2 — combined cross-locale evidence

**Files:**
- Modify: `docs/GATES.md`

**Interfaces:**
- Consumes: full bilingual site
- Produces: G2 pass/fail evidence.

- [ ] **Step 1: Append the G2 checklist to `docs/GATES.md` and run every check**

```markdown
## Gate G2 — Combined release
Status: PENDING

- [ ] `npm run build` clean (paste output tail)
- [ ] `npm run test` 27/27 (paste output tail)
- [ ] `/` and `/hi/` both render fully (paste both titles)
- [ ] Every page (10) head has mutual hreflang en-IN + hi-IN + x-default
      (spot-check all; paste one en + one hi head)
- [ ] Sitemap lists all 10 URLs with alternates (paste count)
- [ ] JSON-LD valid on `/` and `/hi/` (FAQPage, WebApplication, Organization, BreadcrumbList, zero errors)
- [ ] No dead links; cross-locale links exist only via switcher
      (paste link crawl summary)
- [ ] Converter behaves identically in both locales (same engine, isolated UI)
```

Run the checks (build, preview via background plugin, crawl, validator). Paste real output. Set `Status: PASS` only with full evidence.

- [ ] **Step 2: Commit evidence**

```
git add docs/GATES.md
git commit -m "docs: gate g2 evidence"
```

---

### Task 13: Release — Cloudflare Pages prep, monetization + deploy docs, README

**Files:**
- Create: `docs/MONETIZATION-GUIDE.md`, `README.md`
- Modify: `package.json` (add `deploy` script), `.gitignore` (dist ignored? Astro keeps dist ignored by default — verify)

**Interfaces:**
- Consumes: green G2
- Produces: deployment scripts + documentation; actual `git push && wrangler pages deploy` is invoked only on user go.

- [ ] **Step 1: Add `deploy` scripts to `package.json`**

```json
"deploy": "astro build && wrangler pages deploy dist --project-name=hinglish-to-hindi",
"deploy:preview": "astro build && wrangler pages deploy dist --project-name=hinglish-to-hindi --branch=preview"
```

Note: requires `wrangler` (install as devDependency in Task 13): `npm i -D wrangler`.

- [ ] **Step 2: Write `docs/MONETIZATION-GUIDE.md`** (document-only AdSense per spec §10)

```markdown
# Monetization Guide (document-only)

AdSense is intentionally NOT wired into the codebase. Zero third-party JS ships at launch.

## When to enable
1. Site is indexed and receives sustained traffic.
2. Core Web Vitals verified (Lighthouse mobile ≥ 90).

## Suggested slots (high viewability, non-intrusive)
- Slot A: responsive display unit directly below the converter box
  (between Converter and the GEO article on the home page, both locales).
- Slot B: footer/leaderboard unit below the FAQ section.

## Implementation notes for a future session
- Add `<meta name="google-adsense-account" content="ca-pub-XXXX">` to BaseLayout head.
- Add the <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js">
  before `</body>` in BaseLayout.
- Mark units with `<ins class="adsbygoogle">` per the responsive ad snippet from
  the AdSense dashboard; call (adsbygoogle = window.adsbygoogle || []).push({}).
- Keep units 100% width, height auto, so CLS stays 0.
- Re-run G2 checks after inserting ads.
```

- [ ] **Step 3: Write `README.md`**

```markdown
# Hinglish ↔ Hindi Converter

Zero-cost, static, bilingual converter at https://hinglish.openpixal.com.
- English site: `/`  ·  Hindi site: `/hi/`
- Tech: Astro 5 (static), Tailwind 4, @indic-transliteration/sanscript, Vitest.
- Engine: `src/lib/transliteration.ts` (client-side; 27 verified fixtures in
  `src/lib/transliteration.test.ts`).

## Commands
npm run dev | build | preview | test | check | deploy

## Agent workflow
Task/workflow agents live in `.opencode/agent/`. Orchestrator judges the QA gates
G1 (English) and G2 (combined) recorded in `docs/GATES.md`.

## Localization
`SITE_URL`, `HI_LIVE`, locales and nav in `src/lib/constants.ts`; UI strings in
`src/lib/i18n.ts`. All absolute URLs derive from `SITE_URL`.
```

- [ ] **Step 4: Commit + final gate**

```
git add -A
git commit -m "docs: release guide, monetization doc, readme, deploy scripts"
```

Then: show `git log --oneline` to the user, summarize GATES.md status, and await the user's go signal for the live deploy (Task 14 is on demand only).

---

### Task 14 (on demand, user go): Deploy to Cloudflare Pages

**Files:** none (ops)

- [ ] **Step 1: Authenticate wrangler**

Run: `npx wrangler login`
Expected: browser auth flow completes.

- [ ] **Step 2: Create + deploy the Pages project**

Run:
`npx wrangler pages project create hinglish-to-hindi --production-branch main`
`npm run deploy`

Expected: output shows deployment URL `https://<hash>.hinglish-to-hindi.pages.dev`.

- [ ] **Step 3: Attach custom domain `hinglish.openpixal.com`**

Follow the Cloudflare dashboard Pages → Custom domains flow (domain already on the account). Verify: `https://hinglish.openpixal.com/` and `/hi/` serve; hreflang/sitemap intact.

- [ ] **Step 4: Post-deploy sanity**

Re-run G2 spot checks against the production URL (hreflang, converter, sitemap).