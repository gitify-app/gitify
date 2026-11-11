import type { LanguageState } from '../../shared/i18n/types';

import { DEFAULT_LANGUAGE, LANGUAGES, SUPPORTED_LANGUAGES } from './types';

import i18n, { initializeLanguage, loadLanguageLocale, setLanguage } from './loader';

describe('renderer/i18n', () => {
  it('provides both supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'zh-Hans']);
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(LANGUAGES).toEqual([
      { label: 'English', value: 'en' },
      { label: '简体中文', value: 'zh-Hans' },
    ]);
  });

  it.each(['en', 'zh-Hans'] as const)(
    'initializes %s from main without detecting or saving',
    async (language) => {
      vi.mocked(window.gitify.language.get).mockResolvedValueOnce({ language, preference: null });
      const systemLanguages = vi.spyOn(navigator, 'languages', 'get');
      const readStorage = vi.spyOn(localStorage, 'getItem');
      const writeStorage = vi.spyOn(localStorage, 'setItem');
      await initializeLanguage();
      expect(window.gitify.language.get).toHaveBeenCalledWith();
      expect(window.gitify.language.set).not.toHaveBeenCalled();
      expect(systemLanguages).not.toHaveBeenCalled();
      expect(readStorage).not.toHaveBeenCalled();
      expect(writeStorage).not.toHaveBeenCalled();
      expect(loadLanguageLocale()).toBe(language);
      expect(document.documentElement.lang).toBe(language);
    },
  );

  it('propagates an initialization failure without choosing a fallback language', async () => {
    await i18n.changeLanguage('zh-Hans');
    vi.mocked(window.gitify.language.get).mockRejectedValueOnce(new Error('IPC failed'));
    await expect(initializeLanguage()).rejects.toThrow('IPC failed');
    expect(loadLanguageLocale()).toBe('zh-Hans');
  });

  it.each(['en', 'zh-Hans'] as const)(
    'waits for the authoritative response before switching to %s',
    async (language) => {
      const previous = language === 'en' ? 'zh-Hans' : 'en';
      await i18n.changeLanguage(previous);
      let finish!: (value: LanguageState) => void;
      vi.mocked(window.gitify.language.set).mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
      const pending = setLanguage(language);
      expect(i18n.language).toBe(previous);
      finish({ language, preference: language });
      await pending;
      expect(loadLanguageLocale()).toBe(language);
    },
  );

  it.each(['en', 'zh-Hans'] as const)(
    'keeps active %s when saving in main fails',
    async (language) => {
      await i18n.changeLanguage(language);
      vi.mocked(window.gitify.language.set).mockRejectedValueOnce(new Error('save failed'));
      await expect(setLanguage(language === 'en' ? 'zh-Hans' : 'en')).rejects.toThrow(
        'save failed',
      );
      expect(loadLanguageLocale()).toBe(language);
    },
  );

  it('reloads the authoritative preference rather than retaining renderer state', async () => {
    vi.mocked(window.gitify.language.get).mockResolvedValue({
      language: 'zh-Hans',
      preference: 'zh-Hans',
    });
    await initializeLanguage();
    await i18n.changeLanguage('en');
    await initializeLanguage();
    expect(window.gitify.language.get).toHaveBeenCalledTimes(2);
    expect(loadLanguageLocale()).toBe('zh-Hans');
  });
});
