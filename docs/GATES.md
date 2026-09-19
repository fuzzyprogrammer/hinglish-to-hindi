# QA Gates

## Gate G1 — English variant release
Status: PASS (archived — superseded by G2 once `HI_LIVE` flipped)

> **Archival note (2026-09-19):** G1 was the English-only gate run while `HI_LIVE = false` and `/hi/` was a placeholder. The evidence below is the **historical record** captured at that time; it is preserved verbatim and is **not** re-run evidence. `src/lib/constants.ts` now sets `HI_LIVE = true` (see G2 item 12), so the current combined gate is **G2 below**.

### Evidence (historical, archived)

- [x] `npm run build` clean — 6 pages built, sitemap-index.xml generated
- [x] `npm run test` — 27/27 passing
- [x] `npm run check` — 0 errors (1 deprecation hint: `document.execCommand` in Converter.astro)
- [x] Converter live-converts: `aap kaise hain` → `आप कैसै हें` (engine fixture verified)
- [x] hreflang in `/` head: en-IN + x-default only; NO hi-IN (HI_LIVE=false)
- [x] FAQPage + WebApplication JSON-LD parse with zero errors (verified in task 8 report)
- [x] `/hi/` placeholder route exists (200 response)
- [x] 375px viewport: no horizontal scroll; no CLS from toolbar

### Keyword coverage (historical, archived)

English keyword grep (`dist/index.html`, patterns: `hinglish to hindi|hinglish typing|hinglish words|hinglish examples|hinglish app|hinglish caption generator|hindi to hinglish`):

```
→ 4 files matched (dist/index.html, about, contact, terms) — keyword phrases present in
  visible body copy and nav; "hinglish to hindi" / "hindi to hinglish" / "hinglish typing" /
  "hinglish words" / "hinglish app" rendered in <strong>/<em> on the homepage.
```

Hindi keyword grep (Devanagari `हिंग्लिश टू हिंदी` over `dist/`):

```
→ dist/hi/index.html: <title>हिंग्लिश टू हिंदी कन्वर्टर</title> + <meta name="description">
  फ्री हिंग्लिश टू हिंदी कन्वर्टर…
→ dist/_astro/…lang.DuGrvUDQ.js: hi UI bundle contains converterTitle
  "हिंग्लिश टू हिंदी कन्वर्टर" (ready for Gate G2).
```

---

## Gate G2 — Combined release
Status: PASS (re-verified 2026-09-19 after remediation wave: ac6489b, 0c1ebd2, eb17109)

> **Tooling note:** this machine has no `rg` (ripgrep) binary, and `npx rg` resolves to an unrelated npm wrapper, not ripgrep. Where the plan's evidence command named `rg`, the functionally equivalent PowerShell `Select-String -AllMatches` / Node UTF-8 regex sweep was used; the exact command run is quoted for every item below. Counts are **match occurrences**, not lines.

### Evidence

**1. Build — clean, 10 pages** ✅

Command:
```
npm run build
```

Output (excerpt; exit code 0):
```
> hinglish-tool@0.0.1 build
> astro build
12:10:49 [build] output: "static"
12:10:49 [build] Collecting build info...
12:10:49 [build] ✓ Completed in 316ms.
12:10:54 [vite] ✓ built in 4.48s
12:10:54 [vite] ✓ built in 340ms
12:10:54 [build] Rearranging server assets...
 generating static routes
   ├─ /about/index.html
   ├─ /contact/index.html
   ├─ /hi/about/index.html
   ├─ /hi/contact/index.html
   ├─ /hi/privacy-policy/index.html
   ├─ /hi/terms/index.html
   ├─ /hi/index.html
   ├─ /privacy-policy/index.html
   ├─ /terms/index.html
   ├─ /index.html
   ✓ Completed in 297ms.
12:10:54 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
12:10:54 [build] 10 page(s) built in 5.69s
12:10:54 [build] Complete!
```

Page count confirmation:

```
PS> $pages = Get-ChildItem -Path dist -Recurse -Filter index.html | Where-Object { $_.FullName -notmatch '\_astro\' }
PS> $pages.Count
10
```

**2. Tests — 27/27, 1 file** ✅

Command:
```
npm run test
```

Output:
```
> hinglish-tool@0.0.1 test
> vitest run --passWithNoTests

 ✓ src/lib/transliteration.test.ts (27 tests) 22ms

 Test Files  1 passed (1)
      Tests  27 passed (27)
```

**3. `astro check` — 0 errors** ✅

Command:
```
npm run check
```

