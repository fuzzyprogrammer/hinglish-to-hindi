# Hinglish ↔ Hindi Converter — Design Doc

Date: 2026-09-18
Status: Approved (draft for review)

## 1. Overview

A zero-cost, production-ready, hyper-niche bilingual web tool that converts **Hinglish → Hindi (Devanagari)** and **Hindi → Hinglish**, optimized for organic/AI-search discovery and future AdSense monetization. Two gated variants: an English interface (default locale, `/`) first, then a full Hindi mirror (`/hi/`).

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Framework | Astro 5 (static output), Tailwind CSS, no client framework — converter is a zero-framework TS island |
| Hosting | Cloudflare Pages (free tier), domain `openpixal.com` → subdomain `hinglish.openpixal.com` |
| Locale routing | `en` default at `/`, `hi` at `/hi/` (full site mirror) |
| Pages | 5 per locale: Home (tool + FAQ), About, Contact, Privacy Policy, Terms |
| Engine | `@indic-transliteration/sanscript` (MIT) + thin Hinglish normalization layer, client-side |
| AdSense | Document-only (placement guide in §10; no ad code ships) |
| Analytics | None in v1 (zero third-party JS; `analytics.ts` stub hook retained) |
| Agents | Persistent project-scoped opencode agents in `.opencode/agent/*.md` |

## 3. Agent workflow

Persistent agents (`.opencode/agent/<name>.md`), project-scoped, reusable across sessions.

| Agent | Owns | Loads | Hand-off trigger |
|---|---|---|---|
| `orchestrator` | Sequences all work; judges phase gates G1/G2; dispatches parallel subagents; merges outputs; writes no feature code | dispatching-parallel-agents, subagent-driven-development, executing-plans, finishing-a-development-branch, verification-before-completion | Runs first and last; owns each gate decision |
| `transliteration-engineer` | Language-neutral engine: Sanscript wrapper, Hinglish normalization, reverse direction, unit test corpus | test-driven-development, systematic-debugging | Hands off when converter passes test corpus (G0) |
| `cro-ux-specialist` | English UI first (navbar, lang switcher, dark/light, converter, toolbar, toasts, responsive), then Hindi UI strings | frontend-design, impeccable, web-perf | Hands off when UI is mobile+desktop clean |
| `seo-architect` | English SEO first (meta, keyword map, hreflang, JSON-LD, sitemap, robots, GEO copy), then Hindi content mirror + hi-IN SEO | — (authoring) | Hands off when both locales' metadata/schema/sitemap are in |
| `qa-reviewer` | Hard verification gate; assembles evidence for G1/G2; never fixes, only reports | verification-before-completion, code-review, web-perf | Reports PASS/FAIL to orchestrator only |

### Gated pipeline

```
Phase A — ENGLISH variant
  A1 engine + unit tests            (shared, language-neutral)
  A2 English UI / CRO polish        (navbar, theme toggle, lang switcher stub, converter)
  A3 English SEO                    (meta, JSON-LD, FAQ, GEO copy, sitemap WITHOUT /hi/ alternate)
  A4 QA gate G1                     qa-reviewer evidence -> orchestrator PASS/FAIL
                                    FAIL -> blame -> re-dispatch to owner; retry G1
Phase B — HINDI variant
  B1 /hi/ full mirror (whole content in Hindi: UI strings, SEO copy, Hindi FAQ)
  B2 hi-IN SEO (hreflang en<->hi mutual, bilingual sitemap with alternates)
  B3 QA gate G2                     cross-locale verification PASS/FAIL
  B4 Release -> Cloudflare Pages deploy (cloudflare/wrangler skill + builds MCP)
```

### Orchestrator correctness rules

1. **No dangling locale links.** During English QA, `/hi/` serves a minimal placeholder page so no 404s and no dead navbar link. hreflang `en↔hi` goes live only at B2.
2. **Gate criteria are concrete assertion lists** (§8), so PASS/FAIL is mechanical, not vibes.

