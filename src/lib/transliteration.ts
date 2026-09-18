import Sanscript from '@indic-transliteration/sanscript';

export const FWD_OVERRIDES: Readonly<Record<string, string>> = {
  hain: 'हें', hai: 'हें', kya: 'क्या', main: 'मैं', theek: 'ठीक', thik: 'ठीक', hoon: 'हूँ',
  yeh: 'यह', kyun: 'क्यों', kyu: 'क्यों', kyon: 'क्यों', mera: 'मेरा', meri: 'मेरी',
  mere: 'मेरे', tera: 'तेरा', teri: 'तेरी', humara: 'हमारा', tumhara: 'तुम्हारा',
  kahan: 'कहाँ', nahi: 'नहीं', nahin: 'नहीं', sab: 'सब', kuch: 'कुछ', aana: 'आना',
  chahiye: 'चाहिए', roti: 'रोटी', achha: 'अच्छा', achcha: 'अच्छा', asan: 'आसान',
};

export const REV_OVERRIDES: Readonly<Record<string, string>> = {
  कहाँ: 'kahan', यह: 'yeh', वह: 'woh', हें: 'hain',
};

const HINGLISH_WORD = /^([a-zA-Z]+)([^a-zA-Z]*)$/;

export function hinglishToHindi(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (/^[A-Z][a-z]*$/.test(token)) return token;
      const m = token.match(HINGLISH_WORD);
      if (!m) return token;
      const [, word, trail] = m;
      const t = word.toLowerCase();
      if (FWD_OVERRIDES[t]) return FWD_OVERRIDES[t] + trail;
      const dev = Sanscript.t(t, 'itrans', 'devanagari');
      return dev.replace(/\u094D$/, '') + trail;
    })
    .join('');
}

function romanizeWord(w: string): string {
  if (REV_OVERRIDES[w]) return REV_OVERRIDES[w];
  let s = Sanscript.t(w, 'devanagari', 'itrans');
  s = s.replace(/\.N/g, 'n');
  s = s.replace(/M/g, (_mx, off) => (/[pPbB]/.test(s[off + 1] || '') ? 'm' : 'n'));
  s = s.replace(/A/g, 'aa').replace(/I/g, 'i').replace(/U/g, 'oo');
  return s.replace(/a$/, '');
}

export function hindiToHinglish(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => (/^\s+$/.test(token) ? token : romanizeWord(token)))
    .join('');
}
