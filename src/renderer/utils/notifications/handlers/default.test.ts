import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { IconColor } from '../../../types';
import type { StateType } from '../../../typesGitHub';
import { createDefaultHandler } from './default';

describe('renderer/utils/notifications/handlers/default.ts', () => {
  describe('enrich', () => {
    it('unhandled subject details', async () => {
      const mockNotification = partialMockNotification({
        title:
          'There is no special subject handling for this notification type',
        type: 'RepositoryInvitation',
      });

      const handler = createDefaultHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    const handler = createDefaultHandler(mockNotificationWithSubject({}));

    expect(handler.iconType().displayName).toBe('QuestionIcon');
  });

  describe('iconColor', () => {
    const cases: Array<[StateType | null, IconColor]> = [
      ['open' as StateType, IconColor.GREEN],
      ['reopened' as StateType, IconColor.GREEN],
      ['ANSWERED' as StateType, IconColor.GREEN],
      ['success' as StateType, IconColor.GREEN],
      ['closed' as StateType, IconColor.RED],
      ['failure' as StateType, IconColor.RED],
      ['completed' as StateType, IconColor.PURPLE],
      ['RESOLVED' as StateType, IconColor.PURPLE],
      ['merged' as StateType, IconColor.PURPLE],
      ['not_planned' as StateType, IconColor.GRAY],
      ['draft' as StateType, IconColor.GRAY],
      ['skipped' as StateType, IconColor.GRAY],
      ['cancelled' as StateType, IconColor.GRAY],
      ['unknown' as StateType, IconColor.GRAY],
      [null, IconColor.GRAY],
      [undefined, IconColor.GRAY],
    ];

    it.each(cases)('returns correct color for state %s', (state, expected) => {
      const handler = createDefaultHandler(
        mockNotificationWithSubject({ state }),
      );

      expect(handler.iconColor()).toBe(expected);
    });
  });

  describe('formattedNotificationType', () => {
    it('formats state and type with proper casing and spacing', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'PullRequest',
        state: 'open',
      });

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationType()).toBe('Open Pull Request');
    });

    it('handles missing state (null) gracefully', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: null,
      });

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationType()).toBe('Issue');
    });
  });

  describe('formattedNotificationNumber', () => {
    it('returns formatted number when present', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'open',
      });
      notification.subject.number = 42;

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationNumber()).toBe('#42');
    });

    it('returns empty string when number absent', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'open',
      });

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationNumber()).toBe('');
    });
  });

  describe('formattedNotificationTitle', () => {
    it('appends number in brackets when present', () => {
      const notification = partialMockNotification({
        title: 'Fix bug',
        type: 'Issue',
        state: 'open',
      });
      notification.subject.number = 101;

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationTitle()).toBe('Fix bug [#101]');
    });

    it('returns title unchanged when number missing', () => {
      const notification = partialMockNotification({
        title: 'Improve docs',
        type: 'Issue',
        state: 'open',
      });

      const handler = createDefaultHandler(notification);

      expect(handler.formattedNotificationTitle()).toBe('Improve docs');
    });
  });
});
