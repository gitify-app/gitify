import { matchLanguage, resolveLanguage } from './types';

describe('language matching', () => {
  it.each(['en', 'en-GB', 'EN_us'])('matches %s to English', (locale) => {
    expect(matchLanguage(locale)).toBe('en');
  });
  it.each(['zh', 'zh-CN', 'zh_SG', 'ZH_hAnS', 'zh-Hans-TW', 'zh-Hans-HK', 'zh-Hans-CN'])(
    'matches %s to Simplified Chinese',
    (locale) => {
      expect(matchLanguage(locale)).toBe('zh-Hans');
    },
  );
  it.each([
    'zh-TW',
    'zh-HK',
    'zh-MO',
    'zh-Hant',
    'zh-Hant-CN',
    'zh-Hant-SG',
    'fr',
    '',
    '???',
    'en--US',
    null,
    undefined,
    42,
  ])('does not match %s', (locale) => {
    expect(matchLanguage(locale)).toBeUndefined();
  });
  it('walks the system preferences and falls back to English', () => {
    expect(resolveLanguage(null, ['fr', 'en-GB'])).toBe('en');
    expect(resolveLanguage(null, ['fr', 'de'])).toBe('en');
    expect(resolveLanguage(null, [])).toBe('en');
    expect(resolveLanguage('en', ['fr'])).toBe('en');
  });

  it('resolves Chinese system preferences and explicit language choices', () => {
    expect(resolveLanguage(null, ['zh-Hant', 'fr', 'zh-SG', 'en'])).toBe('zh-Hans');
    expect(resolveLanguage(null, ['en-GB', 'zh-CN'])).toBe('en');
    expect(resolveLanguage(null, ['zh-Hant', 'fr'])).toBe('en');
    expect(resolveLanguage(null, [])).toBe('en');
    expect(resolveLanguage('en', ['zh-CN'])).toBe('en');
    expect(resolveLanguage('zh-Hans', ['en-GB'])).toBe('zh-Hans');
  });
});
