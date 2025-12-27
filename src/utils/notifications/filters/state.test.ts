import type {
  FilterStateType,
  GitifyNotification,
  GitifyNotificationState,
} from '../../../types';
import { stateFilter } from './state';

describe('renderer/utils/notifications/filters/state.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('can filter by notification states', () => {
    const mockNotification = {
      subject: { state: 'OPEN' },
    } as Partial<GitifyNotification> as GitifyNotification;

    const cases = {
      OPEN: 'open',
      REOPENED: 'open',

      CLOSED: 'closed',
      COMPLETED: 'closed',
      DUPLICATE: 'closed',
      NOT_PLANNED: 'closed',
      RESOLVED: 'closed',

      MERGE_QUEUE: 'merged',
      MERGED: 'merged',
      DRAFT: 'draft',

      // Discussion-specific
      ANSWERED: 'other',
      OUTDATED: 'other',

      // Check suite / workflow states
      ACTION_REQUIRED: 'other',
      CANCELLED: 'other',
      FAILURE: 'other',
      IN_PROGRESS: 'other',
      PENDING: 'other',
      QUEUED: 'other',
      REQUESTED: 'other',
      SKIPPED: 'other',
      STALE: 'other',
      SUCCESS: 'other',
      TIMED_OUT: 'other',
      WAITING: 'other',
    } satisfies Record<GitifyNotificationState, FilterStateType>;

    it.each(
      Object.entries(cases) as Array<
        [GitifyNotificationState, FilterStateType]
      >,
    )('filter notification with state %s as %s', (notificationState, expectedFilter) => {
      mockNotification.subject.state = notificationState;
      expect(
        stateFilter.filterNotification(mockNotification, expectedFilter),
      ).toBe(true);
    });
  });
});