Output:
```
> hinglish-tool@0.0.1 check
> astro check

Result (25 files):
- 0 errors
- 0 warnings
- 1 hint
```
The single hint is `ts(6387): document.execCommand is deprecated` at `src/components/Converter.astro:88` — non-blocking, pre-existing.

**4. Every page head: en-IN + hi-IN + x-default (spot-checked all 10; quoted /about/ + /hi/about/)** ✅

Command (per page): `Select-String -LiteralPath <page> -Pattern '<link rel="alternate"[^>]*>' -AllMatches`

Per-page alternate-link counts — all 10 pages have exactly 3:

```
dist\index.html : 3    dist\hi\index.html : 3
dist\about\index.html : 3    dist\hi\about\index.html : 3
dist\contact\index.html : 3    dist\hi\contact\index.html : 3
dist\privacy-policy\index.html : 3    dist\hi\privacy-policy\index.html : 3
dist\terms\index.html : 3    dist\hi\terms\index.html : 3
```

Quoted — `dist\about\index.html`:
```
<link rel="alternate" hreflang="en-IN" href="https://hinglish.openpixal.com/about/">
<link rel="alternate" hreflang="hi-IN" href="https://hinglish.openpixal.com/hi/about/">
<link rel="alternate" hreflang="x-default" href="https://hinglish.openpixal.com/">
```

Quoted — `dist\hi\about\index.html`:
```
<link rel="alternate" hreflang="en-IN" href="https://hinglish.openpixal.com/about/">
<link rel="alternate" hreflang="hi-IN" href="https://hinglish.openpixal.com/hi/about/">
<link rel="alternate" hreflang="x-default" href="https://hinglish.openpixal.com/">
```

Dead-alternate sweep (every `hreflang` href resolved against the 10 built pages):

```
PASS: 30 hreflang hrefs checked, 0 dead alternates
```

**5. Sitemap — 10 URLs, 20 xhtml:link alternates** ✅

Command:
```
Select-String -Path dist\sitemap-0.xml -Pattern 'xhtml:link' -AllMatches | ForEach-Object { $_.Matches } | Measure-Object
Select-String -Path dist\sitemap-0.xml -Pattern 'hreflang="en-IN"' -AllMatches | ForEach-Object { $_.Matches } | Measure-Object
Select-String -Path dist\sitemap-0.xml -Pattern 'hreflang="hi-IN"' -AllMatches | ForEach-Object { $_.Matches } | Measure-Object
Select-String -Path dist\sitemap-0.xml -Pattern '<loc>' -AllMatches | ForEach-Object { $_.Matches } | Measure-Object
```

Output:
```
xhtml:link count: 20
hreflang=en-IN count: 10
hreflang=hi-IN count: 10
loc count: 10
```

All 10 `<loc>` URLs (every EN page + every HI page) carry both alternates; e.g.:
```
<loc>https://hinglish.openpixal.com/about/</loc>
<xhtml:link rel="alternate" hreflang="en-IN" href="https://hinglish.openpixal.com/about/"/>
<xhtml:link rel="alternate" hreflang="hi-IN" href="https://hinglish.openpixal.com/hi/about/"/>
<loc>https://hinglish.openpixal.com/hi/about/</loc>
<xhtml:link rel="alternate" hreflang="en-IN" href="https://hinglish.openpixal.com/about/"/>
<xhtml:link rel="alternate" hreflang="hi-IN" href="https://hinglish.openpixal.com/hi/about/"/>
```
`dist/sitemap-index.xml` → `<loc>https://hinglish.openpixal.com/sitemap-0.xml</loc>`.

**6. JSON-LD — 10/10 valid on both locales** ✅

Command:
```
node jsonld-check.js   # matches /<script[^>]*type="application/ld+json"[^>]*>([\s\S]*?)<\/script>/g and JSON.parse() each block
```

Output:
```
=== dist/index.html — 3 JSON-LD block(s) ===
  Block 1: VALID  @type=Organization
  Block 2: VALID  @type=FAQPage
  Block 3: VALID  @type=WebApplication
=== dist/hi/index.html — 3 JSON-LD block(s) ===
  Block 1: VALID  @type=Organization
  Block 2: VALID  @type=FAQPage
  Block 3: VALID  @type=WebApplication
=== dist/about/index.html — 2 JSON-LD block(s) ===
  Block 1: VALID  @type=Organization
  Block 2: VALID  @type=BreadcrumbList
=== dist/hi/about/index.html — 2 JSON-LD block(s) ===
  Block 1: VALID  @type=Organization
  Block 2: VALID  @type=BreadcrumbList
TOTAL: 10/10 JSON-LD blocks valid
```

**7. No dead links** ✅

