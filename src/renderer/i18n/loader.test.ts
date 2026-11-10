import type { LanguageState } from '../../shared/i18n/types';

import { DEFAULT_LANGUAGE, LANGUAGES, SUPPORTED_LANGUAGES } from './types';

import i18n, { initializeLanguage, loadLanguageLocale, setLanguage } from './loader';

describe('renderer/i18n', () => {
  it('provides English as the supported language', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en']);
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(LANGUAGES).toEqual([{ label: 'English', value: 'en' }]);
  });

  it.each(['en'] as const)(
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

  it.each(['en'] as const)(
    'waits for the authoritative response before switching to %s',
    async (language) => {
      const previous = 'en';
      await i18n.changeLanguage(previous);
      let finish!: (value: LanguageState) => void;
      vi.mocked(window.gitify.language.set).mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
      const changeLanguage = vi.spyOn(i18n, 'changeLanguage');
      const pending = setLanguage(language);
      expect(changeLanguage).not.toHaveBeenCalled();
      expect(i18n.language).toBe(previous);
      finish({ language, preference: language });
      await pending;
      expect(changeLanguage).toHaveBeenCalledWith(language);
      expect(loadLanguageLocale()).toBe(language);
    },
  );

  it.each(['en'] as const)('keeps active %s when saving in main fails', async (language) => {
    await i18n.changeLanguage(language);
    vi.mocked(window.gitify.language.set).mockRejectedValueOnce(new Error('save failed'));
    await expect(setLanguage(language)).rejects.toThrow('save failed');
    expect(loadLanguageLocale()).toBe(language);
  });
});
