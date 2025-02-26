import type { Notification } from '../../../typesGitHub';
import { stateFilter } from './state';

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
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'open'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'reopened';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'open'),
    ).toBe(true);

    // Closed states
    mockPartialNotification.subject.state = 'closed';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'completed';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'not_planned';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    // Merged states
    mockPartialNotification.subject.state = 'merged';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'merged'),
    ).toBe(true);

    // Draft states
    mockPartialNotification.subject.state = 'draft';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'draft'),
    ).toBe(true);

    // Other states
    mockPartialNotification.subject.state = 'OUTDATED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'other'),
    ).toBe(true);
  });
});
