import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import type { GitifyOwner, Link } from '../../../types';

import {
  ALL_SEARCH_QUALIFIERS,
  filterNotificationBySearchTerm,
  parseSearchInput,
} from './search';

// (helper removed – no longer used)

describe('renderer/utils/notifications/filters/search.ts', () => {
  describe('parseSearchInput (prefix matching behavior)', () => {
    it('returns null for empty string', () => {
      expect(parseSearchInput('')).toBeNull();
    });

    it('returns null when no qualifier prefix matches', () => {
      expect(parseSearchInput('unknown:value')).toBeNull();
      expect(parseSearchInput('auth:foo')).toBeNull(); // near miss
    });

    it('matches each known qualifier by its exact prefix and additional value', () => {
      for (const q of ALL_SEARCH_QUALIFIERS) {
        const token = `${q.prefix}someValue`;
        const parsed = parseSearchInput(token);
        expect(parsed).not.toBeNull();
        expect(parsed?.qualifier).toBe(q);
      }
    });

    it('does not match when prefix appears later in the token', () => {
      expect(parseSearchInput('xauthor:foo')).toBeNull();
      expect(parseSearchInput('xxorg:bar')).toBeNull();
    });
  });

  describe('filterNotificationBySearchTerm', () => {
    const mockNotification = mockPartialGitifyNotification(
      {
        title: 'User authored notification',
        user: {
          login: 'github-user',
          htmlUrl: 'https://github.com/user' as Link,
          avatarUrl:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'User',
        },
      },
      {
        owner: {
          login: 'gitify-app',
          avatarUrl:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'Organization',
        } as GitifyOwner,
        fullName: 'gitify-app/gitify',
      },
    );

    it('matches author qualifier (case-insensitive)', () => {
      expect(
        filterNotificationBySearchTerm(mockNotification, 'author:github-user'),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(mockNotification, 'author:GITHUB-USER'),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(mockNotification, 'author:some-bot'),
      ).toBe(false);
    });

    it('matches org qualifier (case-insensitive)', () => {
      expect(
        filterNotificationBySearchTerm(mockNotification, 'org:gitify-app'),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(mockNotification, 'org:GITIFY-APP'),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(mockNotification, 'org:github'),
      ).toBe(false);
    });

    it('matches repo qualifier (case-insensitive full_name)', () => {
      expect(
        filterNotificationBySearchTerm(
          mockNotification,
          'repo:gitify-app/gitify',
        ),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(
          mockNotification,
          'repo:Gitify-App/Gitify',
        ),
      ).toBe(true);

      expect(
        filterNotificationBySearchTerm(mockNotification, 'repo:github/other'),
      ).toBe(false);
    });

    it('returns false for unknown qualifier', () => {
      expect(
        filterNotificationBySearchTerm(mockNotification, 'unknown:thing'),
      ).toBe(false);
    });

    it('returns false for empty value', () => {
      expect(filterNotificationBySearchTerm(mockNotification, 'repo:')).toBe(
        false,
      );
    });

    it('returns false for empty token', () => {
      expect(filterNotificationBySearchTerm(mockNotification, '')).toBe(false);
    });
  });
});
