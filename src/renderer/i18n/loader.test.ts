import { Constants } from '../constants';

import { DEFAULT_LANGUAGE, LANGUAGES, SUPPORTED_LANGUAGES } from './types';

import { loadLanguageLocale } from './loader';

describe('renderer/i18n', () => {
  describe('types', () => {
    it('should support English as the only language', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en']);
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('should expose language options for the settings selector', () => {
      expect(LANGUAGES).toEqual([{ label: 'English', value: 'en' }]);
    });
  });

  describe('loadLanguageLocale', () => {
    it('should return the default language when no preference is stored', () => {
      localStorage.removeItem(Constants.STORAGE.LANGUAGE);

      expect(loadLanguageLocale()).toBe(DEFAULT_LANGUAGE);
    });

    it('should return the stored language preference', () => {
      localStorage.setItem(Constants.STORAGE.LANGUAGE, 'en');

      expect(loadLanguageLocale()).toBe('en');
    });
  });
});
