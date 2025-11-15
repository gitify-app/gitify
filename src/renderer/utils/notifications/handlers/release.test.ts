import axios from 'axios';
import nock from 'nock';

import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import {
  partialMockNotification,
  partialMockUser,
} from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import { createReleaseHandler } from './release';

describe('renderer/utils/notifications/handlers/release.ts', () => {
  describe('enrich', () => {
    const mockAuthor = partialMockUser('some-author');

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('release notification', async () => {
      const mockNotification = partialMockNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/releases/1')
        .reply(200, { author: mockAuthor });

      const handler = createReleaseHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

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
      const mockNotification = partialMockNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      const handler = createReleaseHandler(mockNotification);
      const result = await handler.enrich({
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  it('iconType', () => {
    const handler = createReleaseHandler(
      mockNotificationWithSubject({
        type: 'Release',
      }),
    );

    expect(handler.iconType().displayName).toBe('TagIcon');
  });
});
