import axios from 'axios';
import nock from 'nock';

import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import type { GitifyNotification, Link } from '../../../types';
import { releaseHandler } from './release';

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
        state: null,
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
    const mockNotification = createPartialMockNotification({
      type: 'Release',
    });

    expect(releaseHandler.iconType(mockNotification).displayName).toBe(
      'TagIcon',
    );
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