## 4. Repository structure

```
/ (project root)
  .opencode/agent/*.md              # orchestrator, transliteration-engineer,
                                    # cro-ux-specialist, seo-architect, qa-reviewer
  astro.config.mjs                  # static output, i18n routing (defaultLocale en),
                                    # sitemap integration
  tailwind.config.mjs               # class-based dark mode, brand tokens
  src/
    lib/
      constants.ts                  # SITE_URL, locales, keywords, brand
      i18n.ts                       # en/hi UI string dictionaries
      transliteration.ts            # Sanscript wrapper + normalization + reverse
      analytics.ts                  # no-op stub hook
    components/
      Navbar.astro                  # unified nav: logo, links, LangSwitcher, ThemeToggle
      Footer.astro
      ThemeToggle.astro
      LangSwitcher.astro            # / <-> /hi/
      Converter.astro               # thin wrapper rendering <ConverterEngine>
      ConverterEngine.ts            # island: textarea(s), live inline conversion,
                                    # toolbar, toasts, counters
FAQ.astro                       # renders FAQ list + injects FAQPage JSON-LD
    layouts/
      BaseLayout.astro              # <html lang>, head/meta/hreflang/jsonLd slots,
                                    # navbar + footer, theme init script
    content/ or data/               # page copy per locale (en/hi)
  public/
    robots.txt
    favicon.svg
  src/pages/
    index.astro                 # en home (converter above fold + FAQ + GEO copy)
    about.astro  contact.astro  privacy-policy.astro  terms.astro
    hi/{index,about,contact,privacy-policy,terms}.astro
```

## 5. Localization & routing

- Astro i18n: `defaultLocale: 'en'`, `locales: ['en','hi']`, routing so English = `/`, Hindi = `/hi/` (English stays on the bare domain).
- Each page `<html lang>` = `en` or `hi`. Provide `<link rel="alternate" hreflang=...>` (en-IN, hi-IN, x-default) in `<head>` via layout.
- Language switcher links: `/` ↔ `/hi/`; active state marks current locale.
- All UI strings from `i18n.ts` dictionaries; Hindi builds use the `hi` dictionary (full translation, not transliteration).

## 6. Feature / UX spec

- **Converter (above the fold):** textarea auto-focus; typing converts **live** (per grapheme/word) to Devanagari. Mode toggle: `Hinglish→Hindi` (default) and `Hindi→Hinglish` (input in Devanagari → output romanized).
  Default example placeholder: `aap kaise hain`.
- **Toolbar:** Copy (Clipboard API + `execCommand` textarea fallback) with toast confirmation; Clear; Listen (Web Speech API, `lang='hi-IN'`, cancel previous utterance on re-play, error fallback when no Hindi voice); WhatsApp share (opens `https://wa.me/?text=<encoded Devanagari output>`).
- **Counters:** live word + character count under the input.
- **Theme:** dark/light toggle, Tailwind `class` strategy, default follows `prefers-color-scheme`, manual choice persisted to `localStorage`; no flash via inline init script in `<head>`.
- **Navbar:** unified across all pages/locales; on mobile collapses to a compact row (brand left, controls right) — no hamburger needed at 5 pages; footer repeats disclaimer + language note.

### Transliteration details

- Core: `sanScript.t(text, 'itrans', 'devanagari')` and reverse `sanScript.t(text, 'devanagari', 'itrans')`.
- Normalization layer (Hinglish side): preserve English passages, numbers, punctuation, newlines; lowercase-insensitive mapping; trim double spaces; handle common `hai/hain`, `kaise/kese` spelling variants for example fixtures only.
- Reverse: ITRANS romanization cleanup toward conversational Hinglish (`ं`/`ँ` → `n`/`n`, schwa elisions kept simple — document caveat on page as "lossless transliteration").
- Fixture corpus of ~40 pairs (language-neutral) checked by G0 unit tests for both directions.

## 7. SEO & structured data

