import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { IconColor } from '../../../types';
import type { StateType } from '../../../typesGitHub';
import { defaultHandler } from './default';

describe('renderer/utils/notifications/handlers/default.ts', () => {
  describe('enrich', () => {
    it('unhandled subject details', async () => {
      const mockNotification = partialMockNotification({
        title:
          'There is no special subject handling for this notification type',
        type: 'RepositoryInvitation',
      });

      const result = await defaultHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    expect(
      defaultHandler.iconType(mockNotificationWithSubject({})).displayName,
    ).toBe('QuestionIcon');
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
      const subject = mockNotificationWithSubject({ state });
      expect(defaultHandler.iconColor(subject)).toBe(expected);
    });
  });

  describe('formattedNotificationType', () => {
    it('formats state and type with proper casing and spacing', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'PullRequest',
        state: 'open',
      });

      expect(defaultHandler.formattedNotificationType(notification)).toBe(
        'Open Pull Request',
      );
    });

    it('handles missing state (null) gracefully', () => {
      const notification = partialMockNotification({
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
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'open',
      });
      notification.subject.number = 42;
      expect(defaultHandler.formattedNotificationNumber(notification)).toBe(
        '#42',
      );
    });

    it('returns empty string when number absent', () => {
      const notification = partialMockNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'open',
      });
      expect(defaultHandler.formattedNotificationNumber(notification)).toBe('');
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
      expect(defaultHandler.formattedNotificationTitle(notification)).toBe(
        'Fix bug [#101]',
      );
    });

    it('returns title unchanged when number missing', () => {
      const notification = partialMockNotification({
        title: 'Improve docs',
        type: 'Issue',
        state: 'open',
      });
      expect(defaultHandler.formattedNotificationTitle(notification)).toBe(
        'Improve docs',
      );
    });
  });
});
