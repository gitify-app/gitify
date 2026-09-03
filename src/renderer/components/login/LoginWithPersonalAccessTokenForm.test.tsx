import { summarizeLoginError } from './LoginWithPersonalAccessTokenForm';

describe('renderer/components/login/LoginWithPersonalAccessTokenForm.tsx', () => {
  describe('summarizeLoginError', () => {
    it('returns the error message', () => {
      expect(summarizeLoginError(new Error('GitLab API 403'))).toBe('GitLab API 403');
    });

    it('keeps only the first line so an echoed request body never reaches the banner', () => {
      expect(summarizeLoginError(new Error('GitLab API 403\nPRIVATE-TOKEN: leaked-pat'))).toBe(
        'GitLab API 403',
      );
    });

    it('collapses whitespace and caps the length', () => {
      const summary = summarizeLoginError(new Error(`Bad   ${'x'.repeat(300)}`));

      expect(summary).toHaveLength(150);
      expect(summary?.startsWith('Bad x')).toBe(true);
    });

    it('returns undefined for non-errors and empty messages', () => {
      expect(summarizeLoginError(null)).toBeUndefined();
      expect(summarizeLoginError('bad credentials')).toBeUndefined();
      expect(summarizeLoginError(new Error('   '))).toBeUndefined();
    });
  });
});
