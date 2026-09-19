# Converter UX Upgrades — Paste Detection & Download

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smart paste detection (auto-convert large pastes with toast feedback) and a download-as-txt button to the Hinglish converter, closing the two highest-impact feature gaps vs IndiaTyping.com.

**Architecture:** Two additions to the existing `Converter.astro` island: a `paste` event listener on the textarea, and a new toolbar button. Both are vanilla TS, client-side only, zero dependencies. i18n strings added to the shared `i18n.ts` dictionaries.

**Tech Stack:** Astro 5 island (`Converter.astro`), vanilla TypeScript, `src/lib/i18n.ts` dictionaries, Tailwind CSS 4.

## Global Constraints

- Zero third-party JS — download uses native `Blob` + `URL.createObjectURL` only.
- Both locales (EN + HI) get identical functionality.
- The existing live-conversion behavior is never altered — paste detection is purely additive.
- Download produces UTF-8 `.txt` without BOM.
- No new files, no new dependencies, no changes to the transliteration engine.
- Every task ends with a commit. Commit messages follow conventional format.
- Dev server / preview must be launched via the background-server plugin.
- Node >= 22 required. All commands run from repo root.
- Repository is on `master` branch.

---

### Task 1: Add i18n strings for paste toast and download

**Files:**
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: 3 new keys in `UiStrings` type and both locale dictionaries — `download`, `pastedToast(count)`, `emptyDownload`. These are consumed by Converter.astro in Tasks 2-4.

- [ ] **Step 1: Add new keys to the `UiStrings` type**

In `src/lib/i18n.ts`, add three new keys to the `UiStrings` type (after `demoNote`):

```ts
  download: string;
  emptyDownload: string;
  pastedToast: (count: number) => string;
```

- [ ] **Step 2: Add English values**

In the `en` dictionary, add after the `demoNote` line:

```ts
    download: 'Download',
    emptyDownload: 'Nothing to download',
    pastedToast: (count: number) => `${count} words converted from pasted text`,
```

- [ ] **Step 3: Add Hindi values**

In the `hi` dictionary, add after the `demoNote` line:

```ts
    download: 'डाउनलोड',
    emptyDownload: 'डाउनलोड के लिए कुछ नहीं',
    pastedToast: (count: number) => `${count} शब्द पेस्ट किए गए टेक्स्ट से बदले`,
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npm run check`
Expected: 0 errors (the new function-typed key must satisfy `UiStrings`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat(i18n): add download and paste toast string keys"
```

---

### Task 2: Add download button markup + click handler

**Files:**
- Modify: `src/components/Converter.astro` (markup + script)

**Interfaces:**
- Consumes: `s.download` and `s.emptyDownload` from i18n (added in Task 1)
- Produces: a new `#download-btn` button in the toolbar row; a click handler that triggers a `.txt` file download of the output text

- [ ] **Step 1: Add download button to toolbar markup**

In `Converter.astro`, insert a new button **before** the WhatsApp link (`#wa-btn`), inside the `<div class="mt-3 flex flex-wrap gap-2">`:

```html
    <button id="download-btn" type="button" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{s.download}</button>
```

- [ ] **Step 2: Add download button to the script element's DOM references**

After the existing `const waBtn = ...` line (currently line 51), add:

```ts
    const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
```

- [ ] **Step 3: Add the download click handler**

After the `listenBtn` event listener block (after line 108), add:

```ts
    downloadBtn.addEventListener('click', () => {
      const text = outputEl.textContent || '';
      if (!text) {
        showToast(s.emptyDownload);
        return;
      }
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hinglish-output.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
```

- [ ] **Step 4: Build + verify**

Run: `npm run build`
Expected: 10 pages, clean exit 0.
Verify in built output: `Select-String -Path dist\index.html -Pattern 'download-btn' -AllMatches | ForEach-Object { $_.Matches }` should return 1 match.

- [ ] **Step 5: Commit**

```bash
git add src/components/Converter.astro
git commit -m "feat(converter): add download-as-txt button with Blob URL"
```

---

### Task 3: Add paste event listener with smart detection

**Files:**
- Modify: `src/components/Converter.astro` (script only)

**Interfaces:**
- Consumes: `s.pastedToast(count)` from i18n (added in Task 1), `showToast` and `render` functions (already in Converter.astro script)
- Produces: a `paste` event listener on `#input-area` that detects large pastes, converts them, and shows a word-count toast

- [ ] **Step 1: Add paste event listener**

In `Converter.astro`'s `<script>` block, after the existing `inputEl.addEventListener('input', render);` line (currently line 72), add:

```ts
    inputEl.addEventListener('paste', (e) => {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted.length >= 50) {
        e.preventDefault();
        inputEl.value = pasted;
        render();
        const wordCount = pasted.trim().split(/\s+/).length;
        showToast(s.pastedToast(wordCount));
      }
    });
```

- [ ] **Step 2: Build + verify**

Run: `npm run build`
Expected: 10 pages, clean exit 0.
Run: `npm run test`
Expected: 27/27 passing (unchanged).
Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Converter.astro
git commit -m "feat(converter): add smart paste detection with word-count toast"
```

---

### Task 4: Final verification + integration test

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: completed Tasks 1-3
- Produces: confirmation that everything builds and the new features are wired correctly

- [ ] **Step 1: Full build + check + test**

Run:
```
npm run check
npm run test
npm run build
```
Expected: 0 errors, 27/27 tests, 10 pages built cleanly.

- [ ] **Step 2: Verify download button renders on both locales**

Run:
```powershell
Write-Output "EN:"; (Select-String -Path dist\index.html -Pattern 'download-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
Write-Output "HI:"; (Select-String -Path dist\hi\index.html -Pattern 'download-btn' -AllMatches | ForEach-Object { $_.Matches }).Count
```
Expected: 1 on each.

- [ ] **Step 3: Verify paste listener exists in both locale bundles**

Run:
```powershell
Write-Output "EN paste listener:"; (Select-String -Path dist\_astro\*.js -Pattern "clipboardData" -AllMatches | Measure-Object).Count
Write-Output "HI paste listener:"; (Select-String -Path dist\_astro\*.js -Pattern "clipboardData" -AllMatches | Measure-Object).Count
```
Expected: ≥ 1 match in the JS bundles (both locales share the same bundled island).

- [ ] **Step 4: Verify i18n strings present in locale bundles**

Run:
```powershell
Write-Output "EN download string:"; (Select-String -Path dist\_astro\*.js -Pattern '"Download"' -AllMatches | Measure-Object).Count
Write-Output "HI download string:"; (Select-String -Path dist\_astro\*.js -Pattern '"डाउनलोड"' -AllMatches | Measure-Object).Count
```
Expected: ≥ 1 each.

- [ ] **Step 5: Commit verification doc (if gate evidence needed)**

No commit needed — Tasks 1-3 commits are the record. This step is gate evidence only.
