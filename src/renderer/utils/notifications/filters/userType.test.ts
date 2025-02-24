import type { Notification } from '../../../typesGitHub';
import { filterNotificationByUserType, isNonHumanUser } from './userType';

describe('renderer/utils/notifications/filters/userType.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
    expect(filterNotificationByUserType(mockPartialNotification, 'User')).toBe(
      true,
    );

    mockPartialNotification.subject.user.type = 'EnterpriseUserAccount';
    expect(filterNotificationByUserType(mockPartialNotification, 'User')).toBe(
      true,
    );

    mockPartialNotification.subject.user.type = 'Bot';
    expect(filterNotificationByUserType(mockPartialNotification, 'Bot')).toBe(
      true,
    );

    mockPartialNotification.subject.user.type = 'Organization';
    expect(
      filterNotificationByUserType(mockPartialNotification, 'Organization'),
    ).toBe(true);
  });
});
