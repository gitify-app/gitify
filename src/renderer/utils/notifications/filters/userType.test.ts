import type { DeepPartial } from '../../../__helpers__/test-utils';

import type { GitifyNotification, UserType } from '../../../types';

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

  it('can filter by other author types', () => {
    const mockPartialNotification = {
      subject: {
        author: {
          type: 'Mannequin',
        },
      },
    } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

    expect(userTypeFilter.filterNotification(mockPartialNotification, 'other')).toBe(true);
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'Bot')).toBe(false);
  });

  it('can filter other for notifications with no author', () => {
    const mockPartialNotification =
      {} satisfies DeepPartial<GitifyNotification> as GitifyNotification;

    expect(userTypeFilter.filterNotification(mockPartialNotification, 'other')).toBe(true);
    expect(userTypeFilter.filterNotification(mockPartialNotification, 'User')).toBe(false);
  });

  it('can classify notifications into canonical buckets', () => {
    const build = (type?: UserType): GitifyNotification =>
      ({ subject: { author: type ? { type } : undefined } }) as GitifyNotification;

    expect(userTypeFilter.classify(build('User'))).toBe('User');
    expect(userTypeFilter.classify(build('EnterpriseUserAccount'))).toBe('User');
    expect(userTypeFilter.classify(build('Bot'))).toBe('Bot');
    expect(userTypeFilter.classify(build('Organization'))).toBe('Organization');
    expect(userTypeFilter.classify(build('Mannequin'))).toBe('other');
    expect(userTypeFilter.classify(build())).toBe('other');
  });
});
