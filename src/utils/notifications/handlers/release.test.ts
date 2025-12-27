import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import type { GitifyNotification, Link } from '../../../types';
import { releaseHandler } from './release';

// Mock isTauriEnvironment to return false so axios is used instead of Tauri fetch
vi.mock('../../environment', () => ({
  isTauriEnvironment: () => false,
}));

// Mock decryptValue since isTauriEnvironment is false
vi.mock('../../comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

describe('renderer/utils/notifications/handlers/release.ts', () => {
  describe('enrich', () => {
    const mockAuthor = createPartialMockUser('some-author');

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('release notification', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/releases/1')
        .reply(200, { author: mockAuthor });

      const result = await releaseHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: undefined,
        user: {
          login: mockAuthor.login,
          htmlUrl: mockAuthor.html_url,
          avatarUrl: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
      });
    });

    it('return early if release state filtered', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      const result = await releaseHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      // Returns empty object when filtered (no API call made)
      expect(result).toEqual({});
    });
  });

  it('iconType', () => {
    expect(
      releaseHandler.iconType(
        createMockSubject({
          type: 'Release',
        }),
      )?.displayName,
    ).toBe('TagIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      releaseHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/releases`);
  });
});