Command: `node deadlinks-check.js` (extracts every `<a href>` and every other href across all 10 built pages, resolves internal targets against the 17 files in `dist/`).

Output:
```
Dist files present: 17
Anchor links scanned: 84
Internal page links checked: 138
PASS: 0 dead links — every internal href across all 10 built pages resolves to an existing dist file
```

**8. Converter present on both home pages** ✅

Command:
```
(Select-String -LiteralPath dist\index.html -Pattern 'data-converter' -AllMatches).Matches.Count
(Select-String -LiteralPath dist\hi\index.html -Pattern 'data-converter' -AllMatches).Matches.Count
```

Output:
```
--- data-converter on EN home ---
1
--- data-converter on HI home ---
1
```

**9. Hindi keyword coverage (exact per-file counts)** ✅ — see Keyword Coverage below.

**10. English keyword coverage (exact per-file counts)** ✅ — see Keyword Coverage below.

**11. No stale brand terms** ✅

Command (Node sweep over all dist `.html/.js/.css/.xml` files for `हिंदुग्लिश | हिंद्lish | 表述 | گفتگو`):
```
ZERO matches for all four brand-term patterns across dist/ (14 html/js/css/xml files scanned)
```

**12. `HI_LIVE = true` in constants.ts** ✅

`src/lib/constants.ts:3`:
```ts
export const HI_LIVE = true; // Task 11 flips true once /hi/ content is complete.
```

### Page titles (rendered, both locales)

Quoted from built HTML (`<title>` / `<h1>`):

```
dist/index.html     | <title>Hinglish to Hindi Converter — Type & Get Devanagari Instantly</title> | <h1>Hinglish to Hindi Converter</h1>
dist/hi/index.html  | <title>हिंग्लिश टू हिंदी कन्वर्टर — तुरंत देवनागरी में टाइप करें</title>      | <h1>हिंग्लिश टू हिंदी कन्वर्टर</h1>
```

### Lang switcher (path-preserving)

```
EN /about/ page contains href="/hi/about/"       : 1 (and head alternate to /hi/about/)
HI /hi/about/ page contains href="/about/"       : 1
```

### Favicon

```
Test-Path public\favicon.svg : True
Test-Path dist\favicon.svg   : True
dist\index.html head: <link rel="icon" href="/favicon.svg">
```

### Analytics stub

```
Test-Path src\lib\analytics.ts : True   (stub — present, not wired into pages)
```

### Keyword Coverage

**English** — command: `node keywords-check.js` with regex `hinglish to hindi|hinglish typing|hinglish words|hinglish examples|hinglish app|hinglish caption generator|hindi to hinglish` (`gi`), occurrence counts:

```
dist/index.html : 42
dist/about/index.html : 8
dist/contact/index.html : 7
dist/privacy-policy/index.html : 6
dist/terms/index.html : 7
```

**Hindi** — command: same checker with regex `हिंग्लिश टू हिंदी|हिंग्लिश टाइपिंग|हिंग्लिश शब्द|हिंग्लिश ऐप`, occurrence counts:

```
dist/hi/index.html : 24
dist/hi/about/index.html : 10
dist/hi/contact/index.html : 9
dist/hi/privacy-policy/index.html : 8
dist/hi/terms/index.html : 9
```

Hindi per-pattern breakdown on the five HI pages (for transparency):

```
                         टू हिंदी | टाइपिंग | शब्द | ऐप
dist/hi/index.html            10     10      4     0
dist/hi/about/index.html       7      1      1     1
dist/hi/contact/index.html     5      1      2     1
dist/hi/privacy-policy/index.html    5      1      1     1
dist/hi/terms/index.html       6      1      1     1
```

### Findings vs archived evidence (G2 re-verify delta)

- **EN home 26 → 42** and **HI home 14 → 24**: content grew after the archived counts were written (7 new FAQ entries in `ea666be`, plus subsequent copy). Subpage EN totals are unchanged (8/7/6/7).
- **HI subpages up (6/5/4/5 → 10/9/8/9)**: the `eb17109` remediation deliberately added Hindi subpage keyword coverage — this is the fix working.
- `हिंग्लिश ऐप` does not appear verbatim on the **Hindi home** (0/… the home's three `ऐप` hits are inside `व्हाट्सऐप`/WhatsApp). It renders 1× on each of the four HI subpages. All other patterns are present on the home. **Not a gate failure** (coverage exists site-wide); flag for orchestrator if the exact phrase is required on the home H1/description.
- **Lighthouse (mobile ≥ 90)** was previously recorded in this section but was **not re-run** on 2026-09-19 (chrome-devtools MCP unavailable in this verification session). Every other G2 item was re-verified from a fresh `npm run build`.