- `SITE_URL = https://hinglish.openpixal.com` in `constants.ts`; every absolute URL (hreflang, canonical, sitemap, og) derives from it — launch-safe.
- **hreflang** (in `<head>` of every page): en-IN `/`, hi-IN `/hi/`, x-default `/`.
- **JSON-LD:** `WebApplication` (converter, offers=free), `Organization` (name/url), `BreadcrumbList` per page, `FAQPage` with the 6 Q&As — English on `/`, Hindi QA equivalents on `/hi/`.
- **sitemap.xml** (via `@astrojs/sitemap`): both locales, mutual `<xhtml:link rel="alternate" hreflang>`.
- **robots.txt:** allow all; reference sitemap.
- **Keyword map** — woven organically into H1, H2, meta description, alt/copy:
  - Primary: `hinglish to hindi`, `hinglish to hindi converter`, `hinglish to hindi translation`, `hinglish to hindi translate`, `hinglish to hindi google translate`
  - Typing: `hinglish typing`, `hinglish caption generator`, `hinglish words`, `hinglish examples`
  - Reverse/ecosystem: `hindi to hinglish`, `hinglish means`, `hinglish app`
  Hindi mirror uses corresponding Hindi keyword/natural phrasing.
- **GEO copy block** (below FAQ, `<article>`/`<section>` semantic HTML, `<main>` + `<aside>`): authoritative entity definition — "Hinglish transliteration vs translation" — plus one-sentence teardown of how the tool works (phonetic mapping, client-side, no data leaves device) for LLM/citation readiness.
- Semantic landmarks: `<main>`, `<section>`, `<article>`, `<aside>`, `<nav>`, `<footer>`.

## 8. Verification gates (qa-reviewer evidence)

**G0 (engine):** unit tests pass on the fixture corpus (both directions); no console errors.
**G1 (English release gate):**
- `npm run build` clean on static output.
- `/` renders; converter live-converts `aap kaise hain` → `आप कैसे हैं` in browser check.
- Copy/Clear/Listen(if supported)/WhatsApp/counters function manually.
- hreflang present with en-IN + x-default only (no dead `/hi/` alternate).
- FAQPage + WebApplication JSON-LD parse (schema validator, no errors).
- `/hi/` placeholder route exists (no 404) for switcher link.
- Mobile viewport (375px) usable; no horizontal scroll; no CLS from the toolbar.
**G2 (combined release gate):**
- Both locales build clean; `/` and `/hi/` render fully.
- hreflang en-IN ↔ hi-IN mutual on every page; x-default correct.
- Sitemap lists all 10 URLs with alternates; schema valid for both locales.
- No dead links; cross-locale links only via switcher.
- Converter behaves identically in both locales (shared engine, isolated UI strings).

## 9. Deployment

- Cloudflare Pages, static build (`npm run build`), free tier.
- Preview deployments per branch; production from `main`.
- Env-free: no secrets required at runtime.
- Deploy via `cloudflare`/`wrangler` skill + cloudflare-builds MCP; domain `hinglish.openpixal.com` attached as custom domain.

## 10. Monetization (document-only)

- AdSense **not wired** in v1.
- Documented slots (guide in this repo): (1) responsive display unit below the converter above the fold boundary; (2) footer/sidebar unit below FAQ. Recommended: defer until traffic + CWV verified. Include in compliance pages (Privacy Policy already exists).
- GA4/AdSense account linking documented for a future session (out of scope).

## 11. Out of scope (v1)

- Real-time speech dictation, Hindi OCR, mobile app, multi-language (beyond en/hi), user accounts, dynamic server routes, analytics instrumentation.

## 12. Success criteria

- Ships both locales on Cloudflare Pages at `hinglish.openpixal.com`.
- Passes gates G1 and G2 with documented evidence.
- Zero third-party JS at launch; Lighthouse mobile ≥ 90 on Performance/SEO.
- Conversing with the corpus: engine fixtures all green for both directions.