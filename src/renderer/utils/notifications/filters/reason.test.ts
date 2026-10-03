import type { AccountNotifications, GitifyNotification, Reason } from '../../../types';

import { reasonFilter } from './reason';

describe('renderer/utils/notifications/filters/reason.ts', () => {
  const buildNotification = (reason: Reason): GitifyNotification =>
    ({ reason: { code: reason } }) as GitifyNotification;

  const buildUnknownNotification = (): GitifyNotification =>
    ({ reason: { code: 'unknown_reason' } }) as unknown as GitifyNotification;

  it('can filter by reason', () => {
    const notification = buildNotification('mention');

    expect(reasonFilter.filterNotification(notification, 'mention')).toBe(true);
    expect(reasonFilter.filterNotification(notification, 'comment')).toBe(false);
  });

  it('filters other for an unenumerated reason code', () => {
    const notification = buildUnknownNotification();

    expect(reasonFilter.filterNotification(notification, 'other')).toBe(true);
    expect(reasonFilter.filterNotification(notification, 'mention')).toBe(false);
  });

  it('can classify notifications into a single reason bucket', () => {
    expect(reasonFilter.classify(buildNotification('mention'))).toBe('mention');
    expect(reasonFilter.classify(buildNotification('comment'))).toBe('comment');
    expect(reasonFilter.classify(buildUnknownNotification())).toBe('other');
  });

  it('getFilterCount counts notifications per canonical bucket', () => {
    const accountNotifications: AccountNotifications[] = [
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('mention'), buildNotification('mention')],
        error: null,
      },
      {
        account: {} as AccountNotifications['account'],
        notifications: [buildNotification('comment'), buildUnknownNotification()],
        error: null,
      },
    ];

    expect(reasonFilter.getFilterCount(accountNotifications, 'mention')).toBe(2);
    expect(reasonFilter.getFilterCount(accountNotifications, 'comment')).toBe(1);
    expect(reasonFilter.getFilterCount(accountNotifications, 'other')).toBe(1);
  });
});
