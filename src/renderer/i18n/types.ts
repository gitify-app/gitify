import type { Language } from '../../shared/i18n/types';

export { DEFAULT_LANGUAGE, type Language, SUPPORTED_LANGUAGES } from '../../shared/i18n/types';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
};

interface LanguageOption {
  label: string;
  value: Language;
}

export const LANGUAGES: LanguageOption[] = Object.entries(LANGUAGE_LABELS).map(
  ([value, label]) => ({ label, value: value as Language }),
);
