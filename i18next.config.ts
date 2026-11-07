import { defineConfig } from 'i18next-cli';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './src/shared/i18n/types';

export default defineConfig({
  locales: [...SUPPORTED_LANGUAGES],
  extract: {
    input: ['src/renderer/**/*.{ts,tsx}', 'src/main/**/*.ts'],
    output: (language, namespace = 'translation') =>
      namespace === 'translation'
        ? `src/renderer/i18n/locales/${language}.json`
        : `src/shared/i18n/locales/${language}/${namespace}.json`,

    defaultNS: 'translation',
    primaryLanguage: DEFAULT_LANGUAGE,

    sort: true,
    removeUnusedKeys: true,
    indentation: 2,
    disablePlurals: true,
  },
  lint: {
    ignore: ['**/*.test.{ts,tsx}'],
    checkConcatenation: 'error',
  },
});
