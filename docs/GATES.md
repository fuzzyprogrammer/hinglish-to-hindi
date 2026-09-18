# QA Gates

## Gate G1 — English variant release
Status: PASS (pending orchestrator review)

### Evidence

- [x] `npm run build` clean — 6 pages built, sitemap-index.xml generated
- [x] `npm run test` — 27/27 passing
- [x] `npm run check` — 0 errors (1 deprecation hint: `document.execCommand` in Converter.astro)
- [x] Converter live-converts: `aap kaise hain` → `आप कैसै हें` (engine fixture verified)
- [x] hreflang in `/` head: en-IN + x-default only; NO hi-IN (HI_LIVE=false)
- [x] FAQPage + WebApplication JSON-LD parse with zero errors (verified in task 8 report)
- [x] `/hi/` placeholder route exists (200 response)
- [x] 375px viewport: no horizontal scroll; no CLS from toolbar

### Keyword coverage

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
Status: PENDING (after Task 12)