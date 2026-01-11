import type { GitifyNotification } from '../../../types';
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
    const createMockNotification = (userType: string) =>
      ({
        subject: {
          user: {
            type: userType,
          },
        },
      }) as Partial<GitifyNotification> as GitifyNotification;

    expect(
      userTypeFilter.filterNotification(createMockNotification('User'), 'User'),
    ).toBe(true);

    expect(
      userTypeFilter.filterNotification(
        createMockNotification('EnterpriseUserAccount'),
        'User',
      ),
    ).toBe(true);

    expect(
      userTypeFilter.filterNotification(createMockNotification('Bot'), 'Bot'),
    ).toBe(true);

    expect(
      userTypeFilter.filterNotification(
        createMockNotification('Organization'),
        'Organization',
      ),
    ).toBe(true);
  });
});
