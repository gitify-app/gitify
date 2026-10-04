import { defineConfig } from 'i18next-cli';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './src/renderer/i18n';

export default defineConfig({
  locales: [...SUPPORTED_LANGUAGES],
  extract: {
    input: ['src/renderer/**/*.{ts,tsx}'],
    output: 'src/renderer/i18n/locales/{{language}}.json',

    defaultNS: false,
    primaryLanguage: DEFAULT_LANGUAGE,

    sort: true,
    removeUnusedKeys: true,
    indentation: 2,
    disablePlurals: true,
  },
  lint: {
    ignore: ['**/*.test.{ts,tsx}'],
  },
});
