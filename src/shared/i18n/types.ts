export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES = ['en'] as const;

/** The supported application languages. */
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageState {
  language: Language;
  preference: Language | null;
}

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}

export function matchLanguage(value: unknown): Language | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().replaceAll('_', '-');
  if (!normalized) {
    return undefined;
  }
  try {
    const locale = new Intl.Locale(normalized);
    if (locale.language === 'en') {
      return 'en';
    }
    return undefined;
  } catch {
    return undefined;
  }
}
export function resolveLanguage(
  preference: Language | null,
  systemLanguages: readonly string[],
): Language {
  return preference ?? systemLanguages.map(matchLanguage).find(isLanguage) ?? DEFAULT_LANGUAGE;
}
