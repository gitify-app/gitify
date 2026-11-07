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

import { getLanguageState, i18n, initializeMainLanguage, setNativeLanguage } from './language';

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
  it.each([['en-GB', 'en']] as const)(
    'resolves %s without persisting an automatic choice',
    (system, language) => {
      environment.languages = [system];
      initializeMainLanguage();
      expect(getLanguageState()).toEqual({ language, preference: null });
      expect(i18n.language).toBe(language);
      expect(fs.existsSync(filename)).toBe(false);
      expect(logWarn).not.toHaveBeenCalled();
    },
  );

  it.each(['en'] as const)('restores explicit %s before native UI starts', (language) => {
    expect(setNativeLanguage(language)).toEqual({ language, preference: language });
    expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual({ preference: language });
    environment.languages = ['fr'];
    initializeMainLanguage();
    expect(getLanguageState()).toEqual({ language, preference: language });
    expect(i18n.language).toBe(language);
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
});
