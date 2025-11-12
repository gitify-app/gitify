import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Notification } from '../../../typesGitHub';
import { isNonHumanUser, userTypeFilter } from './userType';

describe('renderer/utils/notifications/filters/userType.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('isNonHumanUser', () => {
    expect(isNonHumanUser('User')).toBe(false);
    expect(isNonHumanUser('EnterpriseUserAccount')).toBe(false);
    expect(isNonHumanUser('Bot')).toBe(true);
    expect(isNonHumanUser('Organization')).toBe(true);
    expect(isNonHumanUser('Mannequin')).toBe(true);
  });

  it('can filter by user types', () => {
    const mockPartialNotification = {
      subject: {
        user: {
          type: 'User',
        },
      },
    } as Partial<Notification> as Notification;

    mockPartialNotification.subject.user.type = 'User';
    expect(
      userTypeFilter.filterNotification(mockPartialNotification, 'User'),
    ).toBe(true);

    mockPartialNotification.subject.user.type = 'EnterpriseUserAccount';
    expect(
      userTypeFilter.filterNotification(mockPartialNotification, 'User'),
    ).toBe(true);

    mockPartialNotification.subject.user.type = 'Bot';
    expect(
      userTypeFilter.filterNotification(mockPartialNotification, 'Bot'),
    ).toBe(true);

    mockPartialNotification.subject.user.type = 'Organization';
    expect(
      userTypeFilter.filterNotification(
        mockPartialNotification,
        'Organization',
      ),
    ).toBe(true);
  });
});
