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
  download: string;
  emptyDownload: string;
  pastedToast: (count: number) => string;
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
    download: 'Download',
    emptyDownload: 'Nothing to download',
    pastedToast: (count: number) => `${count} words converted from pasted text`,
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
    download: 'डाउनलोड',
    emptyDownload: 'डाउनलोड के लिए कुछ नहीं',
    pastedToast: (count: number) => `${count} शब्द पेस्ट किए गए टेक्स्ट से बदले`,
  },
};