import { Constants } from '../constants';

import { DEFAULT_LANGUAGE, LANGUAGES, SUPPORTED_LANGUAGES } from './types';

import i18n, { loadLanguageLocale, setLanguage } from './loader';

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
    it('should ignore a stored language that is not supported', () => {
      localStorage.setItem(Constants.STORAGE.LANGUAGE, 'xx');

      expect(loadLanguageLocale()).toBe(DEFAULT_LANGUAGE);
    });
  });

  describe('setLanguage', () => {
    it('persists an explicit choice and switches the active language', async () => {
      localStorage.removeItem(Constants.STORAGE.LANGUAGE);

      await setLanguage('en');

      expect(localStorage.getItem(Constants.STORAGE.LANGUAGE)).toBe('en');
      expect(i18n.language).toBe('en');
    });
  });

  describe('detection', () => {
    it('does not persist the detected language', () => {
      localStorage.removeItem(Constants.STORAGE.LANGUAGE);

      i18n.services.languageDetector.cacheUserLanguage?.('en');

      expect(localStorage.getItem(Constants.STORAGE.LANGUAGE)).toBeNull();
    });

    it('resolves regional locales to their base language', () => {
      expect(i18n.services.languageUtils.getLanguagePartFromCode('en-GB')).toBe('en');
      expect(i18n.options.load).toBe('languageOnly');
    });
  });
});
