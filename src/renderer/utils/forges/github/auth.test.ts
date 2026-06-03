import { Constants } from '../../../constants';

import type { Account, ClientID, Hostname, Token } from '../../../types';
import type { AuthMethod } from '../../auth/types';

import {
  extractHostVersion,
  getDeveloperSettingsURL,
  getGitHubAuthBaseUrl,
  getNewOAuthAppURL,
  getNewTokenURL,
  isValidClientId,
  isValidToken,
} from './auth';

describe('renderer/utils/forges/github/auth.ts', () => {
  beforeEach(() => {
    Constants.OAUTH_DEVICE_FLOW_CLIENT_ID = 'FAKE_CLIENT_ID_123' as ClientID;
  });

  describe('extractHostVersion', () => {
    it('returns "latest" for null/empty version', () => {
      expect(extractHostVersion(null)).toBe('latest');
    });

    it('returns undefined for unparseable version strings', () => {
      expect(extractHostVersion('foo')).toBeUndefined();
    });

    it('coerces partial versions to semver', () => {
      expect(extractHostVersion('3')).toBe('3.0.0');
      expect(extractHostVersion('3.15')).toBe('3.15.0');
      expect(extractHostVersion('3.15.0')).toBe('3.15.0');
      expect(extractHostVersion('3.15.0-beta1')).toBe('3.15.0');
    });

    it('strips the "enterprise-server@" prefix from GHES headers', () => {
      expect(extractHostVersion('enterprise-server@3')).toBe('3.0.0');
      expect(extractHostVersion('enterprise-server@3.15')).toBe('3.15.0');
      expect(extractHostVersion('enterprise-server@3.15.0')).toBe('3.15.0');
      expect(extractHostVersion('enterprise-server@3.15.0-beta1')).toBe('3.15.0');
    });
  });

  describe('getGitHubAuthBaseUrl', () => {
    it('returns the github.com URL for non-enterprise hosts', () => {
      expect(getGitHubAuthBaseUrl('github.com' as Hostname).toString()).toBe('https://github.com/');
    });

    it('returns the api/v3 URL for enterprise server hosts', () => {
      expect(getGitHubAuthBaseUrl('github.gitify.io' as Hostname).toString()).toBe(
        'https://github.gitify.io/api/v3/',
      );
    });

    it('returns the data-residency URL for ghe.com hosts', () => {
      expect(getGitHubAuthBaseUrl('gitify.ghe.com' as Hostname).toString()).toBe(
        'https://api.gitify.ghe.com/',
      );
    });
  });

  describe('getDeveloperSettingsURL', () => {
    it('returns the GitHub App connections URL', () => {
      expect(
        getDeveloperSettingsURL({
          hostname: 'github.com' as Hostname,
          method: 'GitHub App',
        } as Account),
      ).toBe('https://github.com/settings/connections/applications/FAKE_CLIENT_ID_123');
    });

    it('returns the OAuth App developer URL', () => {
      expect(
        getDeveloperSettingsURL({
          hostname: 'github.com' as Hostname,
          method: 'OAuth App',
        } as Account),
      ).toBe('https://github.com/settings/developers');
    });

    it('returns the PAT settings URL', () => {
      expect(
        getDeveloperSettingsURL({
          hostname: 'github.com' as Hostname,
          method: 'Personal Access Token',
        } as Account),
      ).toBe('https://github.com/settings/tokens');
    });

    it('falls back to the generic settings page for unknown auth methods', () => {
      expect(
        getDeveloperSettingsURL({
          hostname: 'github.com' as Hostname,
          method: 'unknown' as AuthMethod,
        } as Account),
      ).toBe('https://github.com/settings');
    });
  });

  describe('getNewTokenURL', () => {
    it('builds a token-creation URL on github.com', () => {
      expect(
        getNewTokenURL('github.com' as Hostname).startsWith(
          'https://github.com/settings/tokens/new',
        ),
      ).toBeTruthy();
    });

    it('builds a token-creation URL on enterprise hosts', () => {
      expect(
        getNewTokenURL('github.gitify.io' as Hostname).startsWith(
          'https://github.gitify.io/settings/tokens/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('getNewOAuthAppURL', () => {
    it('builds an OAuth-App-creation URL on github.com', () => {
      expect(
        getNewOAuthAppURL('github.com' as Hostname).startsWith(
          'https://github.com/settings/applications/new',
        ),
      ).toBeTruthy();
    });

    it('builds an OAuth-App-creation URL on enterprise hosts', () => {
      expect(
        getNewOAuthAppURL('github.gitify.io' as Hostname).startsWith(
          'https://github.gitify.io/settings/applications/new',
        ),
      ).toBeTruthy();
    });
  });

  describe('isValidClientId', () => {
    it('accepts a 20-char alphanumeric/underscore client id', () => {
      expect(isValidClientId('1234567890_ASDFGHJKL' as ClientID)).toBeTruthy();
    });

    it('rejects an empty client id', () => {
      expect(isValidClientId('' as ClientID)).toBeFalsy();
    });

    it('rejects a client id of the wrong length', () => {
      expect(isValidClientId('1234567890asdfg' as ClientID)).toBeFalsy();
    });
  });

  describe('isValidToken', () => {
    it('accepts a 40-char alphanumeric/underscore token', () => {
      expect(isValidToken('1234567890_asdfghjklPOIUYTREWQ0987654321' as Token)).toBeTruthy();
    });

    it('rejects an empty token', () => {
      expect(isValidToken('' as Token)).toBeFalsy();
    });

    it('rejects a token of the wrong length', () => {
      expect(isValidToken('1234567890asdfg' as Token)).toBeFalsy();
    });
  });
});
