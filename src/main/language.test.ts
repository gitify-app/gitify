import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { app } from 'electron';

import { logWarn } from '../shared/logger';

const environment = vi.hoisted(() => ({ languages: ['en-GB'], directory: '' }));
vi.mock('electron', () => ({
  app: {
    getPath: () => environment.directory,
    getPreferredSystemLanguages: vi.fn(() => environment.languages),
  },
}));
vi.mock('../shared/logger', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../shared/logger')>()),
  logWarn: vi.fn(),
}));

import {
  getLanguageState,
  i18n,
  initializeMainLanguage,
  resetLanguagePreference,
  setNativeLanguage,
} from './language';

let filename: string;
beforeEach(() => {
  environment.directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gitify-language-'));
  environment.languages = ['en-GB'];
  filename = path.join(environment.directory, 'language.json');
  initializeMainLanguage();
});
afterEach(() => {
  fs.rmSync(environment.directory, { recursive: true, force: true });
});

describe('native language authority', () => {
  it.each([
    ['en-GB', 'en'],
    ['zh-CN', 'zh-Hans'],
  ] as const)('resolves %s without persisting an automatic choice', (system, language) => {
    environment.languages = [system];
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language, preference: null });
    expect(i18n.language).toBe(language);
    expect(fs.existsSync(filename)).toBe(false);
    expect(logWarn).not.toHaveBeenCalled();
  });

  it.each(['en', 'zh-Hans'] as const)(
    'restores explicit %s before native UI starts',
    (language) => {
      expect(setNativeLanguage(language)).toEqual({ language, preference: language });
      expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: language });
      environment.languages = [language === 'en' ? 'zh-CN' : 'en-US'];
      initializeMainLanguage();
      expect(getLanguageState()).toEqual({ language, preference: language });
      expect(i18n.language).toBe(language);
    },
  );

  it('resolves a stored null preference from the current OS', () => {
    fs.writeFileSync(filename, JSON.stringify({ preference: null }));
    environment.languages = ['zh-Hant', 'zh-SG'];
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language: 'zh-Hans', preference: null });
    expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: null });
  });

  it.each(['not json', '{}', 'null', '{"preference":"fr"}'])(
    'falls back to the OS and diagnoses corrupt configuration %s',
    (contents) => {
      fs.writeFileSync(filename, contents);
      environment.languages = ['zh-CN'];
      initializeMainLanguage();
      expect(getLanguageState()).toEqual({ language: 'zh-Hans', preference: null });
      expect(logWarn).toHaveBeenCalled();
      expect(fs.readFileSync(filename, 'utf8')).toBe(contents);
    },
  );

  it('keeps startup available when reading the preference fails', () => {
    vi.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      throw new Error('read failed');
    });
    environment.languages = ['zh-CN'];
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language: 'zh-Hans', preference: null });
    expect(logWarn).toHaveBeenCalled();
  });

  it('chooses the main-process default if system language lookup fails', () => {
    vi.mocked(app.getPreferredSystemLanguages).mockImplementationOnce(() => {
      throw new Error('system language failed');
    });
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language: 'en', preference: null });
    expect(logWarn).toHaveBeenCalled();
  });

  it.each([undefined, null, '', 'en-US', 'zh-CN', 'xx', 12, {}])(
    'rejects invalid explicit preference %s without writing',
    (value) => {
      expect(() => setNativeLanguage(value)).toThrow('Invalid language preference');
      expect(getLanguageState()).toEqual({ language: 'en', preference: null });
      expect(fs.existsSync(filename)).toBe(false);
    },
  );

  it('persists before notifying native UI of a language change', () => {
    const changed = vi.fn(() => {
      expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: 'zh-Hans' });
    });
    i18n.on('languageChanged', changed);
    try {
      setNativeLanguage('zh-Hans');
      expect(changed).toHaveBeenCalledWith('zh-Hans');
    } finally {
      i18n.off('languageChanged', changed);
    }
  });

  it.each(['writeFileSync', 'renameSync'] as const)(
    'preserves the previous file and active language when %s fails',
    (operation) => {
      setNativeLanguage('en');
      vi.spyOn(fs, operation).mockImplementationOnce(() => {
        throw new Error('save failed');
      });
      expect(() => setNativeLanguage('zh-Hans')).toThrow('save failed');
      expect(getLanguageState()).toEqual({ language: 'en', preference: 'en' });
      expect(i18n.language).toBe('en');
      expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: 'en' });
      expect(fs.readdirSync(environment.directory)).toEqual(['language.json']);
    },
  );

  it('clears the preference for the next startup when reset succeeds', () => {
    setNativeLanguage('zh-Hans');
    resetLanguagePreference();
    expect(fs.existsSync(filename)).toBe(false);
    expect(getLanguageState()).toEqual({ language: 'en', preference: null });
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language: 'en', preference: null });
  });

  it('preserves the preference and active language when reset cannot remove the file', () => {
    setNativeLanguage('zh-Hans');
    vi.spyOn(fs, 'rmSync').mockImplementationOnce(() => {
      throw new Error('remove failed');
    });
    expect(() => resetLanguagePreference()).toThrow('remove failed');
    expect(getLanguageState()).toEqual({ language: 'zh-Hans', preference: 'zh-Hans' });
    expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: 'zh-Hans' });
  });
});
