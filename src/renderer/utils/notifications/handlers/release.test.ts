import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import type { Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
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
        latest_comment_url:
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
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
      });
    });

    it('return early if release state filtered', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      const result = await releaseHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  it('iconType', () => {
    expect(
      releaseHandler.iconType(
        createMockSubject({
          type: 'Release',
        }),
      ).displayName,
    ).toBe('TagIcon');
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      releaseHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/releases`);
  });
});
