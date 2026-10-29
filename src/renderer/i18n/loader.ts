import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { Constants } from '../constants';

import { DEFAULT_LANGUAGE, type Language, SUPPORTED_LANGUAGES } from './types';

// Locales
import enTranslation from './locales/en.json';

const locales: Record<Language, typeof enTranslation> = {
  en: enTranslation,
};

const resources = Object.fromEntries(
  Object.entries(locales).map(([lng, data]) => [lng, { translation: data }]),
) as Record<Language, { translation: typeof enTranslation }>;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // Resolve regional OS locales (e.g. `fr-FR`) to their base language.
    load: 'languageOnly',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      // keys or params to lookup language from
      lookupLocalStorage: Constants.STORAGE.LANGUAGE,
      // Only an explicit choice is persisted (see `setLanguage`), so the app
      // keeps following the OS language until the user picks one.
      caches: [],
    },
  });

function isSupportedLanguage(value: string | null | undefined): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

/**
 * The language currently in effect: the user's saved choice when supported,
 * otherwise the language i18next resolved from the OS.
 */
export function loadLanguageLocale(): Language {
  const stored = localStorage.getItem(Constants.STORAGE.LANGUAGE);
  if (isSupportedLanguage(stored)) {
    return stored;
  }

  return isSupportedLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;
}

/**
 * Switch the interface language and persist it as the user's explicit choice.
 */
export async function setLanguage(language: Language): Promise<void> {
  localStorage.setItem(Constants.STORAGE.LANGUAGE, language);
  await i18n.changeLanguage(language);
}

export default i18n;
