# Emoji & Devanagari Virtual Keyboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add emoji passthrough, an emoji picker with category tabs, and a Devanagari virtual keyboard with category tabs to the Hinglish converter.

**Architecture:** Three additions to the existing Converter.astro island: a Devanagari detection guard in the transliteration engine, an emoji picker panel with 3 tabs, and a Devanagari keyboard panel with 3 tabs. Both panels share one collapsible area below the toolbar. All vanilla TS, zero dependencies.

**Tech Stack:** Astro 5 island (`Converter.astro`), vanilla TypeScript, `src/lib/i18n.ts` dictionaries, `src/lib/transliteration.ts`, Tailwind CSS 4.

## Global Constraints

- Zero third-party JS — emoji characters are Unicode, keyboard is HTML buttons.
- Both locales (EN + HI) get identical panels (labels change, characters don't).
- Collapsible panel area is shared between emoji and keyboard — only one open at a time.
- On mobile, panels must be finger-friendly (min 40px touch targets).
- The transliteration engine passthrough fix must not break any of the 27 existing test fixtures.
- Every task ends with a commit. Commit messages follow conventional format.
- Node >= 22 required. All commands run from repo root.
- Repository is on `master` branch.

---

### Task 1: Add i18n strings for keyboard and emoji

**Files:**
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: 2 new keys in `UiStrings` type and both locale dictionaries — `keyboard`, `emoji`. These are consumed by Converter.astro in Tasks 3-4.

- [ ] **Step 1: Add new keys to the `UiStrings` type**

In `src/lib/i18n.ts`, add two new keys to the `UiStrings` type (after `pastedToast`):

```ts
  keyboard: string;
  emoji: string;
```

- [ ] **Step 2: Add English values**

In the `en` dictionary, add after the `pastedToast` line:

```ts
    keyboard: 'Keyboard',
    emoji: 'Emoji',
```

- [ ] **Step 3: Add Hindi values**

In the `hi` dictionary, add after the `pastedToast` line:

```ts
    keyboard: 'कीबोर्ड',
    emoji: 'इमोजी',
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat(i18n): add keyboard and emoji string keys"
```

---

### Task 2: Emoji passthrough fix in transliteration engine

**Files:**
- Modify: `src/lib/transliteration.ts`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `romanizeWord()` now returns non-Devanagari tokens unchanged (preserves emojis, Latin, numbers). This fixes Hindi→Hinglish mode for emoji input.

- [ ] **Step 1: Add Devanagari detection guard**

In `src/lib/transliteration.ts`, add an early return at the top of `romanizeWord()` (after the `REV_OVERRIDES` check on line 35):

```ts
function romanizeWord(w: string): string {
  if (REV_OVERRIDES[w]) return REV_OVERRIDES[w];
  if (!/[\u0900-\u097F]/.test(w)) return w;  // no Devanagari → pass through unchanged
  let s = Sanscript.t(w, 'devanagari', 'itrans');
  // ... rest unchanged
```

- [ ] **Step 2: Run tests to verify no regression**

Run: `npm run test`
Expected: 27/27 passing (all existing fixtures unaffected).

- [ ] **Step 3: Commit**

```bash
git add src/lib/transliteration.ts
git commit -m "fix(transliteration): preserve emojis and non-Devanagari text in Hindi→Hinglish mode"
```

---

### Task 3: Add emoji picker panel to Converter

**Files:**
- Modify: `src/components/Converter.astro` (markup + script)

**Interfaces:**
- Consumes: `s.emoji` from i18n (Task 1), existing `showToast`, `inputEl`, `render` functions
- Produces: a `#emoji-btn` toggle button, a `#emoji-panel` collapsible div with 3 category tabs, click-to-insert behavior

- [ ] **Step 1: Add emoji toggle button to toolbar**

In `Converter.astro`, insert a new button **before** the Copy button (`#copy-btn`), inside the `<div class="mt-3 flex flex-wrap gap-2">`:

```html
    <button id="emoji-btn" type="button" aria-label={s.emoji} aria-expanded="false" aria-controls="emoji-panel" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">😊</button>
```

- [ ] **Step 2: Add emoji panel markup**

After the toolbar `<div>` (after line 31, before the `<p>` demo note), add the collapsible panel:

```html
  <div id="emoji-panel" class="hidden mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
    <div class="mb-2 flex gap-1 border-b border-slate-200 pb-2 dark:border-slate-600">
      <button data-emoji-tab="smileys" type="button" class="rounded px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">Smileys</button>
      <button data-emoji-tab="gestures" type="button" class="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">Gestures</button>
      <button data-emoji-tab="objects" type="button" class="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">Objects</button>
    </div>
    <div data-emoji-grid="smileys" class="grid grid-cols-8 gap-1"></div>
    <div data-emoji-grid="gestures" class="hidden grid grid-cols-8 gap-1"></div>
    <div data-emoji-grid="objects" class="hidden grid grid-cols-8 gap-1"></div>
  </div>
```

Note: `sm:grid-cols-15` needs a Tailwind config extension. Use `grid-cols-8` for mobile and add a custom `grid-template-columns: repeat(15, minmax(0, 1fr))` via an inline style or use `grid-cols-[repeat(15,minmax(0,1fr))]` arbitrary class for desktop. Simpler: just use `grid-cols-8` everywhere — 30 emojis in 8 cols = 4 rows, fine on all screens.

- [ ] **Step 3: Add emoji data and DOM refs in script**

In the `<script>` block, after the existing DOM refs (after `const toast = ...`), add:

```ts
    const emojiBtn = document.getElementById('emoji-btn') as HTMLButtonElement;
    const emojiPanel = document.getElementById('emoji-panel') as HTMLElement;
    const keyboardBtn = document.getElementById('keyboard-btn') as HTMLButtonElement;
    const keyboardPanel = document.getElementById('keyboard-panel') as HTMLElement;

    const EMOJIS: Record<string, string[]> = {
      smileys: ['😂','😍','🥰','😊','😎','🤔','😭','🙏','👍','❤️','🔥','✨','🎉','😋','🤗'],
      gestures: ['👋','👌','✌️','🤝','👈','👉','👆','👇','💪','🙌','👏','🤌','✊','🫶','✋'],
      objects: ['💯','🌟','💎','🎯','📱','💻','🛵','🏍️','🎵','📝','✍️','🔔','💰','🏆','🎁'],
    };
```

- [ ] **Step 4: Populate emoji grids on load**

After the emoji data, add a function to populate the grids:

```ts
    Object.entries(EMOJIS).forEach(([category, emojis]) => {
      const grid = emojiPanel.querySelector(`[data-emoji-grid="${category}"]`);
      if (!grid) return;
      emojis.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emoji;
        btn.className = 'flex h-10 w-10 items-center justify-center rounded text-xl hover:bg-slate-200 dark:hover:bg-slate-700';
        btn.addEventListener('click', () => {
          inputEl.focus();
          const start = inputEl.selectionStart ?? inputEl.value.length;
          inputEl.setRangeText(emoji, start, start, 'end');
          render();
        });
        grid.appendChild(btn);
      });
    });
```

- [ ] **Step 5: Add emoji panel toggle logic**

```ts
    let activePanel: 'emoji' | 'keyboard' | null = null;

    const closeAllPanels = () => {
      emojiPanel.classList.add('hidden');
      keyboardPanel.classList.add('hidden');
      emojiBtn.setAttribute('aria-expanded', 'false');
      keyboardBtn.setAttribute('aria-expanded', 'false');
      emojiBtn.classList.remove('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
      keyboardBtn.classList.remove('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
      activePanel = null;
    };

    emojiBtn.addEventListener('click', () => {
      if (activePanel === 'emoji') { closeAllPanels(); return; }
      closeAllPanels();
      emojiPanel.classList.remove('hidden');
      emojiBtn.setAttribute('aria-expanded', 'true');
      emojiBtn.classList.add('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
      activePanel = 'emoji';
    });
```

- [ ] **Step 6: Add emoji tab switching**

```ts
    emojiPanel.querySelectorAll('[data-emoji-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-emoji-tab')!;
        emojiPanel.querySelectorAll('[data-emoji-tab]').forEach((t) => {
          t.className = 'rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700';
        });
        tab.className = 'rounded px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
        emojiPanel.querySelectorAll('[data-emoji-grid]').forEach((g) => g.classList.add('hidden'));
        emojiPanel.querySelector(`[data-emoji-grid="${target}"]`)?.classList.remove('hidden');
      });
    });
```

- [ ] **Step 7: Add click-outside to close panels**

```ts
    document.addEventListener('mousedown', (e) => {
      if (activePanel && !emojiPanel.contains(e.target as Node) && !keyboardPanel.contains(e.target as Node)
        && e.target !== emojiBtn && e.target !== keyboardBtn) {
        closeAllPanels();
      }
    });
```

- [ ] **Step 8: Build + verify**

Run: `npm run build`
Expected: 10 pages, clean exit 0.
Run: `npm run test`
Expected: 27/27.
Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/Converter.astro
git commit -m "feat(converter): add emoji picker panel with category tabs"
```

---

### Task 4: Add Devanagari virtual keyboard panel

**Files:**
- Modify: `src/components/Converter.astro` (markup + script)

**Interfaces:**
- Consumes: `s.keyboard` from i18n (Task 1), `closeAllPanels`, `activePanel` from Task 3, `inputEl`, `render`
- Produces: a `#keyboard-btn` toggle button, a `#keyboard-panel` collapsible div with 3 category tabs, click-to-insert behavior

- [ ] **Step 1: Add keyboard toggle button to toolbar**

In `Converter.astro`, insert a new button **after** the emoji button (`#emoji-btn`), before the Copy button:

```html
    <button id="keyboard-btn" type="button" aria-label={s.keyboard} aria-expanded="false" aria-controls="keyboard-panel" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">⌨</button>
```

- [ ] **Step 2: Add keyboard panel markup**

After the emoji panel div, add the keyboard panel:

```html
  <div id="keyboard-panel" class="hidden mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
    <div class="mb-2 flex gap-1 border-b border-slate-200 pb-2 dark:border-slate-600">
      <button data-kb-tab="consonants" type="button" class="rounded px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">Consonants</button>
      <button data-kb-tab="vowels" type="button" class="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">Vowels & Matras</button>
      <button data-kb-tab="numbers" type="button" class="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">Numbers & Punct</button>
    </div>
    <div data-kb-grid="consonants" class="flex flex-wrap gap-1"></div>
    <div data-kb-grid="vowels" class="hidden flex flex-wrap gap-1"></div>
    <div data-kb-grid="numbers" class="hidden flex flex-wrap gap-1"></div>
  </div>
```

- [ ] **Step 3: Add keyboard data and populate grids in script**

In the `<script>` block, after the emoji data/population code, add:

```ts
    const KB_CHARS: Record<string, string[]> = {
      consonants: [
        'क','ख','ग','घ','ङ',
        'च','छ','ज','�','ञ',
        'ट','ठ','ड','ढ','ण',
        'त','थ','द','ध','न',
        'प','फ','ब','भ','म',
        'य','र','ल','व','श','ष','स','ह',
      ],
      vowels: [
        'अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ',
        'ा','ि','ी','ु','ू','ृ','े','ै','ो','ौ','ं','ः','ँ',
      ],
      numbers: [
        '०','१','२','३','४','५','६','७','८','९',
        '।','॥',',','.','?','!','-','"',"'",'(','  )',
      ],
    };

    Object.entries(KB_CHARS).forEach(([category, chars]) => {
      const grid = keyboardPanel.querySelector(`[data-kb-grid="${category}"]`);
      if (!grid) return;
      chars.forEach((ch) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = ch;
        btn.className = 'flex h-10 min-w-[2.5rem] items-center justify-center rounded border border-slate-200 bg-white px-2 text-base font-medium hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700';
        btn.addEventListener('click', () => {
          inputEl.focus();
          const start = inputEl.selectionStart ?? inputEl.value.length;
          inputEl.setRangeText(ch, start, start, 'end');
          render();
        });
        grid.appendChild(btn);
      });
    });
```

- [ ] **Step 4: Add keyboard panel toggle logic**

```ts
    keyboardBtn.addEventListener('click', () => {
      if (activePanel === 'keyboard') { closeAllPanels(); return; }
      closeAllPanels();
      keyboardPanel.classList.remove('hidden');
      keyboardBtn.setAttribute('aria-expanded', 'true');
      keyboardBtn.classList.add('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
      activePanel = 'keyboard';
    });
```

- [ ] **Step 5: Add keyboard tab switching**

```ts
    keyboardPanel.querySelectorAll('[data-kb-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-kb-tab')!;
        keyboardPanel.querySelectorAll('[data-kb-tab]').forEach((t) => {
          t.className = 'rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700';
        });
        tab.className = 'rounded px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
        keyboardPanel.querySelectorAll('[data-kb-grid]').forEach((g) => g.classList.add('hidden'));
        keyboardPanel.querySelector(`[data-kb-grid="${target}"]`)?.classList.remove('hidden');
      });
    });
```

- [ ] **Step 6: Build + verify**

Run: `npm run build`
Expected: 10 pages, clean exit 0.
Run: `npm run test`
Expected: 27/27.
Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Converter.astro
git commit -m "feat(converter): add devanagari virtual keyboard with category tabs"
```

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build + check + test**

Run:
```
npm run check
npm run test
npm run build
```
Expected: 0 errors, 27/27 tests, 10 pages built cleanly.

- [ ] **Step 2: Verify emoji passthrough in Hindi→Hinglish mode**

Run a quick Node check:
```
node -e "import('./src/lib/transliteration.ts').then(m => { console.log(m.hindiToHinglish('नमस्ते 🔥 दुनिया')); })"
```
Wait — this won't work directly (TS import). Instead, verify via the built output: the `dist/_astro/*.js` bundle should contain the Devanagari guard regex `[\u0900-\u097F]`.

Run: `Select-String -Path dist\_astro\*.js -Pattern '0900' -AllMatches | ForEach-Object { $_.Matches } | Measure-Object`
Expected: ≥ 1 match (the guard regex is in the bundle).

- [ ] **Step 3: Verify emoji + keyboard panels render on both locales**

Run:
```
Write-Output "EN emoji-btn:"; (Select-String -Path dist\index.html -Pattern 'emoji-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
Write-Output "HI emoji-btn:"; (Select-String -Path dist\hi\index.html -Pattern 'emoji-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
Write-Output "EN keyboard-btn:"; (Select-String -Path dist\index.html -Pattern 'keyboard-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
Write-Output "HI keyboard-btn:"; (Select-String -Path dist\hi\index.html -Pattern 'keyboard-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
```
Expected: 1 on each.

- [ ] **Step 4: Verify i18n strings in bundles**

Run:
```
$files = Get-ChildItem dist\_astro\*.js
foreach ($f in $files) { $c = [System.IO.File]::ReadAllText($f.FullName); if ($c -match 'कीबोर्ड') { Write-Output "$($f.Name): has कीबोर्ड" }; if ($c -match 'इमोजी') { Write-Output "$($f.Name): has इमोजी" } }
```
Expected: at least one file matches each.
