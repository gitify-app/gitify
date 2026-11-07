import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

import { createInstance } from 'i18next';

import enNative from '../shared/i18n/locales/en/native.json';
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
  type LanguageState,
  resolveLanguage,
} from '../shared/i18n/types';
import { logWarn, toError } from '../shared/logger';

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

let state: LanguageState = { language: DEFAULT_LANGUAGE, preference: null };

const preferencePath = () => path.join(app.getPath('userData'), 'language.json');

function applyPreference(preference: Language | null): void {
  let language = preference ?? DEFAULT_LANGUAGE;
  if (preference === null) {
    try {
      language = resolveLanguage(null, app.getPreferredSystemLanguages());
    } catch (error) {
      logWarn('language', 'Unable to read system language; using English', [
        toError(error).message,
      ]);
    }
  }
  state = { language, preference };
  void i18n.changeLanguage(language);
}

export function initializeMainLanguage(): void {
  let preference: Language | null = null;
  try {
    const stored: unknown = JSON.parse(fs.readFileSync(preferencePath(), 'utf8'));
    if (
      !stored ||
      typeof stored !== 'object' ||
      !('preference' in stored) ||
      (stored.preference !== null && !isLanguage(stored.preference))
    ) {
      throw new Error('Invalid language preference file');
    }
    preference = stored.preference;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      logWarn('language', 'Unable to read language preference; using system language', [
        toError(error).message,
      ]);
    }
  }
  applyPreference(preference);
}

export function getLanguageState(): LanguageState {
  return { ...state };
}

/** Persist the choice atomically before changing either process's language. */
export function setNativeLanguage(language: unknown): LanguageState {
  if (!isLanguage(language)) {
    throw new Error('Invalid language preference');
  }
  const filename = preferencePath();
  const temporary = `${filename}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(temporary, JSON.stringify({ preference: language }), { mode: 0o600 });
    fs.renameSync(temporary, filename);
  } catch (error) {
    try {
      fs.rmSync(temporary, { force: true });
    } catch (cleanupError) {
      logWarn('language', 'Unable to remove temporary language preference', [
        toError(cleanupError).message,
      ]);
    }
    throw error;
  }
  applyPreference(language);
  return getLanguageState();
}

export function resetLanguagePreference(): void {
  fs.rmSync(preferencePath(), { force: true });
  applyPreference(null);
}
