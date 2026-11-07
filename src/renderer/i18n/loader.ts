import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import { DEFAULT_LANGUAGE, type Language, SUPPORTED_LANGUAGES } from './types';

// Locales
import enTranslation from './locales/en.json';

const locales: Record<Language, typeof enTranslation> = {
  en: enTranslation,
};

const resources = Object.fromEntries(
  Object.entries(locales).map(([lng, data]) => [lng, { translation: data }]),
) as Record<Language, { translation: typeof enTranslation }>;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  load: 'currentOnly',
  initAsync: false,
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

/**
 * Apply the main process's persisted or system-resolved language before rendering.
 *
 * @throws If the main process cannot provide its language state.
 */
export async function initializeLanguage(): Promise<void> {
  const { language } = await window.gitify.language.get();
  await i18n.changeLanguage(language);
}

/** Read the current language supplied by the main process. */
export function loadLanguageLocale(): Language {
  return i18n.language as Language;
}

/**
 * Ask the main process to persist the choice before changing the renderer language.
 *
 * @param language - The supported language selected by the user.
 * @throws If persistence or language synchronization fails; the current language is retained.
 */
export async function setLanguage(language: Language): Promise<void> {
  const state = await window.gitify.language.set(language);
  await i18n.changeLanguage(state.language);
}

export default i18n;
