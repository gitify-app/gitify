import { vi } from 'vitest';

// Mock to use axios instead of Tauri HTTP plugin
vi.mock('../../environment', () => ({ isTauriEnvironment: () => false }));

import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
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
      const mockNotification = createPartialMockNotification({
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
    const mockNotification = createPartialMockNotification({});

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
        const mockNotification = createPartialMockNotification({
          state: state,
        });

        expect(defaultHandler.iconColor(mockNotification)).toBe(IconColor.GRAY);
      });
    });
  });

  describe('formattedNotificationType', () => {
    it('formats state and type with proper casing and spacing', () => {
      const notification = createPartialMockNotification({
        title: 'Sample',
        type: 'PullRequest',
        state: 'OPEN',
      });

      expect(defaultHandler.formattedNotificationType(notification)).toBe(
        'Open Pull Request',
      );
    });

    it('handles missing state (null) gracefully', () => {
      const notification = createPartialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: null,
      });

      expect(defaultHandler.formattedNotificationType(notification)).toBe(
        'Issue',
      );
    });
  });

  describe('formattedNotificationNumber', () => {
    it('returns formatted number when present', () => {
      const notification = createPartialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'OPEN',
      });
      notification.subject.number = 42;
      expect(defaultHandler.formattedNotificationNumber(notification)).toBe(
        '#42',
      );
    });

    it('returns empty string when number absent', () => {
      const notification = createPartialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'OPEN',
      });
      expect(defaultHandler.formattedNotificationNumber(notification)).toBe('');
    });
  });

  describe('formattedNotificationTitle', () => {
    it('appends number in brackets when present', () => {
      const notification = createPartialMockNotification({
        title: 'Fix bug',
        type: 'Issue',
        state: 'OPEN',
      });
      notification.subject.number = 101;
      expect(defaultHandler.formattedNotificationTitle(notification)).toBe(
        'Fix bug [#101]',
      );
    });

    it('returns title unchanged when number missing', () => {
      const notification = createPartialMockNotification({
        title: 'Improve docs',
        type: 'Issue',
        state: 'OPEN',
      });
      expect(defaultHandler.formattedNotificationTitle(notification)).toBe(
        'Improve docs',
      );
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
});
