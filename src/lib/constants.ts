export const SITE_URL = 'https://hinglish.openpixal.com';

export const HI_LIVE = true; // Task 11 flips true once /hi/ content is complete.

export const LOCALES = {
  en: { lang: 'en', hreflang: 'en-IN', prefix: '', label: 'English', name: 'English' },
  hi: { lang: 'hi', hreflang: 'hi-IN', prefix: '/hi', label: 'हिन्दी', name: 'हिन्दī' },
} as const;

export type LocaleKey = keyof typeof LOCALES;

export const NAV: Array<{
  href: Record<LocaleKey, string>;
  label: Record<LocaleKey, string>;
}> = [
  { href: { en: '/', hi: '/hi/' }, label: { en: 'Home', hi: 'होम' } },
  { href: { en: '/about/', hi: '/hi/about/' }, label: { en: 'About', hi: 'हमारे बारे में' } },
  { href: { en: '/hinglish-guide/', hi: '/hi/hinglish-guide/' }, label: { en: 'Hinglish Guide', hi: 'हिंग्लिश गाइड' } },
  { href: { en: '/contact/', hi: '/hi/contact/' }, label: { en: 'Contact', hi: 'संपर्क' } },
  { href: { en: '/privacy-policy/', hi: '/hi/privacy-policy/' }, label: { en: 'Privacy', hi: 'गोपनीयता' } },
  { href: { en: '/terms/', hi: '/hi/terms/' }, label: { en: 'Terms', hi: 'शर्तें' } },
];

export const CRUMBS: Record<string, { en: string[]; hi: string[] }> = {
  '/about/': { en: ['About'], hi: ['हमारे बारे में'] },
  '/hinglish-guide/': { en: ['Hinglish Guide'], hi: ['हिंग्लिश गाइड'] },
  '/contact/': { en: ['Contact'], hi: ['संपर्क'] },
  '/privacy-policy/': { en: ['Privacy Policy'], hi: ['गोपनीयता नीति'] },
  '/terms/': { en: ['Terms of Use'], hi: ['उपयोग की शर्तें'] },
};

export function crumbsFor(path: string) {
  const key = path.replace(/^\/hi/, '') || '/';
  return CRUMBS[key] ?? null;
}

export const KEYWORDS = {
  primary: 'hinglish to hindi,hinglish to hindi converter,hinglish to hindi translation,hinglish to hindi translate,hinglish to hindi google translate',
  typing: 'hinglish typing,hinglish caption generator,hinglish words,hinglish examples',
  reverse: 'hindi to hinglish,hinglish means,hinglish app',
} as const;

export const SEO_DEFAULTS: Record<LocaleKey, {
  title: string; description: string;
}> = {
  en: {
    title: 'Hinglish to Hindi Converter — Type & Get Devanagari Instantly',
    description: 'Free Hinglish to Hindi converter. Type Roman Hinglish like "aap kaise hain" and get instant Devanagari Hindi (आप कैसे हें). Hindi to Hinglish reverse, copy, listen & WhatsApp share.',
  },
  hi: {
    title: 'हिंग्लिश टू हिंदी कन्वर्टर — तुरंत देवनागरी में टाइप करें',
    description: 'फ्री हिंग्लिश टू हिंदी कन्वर्टर। रोमन हिंग्लिश में टाइप करें और तुरंत देवनागरी हिंदी पाएँ। हिंदी से हिंग्लिश, कॉपी, सुनें और व्हाट्सऐप पर भेजें।',
  },
};