# Converter UX Upgrades — Paste Detection & Download

> Competitive response to IndiaTyping.com (#1 search result for "hinglish to hindi converter"). Closes the two highest-impact feature gaps while keeping the tool's zero-framework, client-side-only constraint.

## 1. Goals

1. Let users paste pre-written Hinglish (or Hindi) text and get it converted automatically — matching IndiaTyping's "Passage By Passage" mode without adding a separate UI.
2. Let users download the converted output as a plain-text `.txt` file — matching IndiaTyping's "Download Text to File" feature.
3. Keep the existing real-time live conversion untouched for typing use cases.

## 2. Paste Detection

### Trigger

- Listen for the `paste` event on `#input-area` (the existing textarea).
- Measure `event.clipboardData.getData('text').length`.
- If length ≥ 50 characters: treat as a paste-passage event.
- If length < 50: ignore (normal typing/paste continues via existing `input` listener).

### Behavior on paste-passage

1. Prevent the default paste (we read the clipboard data ourselves).
2. Set `inputEl.value` to the pasted text.
3. Call `render()` immediately — the output updates with the full conversion.
4. Show a toast: `"X words converted from pasted text"` where `X` is the word count of the pasted input.
5. The existing live-conversion `input` listener continues to work from this point (user can edit the pasted text and see live updates).

### Toast string (i18n)

| Key | en | hi |
|-----|----|----|
| `pastedToast(count)` | `${count} words converted from pasted text` | `${count} शब्द पेस्ट किए गए टेक्स्ट से बदले` |

Implementation: the toast is a function that accepts the count and returns the localized string, since static string templates cannot interpolate at definition time. The existing `showToast(msg)` call site passes the interpolated result.

### Edge cases

- **Rapid consecutive pastes:** last paste wins; the existing `toastTimer` replaces any prior toast.
- **Paste in Hindi→Hinglish mode:** works identically — `render()` already dispatches to the correct direction based on `mode`.
- **Paste with HTML/rich text:** `getData('text/plain')` is used; rich formatting is stripped.

## 3. Download Button

### UI

- New `<button>` in the existing toolbar row, positioned between the WhatsApp link (`#wa-btn`) and the Copy button (`#copy-btn`).
- Label: `Download` (EN) / `डाउनलोड` (HI) — from new i18n key `download`.
- Style: matches Clear button (border style, not filled) to avoid competing with Copy's primary fill.

### Behavior

1. On click, read `outputEl.textContent` (the converted text).
2. If empty: show toast `"Nothing to download"` / `"डाउनलोड के लिए कुछ नहीं"` and return.
3. Create a `Blob` with type `text/plain; charset=utf-8`.
4. Create an object URL via `URL.createObjectURL(blob)`.
5. Create a temporary `<a>` element, set `href` and `download` attribute to `hinglish-output.txt`, click it programmatically, then revoke the object URL.

### i18n strings

| Key | en | hi |
|-----|----|----|
| `download` | `Download` | `डाउनलोड` |
| `emptyDownload` | `Nothing to download` | `डाउनलोड के लिए कुछ नहीं` |

## 4. Files Modified

| File | Change |
|------|--------|
| `src/components/Converter.astro` | Add `paste` event listener (~15 lines), download button markup (~5 lines), download click handler (~10 lines) |
| `src/lib/i18n.ts` | Add 3 new keys to `UiStrings` type and both locale dictionaries |

No new files. No new dependencies. No changes to the transliteration engine, layout, or any other component.

## 5. Constraints

- Zero third-party JS — download uses native `Blob` + `URL.createObjectURL` only.
- Both locales (EN + HI) get identical functionality.
- The existing live-conversion behavior is never altered — paste detection is purely additive.
- The download button produces a UTF-8 `.txt` file with the correct BOM for Devanagari cross-platform readability (optional — evaluate whether BOM is needed; most modern editors handle UTF-8 without BOM).

## 6. Verification

After implementation:

1. `npm run test` → 27/27 (unchanged — no new test fixtures for UI behavior)
2. `npm run build` → 10 pages clean
3. `npm run check` → 0 errors
4. Manual smoke:
   - Paste a 100-word Hinglish paragraph → toast appears with word count, output converts fully
   - Paste a 3-character word → no toast, normal live conversion
   - Click Download → `hinglish-output.txt` downloads with correct Devanagari content
   - Switch to Hindi→Hinglish mode → paste Devanagari block → converts to Roman → download works
   - Paste while output is empty → no crash
   - Click Download while output is empty → toast "Nothing to download"
