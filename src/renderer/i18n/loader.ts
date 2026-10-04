import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { Constants } from '../constants';

import { DEFAULT_LANGUAGE, type Language } from './types';

// Locales
import enTranslation from './locales/en.json';

const locales: Record<Language, typeof enTranslation> = {
  en: enTranslation,
};

const resources = Object.fromEntries(
  Object.entries(locales).map(([lng, data]) => [lng, { translation: data }]),
) as Record<Language, { translation: typeof enTranslation }>;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      // keys or params to lookup language from
      lookupLocalStorage: Constants.STORAGE.LANGUAGE,
      // cache user language
      caches: ['localStorage'],
    },
  });

export function loadLanguageLocale(): Language {
  const existing = localStorage.getItem(Constants.STORAGE.LANGUAGE);
  const language = (existing as Language) || DEFAULT_LANGUAGE;

  return language;
}

export default i18n;
