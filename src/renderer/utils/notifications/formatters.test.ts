import { CopilotIcon } from '@primer/octicons-react';

import { mockPartialGitifyNotification } from '../../__mocks__/notifications-mocks';

import type { Link } from '../../types';

import { formatNotification } from './formatNotification';
import {
  formatForDisplay,
  formatMetricDescription,
  formatCommitSha,
  formatNotificationIdentifier,
  formatNotificationTitle,
  formatNotificationType,
  formatProperCase,
} from './formatters';

describe('renderer/utils/notifications/formatters.ts', () => {
  it('formatNotification', () => {
    const mockNotification = mockPartialGitifyNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/discussions/123' as Link,
      latestCommentUrl: null,
    });

    const formatted = formatNotification(mockNotification);

    expect(formatted.display).toBeDefined();
    expect(formatted.display.title).toBe('This is a mock discussion');
    expect(formatted.display.type).toBe('Discussion');
    expect(formatted.display.identifier).toBe('');
    expect(formatted.display.defaultUserType).toBe('User');
  });

  it('formatNotification copies the handler-provided actor icon into display', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'AgentSessionThread',
    });

    const formatted = formatNotification(mockNotification);

    expect(formatted.display.defaultUserType).toBe('Bot');
    expect(formatted.display.defaultUserIcon).toBe(CopilotIcon);
  });

  it('formatProperCase', () => {
    expect(formatProperCase(null as unknown as string)).toBe('');
    expect(formatProperCase('')).toBe('');
    expect(formatProperCase('OUTDATED discussion')).toBe('Outdated Discussion');
  });

  it('formatForDisplay', () => {
    expect(formatForDisplay(null as unknown as string[])).toBe('');
    expect(formatForDisplay([])).toBe('');
    expect(formatForDisplay(['open', 'PullRequest'])).toBe('Open Pull Request');
    expect(formatForDisplay(['OUTDATED', 'Discussion'])).toBe('Outdated Discussion');
    expect(formatForDisplay(['not_planned', 'Issue'])).toBe('Not Planned Issue');
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
        state: undefined,
      });

      expect(formatNotificationType(notification)).toBe('Issue');
    });

    it('keeps the brand name intact for GitLab to-do items', () => {
      // Camel-splitting would render this as "Git Lab Todo".
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'GitLabTodo',
        state: undefined,
      });

      expect(formatNotificationType(notification)).toBe('GitLab To-Do');
    });

    it('prefixes the state for GitLab to-do items', () => {
      const notification = mockPartialGitifyNotification({
        title: 'Sample',
        type: 'GitLabTodo',
        state: 'OPEN',
      });

      expect(formatNotificationType(notification)).toBe('Open GitLab To-Do');
    });
  });

  describe('formatNotificationIdentifier', () => {
    const base = () =>
      mockPartialGitifyNotification({
        title: 'Sample',
        type: 'Issue',
        state: 'OPEN',
      });

    it('returns the formatted number when present', () => {
      const notification = base();
      notification.subject.number = 42;

      expect(formatNotificationIdentifier(notification)).toBe('#42');
    });

    it('returns the release tag when present', () => {
      const notification = base();
      notification.subject.tagName = 'v0.0.1';

      expect(formatNotificationIdentifier(notification)).toBe('v0.0.1');
    });

    it('returns the abbreviated commit SHA when present', () => {
      const notification = base();
      notification.subject.commitSha = 'd2a86d80e3d24ea9510d5de6c147e53c30f313a8';

      expect(formatNotificationIdentifier(notification)).toBe('d2a86d8');
    });

    it('prefers the number over a tag or SHA', () => {
      const notification = base();
      notification.subject.number = 42;
      notification.subject.tagName = 'v0.0.1';
      notification.subject.commitSha = 'd2a86d80e3d24ea9510d5de6c147e53c30f313a8';

      expect(formatNotificationIdentifier(notification)).toBe('#42');
    });

    it('returns empty string when no identifier is present', () => {
      expect(formatNotificationIdentifier(base())).toBe('');
    });
  });

  describe('formatCommitSha', () => {
    it('abbreviates to seven characters', () => {
      expect(formatCommitSha('d2a86d80e3d24ea9510d5de6c147e53c30f313a8')).toBe('d2a86d8');
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

    it('does not append a release tag or commit SHA', () => {
      const release = mockPartialGitifyNotification({
        title: 'Release 0.0.1',
        type: 'Release',
        state: undefined,
      });
      release.subject.tagName = 'v0.0.1';

      const commit = mockPartialGitifyNotification({
        title: 'Fix the thing',
        type: 'Commit',
        state: undefined,
      });
      commit.subject.commitSha = 'd2a86d80e3d24ea9510d5de6c147e53c30f313a8';

      expect(formatNotificationTitle(release)).toBe('Release 0.0.1');
      expect(formatNotificationTitle(commit)).toBe('Fix the thing');
    });
  });

  describe('formatMetricDescription', () => {
    it('return empty if no count', () => {
      expect(formatMetricDescription(null as unknown as number, 'bee')).toBe('');
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
