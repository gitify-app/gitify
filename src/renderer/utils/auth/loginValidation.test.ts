import type { ClientID, Forge, Hostname, Token } from '../../types';

import {
  type CustomOAuthAppFormData,
  type PersonalAccessTokenFormData,
  summarizeLoginError,
  validateCustomOAuthAppForm,
  validatePersonalAccessTokenForm,
} from './loginValidation';

const GITLAB_MODERN_TOKEN =
  'glpat-cEj977iancWuTGoHQbbpGWM6MQpvOjEKdToxcDBrNw8.01.1711l2dhw' as Token;
const GITEA_TOKEN = 'abcdef1234567890abcdef1234567890abcdef12' as Token;

describe('renderer/utils/auth/loginValidation.ts', () => {
  describe('validatePersonalAccessTokenForm', () => {
    it('reports missing hostname and token', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: null as unknown as Hostname,
        token: null as unknown as Token,
      };

      expect(validatePersonalAccessTokenForm(values).hostname).toBe('Hostname is required');
      expect(validatePersonalAccessTokenForm(values).token).toBe('Token is required');
    });

    it('reports invalid hostname and token formats', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'hello' as Hostname,
        token: '!@£INVALID-.1' as Token,
      };

      expect(validatePersonalAccessTokenForm(values).hostname).toBe('Hostname format is invalid');
      expect(validatePersonalAccessTokenForm(values).token).toBe('Token format is invalid');
    });

    it('requires a username (Atlassian email) for Bitbucket', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'bitbucket.org' as Hostname,
        token: 'my-api-token' as Token,
        username: '',
      };

      expect(validatePersonalAccessTokenForm(values, 'bitbucket').username).toBe(
        'Atlassian email is required',
      );
    });

    it('passes for Bitbucket with a username and token', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'bitbucket.org' as Hostname,
        token: 'my-api-token' as Token,
        username: 'user@example.com',
      };

      expect(validatePersonalAccessTokenForm(values, 'bitbucket')).toEqual({});
    });

    it('accepts the modern GitLab routing-prefixed token format', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gitlab.com' as Hostname,
        token: GITLAB_MODERN_TOKEN,
      };

      expect(validatePersonalAccessTokenForm(values, 'gitlab')).toEqual({});
    });

    it('rejects an empty GitLab token', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gitlab.com' as Hostname,
        token: '' as Token,
      };

      expect(validatePersonalAccessTokenForm(values, 'gitlab').token).toBe('Token is required');
    });

    it('rejects an invalid GitLab hostname', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'not a hostname' as Hostname,
        token: GITLAB_MODERN_TOKEN,
      };

      expect(validatePersonalAccessTokenForm(values, 'gitlab').hostname).toBe(
        'Hostname format is invalid',
      );
    });

    it('accepts a Gitea 40-character lowercase-hex token', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gitea.example.com' as Hostname,
        token: GITEA_TOKEN,
      };

      expect(validatePersonalAccessTokenForm(values, 'gitea')).toEqual({});
    });

    it('rejects a Gitea token that is not 40-character lowercase hex', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gitea.example.com' as Hostname,
        token: 'GHT_INVALID_TOKEN' as Token,
      };

      expect(validatePersonalAccessTokenForm(values, 'gitea').token).toBe(
        'Token format is invalid',
      );
    });

    describe('hostname rules per forge', () => {
      it.each(['gitea.example.com:0', 'gitea.example.com:65536', 'gitea.example.com:https'])(
        'rejects an invalid Gitea port in %s',
        (hostname) => {
          expect(
            validatePersonalAccessTokenForm(
              { hostname: hostname as Hostname, token: GITEA_TOKEN },
              'gitea',
            ).hostname,
          ).toBe('Hostname format is invalid');
        },
      );

      it.each<Forge>(['github', 'gitlab', 'bitbucket'])('keeps ports invalid for %s', (forge) => {
        expect(
          validatePersonalAccessTokenForm(
            { hostname: 'git.example.com:3000' as Hostname, token: GITEA_TOKEN },
            forge,
          ).hostname,
        ).toBe('Hostname format is invalid');
      });

      it.each(['http://git.internal', 'http://git.internal:3000', 'gitea.example.com:3000'])(
        'accepts a Gitea origin %s',
        (hostname) => {
          expect(
            validatePersonalAccessTokenForm(
              { hostname: hostname as Hostname, token: GITEA_TOKEN },
              'gitea',
            ),
          ).toEqual({});
        },
      );

      it.each<Forge>(['github', 'gitlab', 'bitbucket'])(
        'keeps %s hostnames HTTPS-only',
        (forge) => {
          expect(
            validatePersonalAccessTokenForm(
              { hostname: 'http://git.internal:3000' as Hostname, token: '' as Token },
              forge,
            ).hostname,
          ).toBe('Hostname format is invalid');
        },
      );
    });
  });

  describe('validateCustomOAuthAppForm', () => {
    it('reports missing hostname and client ID', () => {
      const values: CustomOAuthAppFormData = {
        hostname: null as unknown as Hostname,
        clientId: null as unknown as ClientID,
      };

      expect(validateCustomOAuthAppForm(values).hostname).toBe('Hostname is required');
      expect(validateCustomOAuthAppForm(values).clientId).toBe('Client ID is required');
    });

    it('reports invalid hostname and client ID formats', () => {
      const values: CustomOAuthAppFormData = {
        hostname: 'hello' as Hostname,
        clientId: '!@£INVALID-.1' as ClientID,
      };

      expect(validateCustomOAuthAppForm(values).hostname).toBe('Hostname format is invalid');
      expect(validateCustomOAuthAppForm(values).clientId).toBe('Client ID format is invalid');
    });

    it('passes with a valid hostname and client ID and no client secret', () => {
      const values: CustomOAuthAppFormData = {
        hostname: 'github.com' as Hostname,
        clientId: '1234567890_ASDFGHJKL' as ClientID,
      };

      expect(validateCustomOAuthAppForm(values)).toEqual({});
    });
  });

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
