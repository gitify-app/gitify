import type {
  AccountNotifications,
  GitifyIssueStatusKind,
  GitifyNotification,
  IssueStatusFilterValue,
} from '../../../types';
import { IconColor } from '../../../types';

import { issueStatusFilter } from './issueStatus';

describe('renderer/utils/notifications/filters/issueStatus.ts', () => {
  const buildNotification = (kind?: GitifyIssueStatusKind): GitifyNotification =>
    ({
      subject: {
        type: 'Issue',
        issueStatus: kind ? { name: kind, kind, color: IconColor.GREEN } : undefined,
      },
    }) as GitifyNotification;

  it.each([
    ['backlog', 'backlog'],
    ['todo', 'todo'],
    ['in_progress', 'in_progress'],
    ['in_review', 'in_review'],
    ['done', 'done'],
    ['not_planned', 'not_planned'],
    ['duplicate', 'duplicate'],
  ] as const)('maps status %s to %s', (kind, expected) => {
    expect(issueStatusFilter.classify(buildNotification(kind))).toBe(expected);
    expect(issueStatusFilter.filterNotification(buildNotification(kind), expected)).toBe(true);
  });

  it('classifies an unknown status as other', () => {
    const notification = buildNotification('unknown');

    expect(issueStatusFilter.classify(notification)).toBe('other');
    expect(issueStatusFilter.filterNotification(notification, 'other')).toBe(true);
    expect(issueStatusFilter.filterNotification(notification, 'in_review')).toBe(false);
  });

  it('classifies a notification without a status as other', () => {
    expect(issueStatusFilter.classify(buildNotification())).toBe('other');
  });

  it('classifies a pull request as other', () => {
    const notification = {
      subject: { type: 'PullRequest' },
    } as GitifyNotification;

    expect(issueStatusFilter.classify(notification)).toBe('other');
  });

  it('counts notifications per canonical status bucket', () => {
    const accountNotifications: AccountNotifications[] = [
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('in_review'), buildNotification('in_review')],
        error: null,
      },
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('done'), buildNotification()],
        error: null,
      },
    ];

    expect(issueStatusFilter.getFilterCount(accountNotifications, 'in_review')).toBe(2);
    expect(issueStatusFilter.getFilterCount(accountNotifications, 'done')).toBe(1);
    expect(issueStatusFilter.getFilterCount(accountNotifications, 'other')).toBe(1);
  });

  it('declares workflow order and keeps other last', () => {
    expect(issueStatusFilter.preserveFilterOrder).toBe(true);
    expect(Object.keys(issueStatusFilter.FILTER_TYPES)).toEqual([
      'backlog',
      'todo',
      'in_progress',
      'in_review',
      'done',
      'not_planned',
      'duplicate',
      'other',
    ] satisfies IssueStatusFilterValue[]);
  });
});
