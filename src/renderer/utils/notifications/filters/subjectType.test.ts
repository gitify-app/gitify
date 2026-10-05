import type { AccountNotifications, GitifyNotification, SubjectType } from '../../../types';

import { subjectTypeFilter } from './subjectType';

describe('renderer/utils/notifications/filters/subjectType.ts', () => {
  const buildNotification = (type: SubjectType): GitifyNotification =>
    ({ subject: { type } }) as GitifyNotification;

  const buildUnknownNotification = (): GitifyNotification =>
    ({ subject: { type: 'SomeFutureType' } }) as unknown as GitifyNotification;

  it('can filter by subject type', () => {
    const notification = buildNotification('Issue');

    expect(subjectTypeFilter.filterNotification(notification, 'Issue')).toBe(true);
    expect(subjectTypeFilter.filterNotification(notification, 'PullRequest')).toBe(false);
  });

  it('filters other for an unmodelled subject type', () => {
    const notification = buildUnknownNotification();

    expect(subjectTypeFilter.filterNotification(notification, 'other')).toBe(true);
    expect(subjectTypeFilter.filterNotification(notification, 'Issue')).toBe(false);
  });

  it('can classify notifications into a single subject type bucket', () => {
    expect(subjectTypeFilter.classify(buildNotification('Issue'))).toBe('Issue');
    expect(subjectTypeFilter.classify(buildNotification('PullRequest'))).toBe('PullRequest');
    expect(subjectTypeFilter.classify(buildNotification('Release'))).toBe('Release');
    expect(subjectTypeFilter.classify(buildUnknownNotification())).toBe('other');
  });

  it('classifies AgentSessionThread into its own option rather than other', () => {
    const notification = buildNotification('AgentSessionThread');

    expect(subjectTypeFilter.filterNotification(notification, 'AgentSessionThread')).toBe(true);
    expect(subjectTypeFilter.filterNotification(notification, 'other')).toBe(false);
    expect(subjectTypeFilter.classify(notification)).toBe('AgentSessionThread');
  });

  it('getFilterCount counts notifications per canonical bucket', () => {
    const accountNotifications: AccountNotifications[] = [
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('Issue'), buildNotification('Issue')],
        error: null,
      },
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('PullRequest')],
        error: null,
      },
    ];

    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'Issue')).toBe(2);
    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'PullRequest')).toBe(1);
    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'Release')).toBe(0);
  });

  it('getFilterCount counts unmodelled subject types under other', () => {
    const accountNotifications: AccountNotifications[] = [
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildUnknownNotification()],
        error: null,
      },
    ];

    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'other')).toBe(1);
  });

  it('getFilterCount counts AgentSessionThread under its own option', () => {
    const accountNotifications: AccountNotifications[] = [
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('AgentSessionThread'), buildUnknownNotification()],
        error: null,
      },
    ];

    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'AgentSessionThread')).toBe(1);
    expect(subjectTypeFilter.getFilterCount(accountNotifications, 'other')).toBe(1);
  });
});
