import { matchLanguage, resolveLanguage } from './types';

describe('language matching', () => {
  it.each(['en', 'en-GB', 'EN_us'])('matches %s to English', (locale) => {
    expect(matchLanguage(locale)).toBe('en');
  });
  it.each(['fr', '', '???', 'en--US', null, undefined, 42])('does not match %s', (locale) => {
    expect(matchLanguage(locale)).toBeUndefined();
  });
  it('walks the system preferences and falls back to English', () => {
    expect(resolveLanguage(null, ['fr', 'en-GB'])).toBe('en');
    expect(resolveLanguage(null, ['fr', 'de'])).toBe('en');
    expect(resolveLanguage(null, [])).toBe('en');
    expect(resolveLanguage('en', ['fr'])).toBe('en');
  });
});
