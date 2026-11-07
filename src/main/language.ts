import { createInstance } from 'i18next';

import enNative from '../shared/i18n/locales/en/native.json';
import { DEFAULT_LANGUAGE } from '../shared/i18n/types';

export const i18n = createInstance();
void i18n.init({
  resources: {
    en: { native: enNative },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  initAsync: false,
  interpolation: { escapeValue: false },
});
