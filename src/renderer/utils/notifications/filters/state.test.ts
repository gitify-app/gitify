import type { Notification } from '../../../typesGitHub';
import { filterNotificationByState } from './state';

describe('renderer/utils/notifications/filters/state.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can filter by notification states', () => {
    const mockPartialNotification = {
      subject: {
        state: 'open',
      },
    } as Partial<Notification> as Notification;

    // Open states
    mockPartialNotification.subject.state = 'open';
    expect(filterNotificationByState(mockPartialNotification, 'open')).toBe(
      true,
    );

    mockPartialNotification.subject.state = 'reopened';
    expect(filterNotificationByState(mockPartialNotification, 'open')).toBe(
      true,
    );

    // Closed states
    mockPartialNotification.subject.state = 'closed';
    expect(filterNotificationByState(mockPartialNotification, 'closed')).toBe(
      true,
    );

    mockPartialNotification.subject.state = 'completed';
    expect(filterNotificationByState(mockPartialNotification, 'closed')).toBe(
      true,
    );

    mockPartialNotification.subject.state = 'not_planned';
    expect(filterNotificationByState(mockPartialNotification, 'closed')).toBe(
      true,
    );

    // Merged states
    mockPartialNotification.subject.state = 'merged';
    expect(filterNotificationByState(mockPartialNotification, 'merged')).toBe(
      true,
    );

    // Draft states
    mockPartialNotification.subject.state = 'draft';
    expect(filterNotificationByState(mockPartialNotification, 'draft')).toBe(
      true,
    );

    // Other states
    mockPartialNotification.subject.state = 'OUTDATED';
    expect(filterNotificationByState(mockPartialNotification, 'other')).toBe(
      true,
    );
  });
});
