export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES = ['en'] as const;

/** The supported application languages. */
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
