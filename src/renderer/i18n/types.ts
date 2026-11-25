export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES = ['en'] as const;

/**
 * The different types of allowed languages.
 */
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
};

interface LanguageOption {
  label: string;
  value: Language;
}

export const LANGUAGES: LanguageOption[] = Object.entries(LANGUAGE_LABELS).map(
  ([value, label]) => ({ label, value: value as Language }),
);
