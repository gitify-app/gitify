export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES = ['en', 'zh-Hans'] as const;

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
    if (locale.language !== 'zh') {
      return undefined;
    }
    // An explicit script takes precedence over region; Traditional Chinese does not match.
    if (locale.script) {
      return locale.script === 'Hans' ? 'zh-Hans' : undefined;
    }
    return ['TW', 'HK', 'MO'].includes(locale.region ?? '') ? undefined : 'zh-Hans';
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
