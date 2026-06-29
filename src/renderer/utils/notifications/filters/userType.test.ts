import type { DeepPartial } from '../../../__helpers__/test-utils';

import type { GitifyNotification } from '../../../types';

import { isNonHumanUser, userTypeFilter } from './userType';

describe('renderer/utils/notifications/filters/userType.ts', () => {
  it('isNonHumanUser', () => {
    expect(isNonHumanUser('User')).toBe(false);
    expect(isNonHumanUser('EnterpriseUserAccount')).toBe(false);
    expect(isNonHumanUser('Bot')).toBe(true);
    expect(isNonHumanUser('Organization')).toBe(true);
    expect(isNonHumanUser('Mannequin')).toBe(true);
  });

  it('can filter by author user types', () => {
    const mockPartialNotification = {
      subject: {
        author: {
          type: 'User',
        },
      },
    } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

    mockPartialNotification.subject.author!.type = 'User';
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'User')).toBe(true);

    mockPartialNotification.subject.author!.type = 'EnterpriseUserAccount';
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'User')).toBe(true);

    mockPartialNotification.subject.author!.type = 'Bot';
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'Bot')).toBe(true);

    mockPartialNotification.subject.author!.type = 'Organization';
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'Organization')).toBe(true);
  });
});
