import { mockPartialGitifyNotification } from '../../__mocks__/notifications-mocks';

import {
  formatForDisplay,
  formatMetricDescription,
  formatNotificationNumber,
  formatNotificationTitle,
  formatNotificationType,
} from './formatters';

describe('renderer/utils/notifications/formatters.ts', () => {
  it('formatForDisplay', () => {
    expect(formatForDisplay(null)).toBe('');
    expect(formatForDisplay([])).toBe('');
    expect(formatForDisplay(['open', 'PullRequest'])).toBe('Open Pull Request');
    expect(formatForDisplay(['OUTDATED', 'Discussion'])).toBe(
      'Outdated Discussion',
    );
    expect(formatForDisplay(['not_planned', 'Issue'])).toBe(
      'Not Planned Issue',
    );
  });

  describe('formattedNotificationType', () => {
    it('formats state and type with proper casing and spacing', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'PullRequest',
        state: 'OPEN',
      });

      expect(formatNotificationType(notification)).toBe('Open Pull Request');
    });

    it('handles missing state (null) gracefully', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'Issue',
        state: null,
      });

      expect(formatNotificationType(notification)).toBe('Issue');
    });
  });

  describe('formattedNotificationNumber', () => {
    it('returns formatted number when present', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'OPEN',
      });
      notification.subject.number = 42;

      expect(formatNotificationNumber(notification)).toBe('#42');
    });

    it('returns empty string when number absent', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'OPEN',
      });

      expect(formatNotificationNumber(notification)).toBe('');
    });
  });

  describe('formattedNotificationTitle', () => {
    it('appends number in brackets when present', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Fix bug',
        type: 'Issue',
        state: 'OPEN',
      });
      notification.subject.number = 101;

      expect(formatNotificationTitle(notification)).toBe('Fix bug [#101]');
    });

    it('returns title unchanged when number missing', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Improve docs',
        type: 'Issue',
        state: 'OPEN',
      });

      expect(formatNotificationTitle(notification)).toBe('Improve docs');
    });
  });

  describe('formatMetricDescription', () => {
    it('return empty if no count', () => {
      expect(formatMetricDescription(null, 'bee')).toBe('');
    });

    it('return singular if count is 1', () => {
      expect(formatMetricDescription(1, 'bee')).toBe('1 bee');
    });

    it('return pluralized if count is more than 1', () => {
      expect(formatMetricDescription(2, 'bee')).toBe('2 bees');
    });

    it('return with custom formatter', () => {
      expect(
        formatMetricDescription(2, 'bee', (_count, noun) => {
          return `Hi ${noun}`;
        }),
      ).toBe('Hi bees');
    });
  });
});
