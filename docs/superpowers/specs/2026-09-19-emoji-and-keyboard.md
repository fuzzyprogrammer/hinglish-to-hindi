# Emoji Support & Devanagari Virtual Keyboard

> Adds emoji passthrough, an emoji picker, and a category-tabbed Devanagari virtual keyboard to the Hinglish converter — improving the input experience for mobile users and those without Hindi keyboard layouts.

## 1. Goals

1. Ensure emojis pass through the transliteration engine unchanged in both conversion modes.
2. Provide a quick-access emoji picker for common Indian/WhatsApp-style emojis.
3. Provide a Devanagari virtual keyboard so users without a Hindi keyboard can type Devanagari directly.
4. Keep the UI compact — panels collapse when not in use.

## 2. Emoji Passthrough Fix

### Problem

In Hindi→Hinglish mode, `romanizeWord()` calls `Sanscript.t(w, 'devanagari', 'itrans')` on every whitespace-delimited token. Emoji characters (which have no Devanagari codepoints) may be mangled by Sanscript.

### Fix

In `src/lib/transliteration.ts`, add an early return at the top of `romanizeWord()`:

```ts
function romanizeWord(w: string): string {
  if (REV_OVERRIDES[w]) return REV_OVERRIDES[w];
  if (!/[\u0900-\u097F]/.test(w)) return w;  // no Devanagari → pass through unchanged
  // ... rest of function
}
```

This preserves emojis, Latin text, numbers, and punctuation in Hindi→Hinglish mode. Hinglish→Hinglish mode already works (emojis don't match the transliteration regex).

### Test impact

The 27 existing fixtures contain no emojis, so they remain unaffected. The guard is purely additive.

## 3. Emoji Picker

### Toggle button

New button `😊` in the toolbar, before the Download button. Click toggles a collapsible panel below the toolbar (shared area with the keyboard). When the emoji panel is open, the button gets an active state: `bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300`.

### Content

~30 emojis organized in 3 category tabs:

| Tab label (en / hi) | Emojis |
|----------------------|--------|
| Smileys / स्माइली | 😂 😍 🥰 😊 😎 🤔 😭 🙏 👍 ❤️ 🔥 ✨ 🎉 😋 🤗 |
| Gestures / इशारे | 👋 👌 ✌️ 🤝 👈 👉 👆 👇 💪 🙌 👏 🤗 🤌 ✊ 🫶 |
| Objects / वस्तुएँ | 💯 🌟 💎 🎯 📱 💻 🛵 🏍️ 🎵 📝 ✍️ 🔔 💰 🏆 🎁 |

### Behavior

- Click an emoji → inserts at cursor position in `#input-area` → panel stays open.
- Click `😊` again or click outside the panel → close.
- Focus returns to textarea after insert.

## 4. Devanagari Virtual Keyboard

### Toggle button

New button `⌨` in the toolbar, after the emoji button. Click toggles the keyboard panel in the same collapsible area. Opening one panel closes the other.

Active state: same as emoji button.

### Layout — 3 category tabs

| Tab label (en / hi) | Content |
|----------------------|---------|
| Consonants / व्यंजन | Row 1: क ख ग घ ङ · Row 2: च छ ज झ ञ · Row 3: ट ठ ड ढ ण · Row 4: त थ द ध न · Row 5: प फ ब भ म · Row 6: य र ल व श ष स ह |
| Vowels & Matras / स्वर | Row 1: अ आ इ ई उ ऊ ऋ ए ऐ ओ औ · Row 2: ा ि ी ु ू ृ े ै ो ौ ं ः ँ |
| Numbers & Punct / संख्या | Row 1: ० १ २ ३ ४ ५ ६ ७ ८ ९ · Row 2: । ॥ , . ? ! - " " ' ' ( ) |

### Behavior

- Tap a character → inserts at cursor in `#input-area` → panel stays open.
- Focus returns to textarea after insert.
- On mobile: minimum 40px touch targets for all character buttons.

## 5. Toolbar Layout

Current: Copy · Clear · Listen · Download · WhatsApp

New: **😊** · **⌨** · Copy · Clear · Listen · Download · WhatsApp

The emoji and keyboard buttons are toggle buttons. When their panel is open, they show the active state. Only one panel open at a time.

## 6. i18n Strings

| Key | en | hi |
|-----|----|----|
| `keyboard` | `Keyboard` | `कीबोर्ड` |
| `emoji` | `Emoji` | `इमोजी` |

## 7. Files Modified

| File | Change |
|------|--------|
| `src/lib/transliteration.ts` | Add Devanagari detection guard in `romanizeWord()` (~3 lines) |
| `src/components/Converter.astro` | Emoji picker panel + keyboard panel markup + toggle logic + insert-at-cursor handlers (~250 lines) |
| `src/lib/i18n.ts` | Add `keyboard` and `emoji` keys to type + both dictionaries |

No new files. No new dependencies.

## 8. Constraints

- Zero third-party JS — emoji characters are Unicode, keyboard is HTML buttons.
- Both locales get identical panels (labels change, characters don't).
- Collapsible panel area is shared between emoji and keyboard — only one open at a time.
- On mobile, panels must be finger-friendly (min 40px touch targets).
- The transliteration engine passthrough fix must not break any of the 27 existing test fixtures.
- Panel closes when user clicks outside or toggles the other panel.

## 9. Verification

After implementation:

1. `npm run test` → 27/27 (unchanged)
2. `npm run build` → 10 pages clean
3. `npm run check` → 0 errors
4. Manual smoke:
   - Type `hello 😊 world` in Hinglish→Hindi mode → emoji preserved in output
   - Paste `नमस्ते 🔥 दुनिया` in Hindi→Hinglish mode → emoji preserved, text romanized
   - Click 😊 → panel opens with 3 tabs, clicking emoji inserts at cursor
   - Click ⌨ → emoji panel closes, keyboard opens with 3 tabs, clicking character inserts
   - Toggle both buttons → only one panel open at a time
   - On 375px viewport: panels are usable, touch targets ≥ 40px
