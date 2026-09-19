// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, HI_LIVE } from './src/lib/constants';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: HI_LIVE ? undefined : (page) => !page.includes('/hi/'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-IN',
          hi: 'hi-IN',
        },
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});