import {
  mockSsoEnterpriseRequiredHeader,
  mockSsoPartialResultsHeader,
  mockSsoRequiredHeader,
  mockSsoUnrecognisedHeader,
} from './__mocks__/sso-mocks';

import { organizationLoginFromSsoUrl, parseSsoHeader } from './sso';

describe('renderer/utils/forges/github/sso.ts', () => {
  describe('parseSsoHeader', () => {
    it('parses the partial-results form into withheld organization identifiers', () => {
      expect(parseSsoHeader(mockSsoPartialResultsHeader)).toEqual({
        kind: 'partial-results',
        organizationIds: ['21955855', '20582480'],
      });
    });

    it('parses the required form into the authorizing link', () => {
      expect(parseSsoHeader(mockSsoRequiredHeader)).toEqual({
        kind: 'required',
        url: 'https://github.com/orgs/mock-org/sso?authorization_request=abc123',
      });
    });

    it('treats an absent header as no condition', () => {
      expect(parseSsoHeader(null)).toBeNull();
      expect(parseSsoHeader(undefined)).toBeNull();
    });

    it('treats a blank header as no condition', () => {
      expect(parseSsoHeader('')).toBeNull();
      expect(parseSsoHeader('   ')).toBeNull();
    });

    it('reports an unrecognised directive as unknown rather than clean', () => {
      expect(parseSsoHeader(mockSsoUnrecognisedHeader)).toEqual({
        kind: 'unknown',
        raw: mockSsoUnrecognisedHeader,
      });
    });

    it('still reports the required condition when no link is present', () => {
      expect(parseSsoHeader('required')).toEqual({ kind: 'required', url: null });
    });

    it('ignores parameters it does not understand', () => {
      expect(parseSsoHeader('partial-results; organizations=1,2; future=x')).toEqual({
        kind: 'partial-results',
        organizationIds: ['1', '2'],
      });
    });
  });

  describe('organizationLoginFromSsoUrl', () => {
    it('extracts the login from an organization-scoped link', () => {
      expect(
        organizationLoginFromSsoUrl(
          'https://github.com/orgs/mock-org/sso?authorization_request=abc123',
        ),
      ).toBe('mock-org');
    });

    it('names no organization for an enterprise-scoped link', () => {
      expect(
        organizationLoginFromSsoUrl(mockSsoEnterpriseRequiredHeader.slice('required; url='.length)),
      ).toBeNull();
    });

    it('returns null when there is no link', () => {
      expect(organizationLoginFromSsoUrl(null)).toBeNull();
    });

    it('returns null for a link that is not an SSO path', () => {
      expect(organizationLoginFromSsoUrl('https://github.com/settings/tokens')).toBeNull();
    });

    it('returns null for a value that is not a URL', () => {
      expect(organizationLoginFromSsoUrl('not-a-url')).toBeNull();
    });
  });
});
