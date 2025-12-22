import type { Notification } from '../../../typesGitHub';
import { stateFilter } from './state';

describe('renderer/utils/notifications/filters/state.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can filter by notification states', () => {
    const mockPartialNotification = {
      subject: {
        state: 'OPEN',
      },
    } as Partial<Notification> as Notification;

    // Open states
    mockPartialNotification.subject.state = 'OPEN';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'open'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'REOPENED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'open'),
    ).toBe(true);

    // Closed states
    mockPartialNotification.subject.state = 'CLOSED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'COMPLETED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    mockPartialNotification.subject.state = 'NOT_PLANNED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'closed'),
    ).toBe(true);

    // Merged states
    mockPartialNotification.subject.state = 'MERGED';
    expect(
      stateFilter.filterNotification(mockPartialNotification, 'merged'),
    ).toBe(true);

    // Draft states
    mockPartialNotification.subject.state = 'DRAFT';
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
