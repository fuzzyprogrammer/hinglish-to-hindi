# Monetization Guide (document-only)

AdSense is intentionally NOT wired into the codebase. Zero third-party JS ships at launch.

## When to enable
1. Site is live, indexed, and receives sustained traffic.
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
  the AdSense dashboard; call `(adsbygoogle = window.adsbygoogle || []).push({})`.
- Keep units 100% width, height auto, so CLS stays 0.
- Re-run G2 checks after inserting ads.
