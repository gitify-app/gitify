import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { GitifyNotification } from '../../../types';
import {
  type GitifyNotificationState,
  IconColor,
  type Link,
} from '../../../types';
import { defaultHandler } from './default';

describe('renderer/utils/notifications/handlers/default.ts', () => {
  describe('supportsMergedQueryEnrichment', () => {
    it('should not support merge query', () => {
      expect(defaultHandler.supportsMergedQueryEnrichment).toBeFalsy();
    });
  });

  describe('enrich', () => {
    it('unhandled subject details', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title:
          'There is no special subject handling for this notification type',
        type: 'RepositoryInvitation',
      });

      const result = await defaultHandler.enrich(
        mockNotification,
        mockSettings,
      );

      // Default handler returns empty object (no enrichment)
      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({});

    expect(defaultHandler.iconType(mockNotification).displayName).toBe(
      'QuestionIcon',
    );
  });

  describe('iconColor', () => {
    it('returns GRAY for any unrecognized state (fallback behavior)', () => {
      const states: Array<GitifyNotificationState | null | undefined> = [
        'unknown' as GitifyNotificationState,
        null,
        undefined,
      ];

      states.forEach((state) => {
        const mockNotification = mockPartialGitifyNotification({
          state: state,
        });

        expect(defaultHandler.iconColor(mockNotification)).toBe(IconColor.GRAY);
      });
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      defaultHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(mockHtmlUrl);
  });

  it('defaultUserType', () => {
    expect(defaultHandler.defaultUserType()).toEqual('User');
  });
});
