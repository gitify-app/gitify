import { act } from '@testing-library/react';

import type { DeepPartial } from '../../../__helpers__/test-utils';

import { useFiltersStore } from '../../../stores';

import type { AccountNotifications, GitifyNotification, ReviewRequestType } from '../../../types';

import { reviewRequestTypeFilter } from './reviewRequestType';

describe('renderer/utils/notifications/filters/reviewRequestType.ts', () => {
  beforeEach(() => {
    useFiltersStore.setState({ reviewRequestTypes: [] });
  });

  describe('hasFilters', () => {
    it('returns false when no review request types are selected', () => {
      expect(reviewRequestTypeFilter.hasFilters()).toBe(false);
    });

    it('returns true when review request types are selected', () => {
      act(() => {
        useFiltersStore.getState().updateFilter('reviewRequestTypes', 'direct', true);
      });
      expect(reviewRequestTypeFilter.hasFilters()).toBe(true);
    });
  });

  describe('isFilterSet', () => {
    it('returns false when type is not selected', () => {
      expect(reviewRequestTypeFilter.isFilterSet('direct')).toBe(false);
    });

    it('returns true when type is selected', () => {
      act(() => {
        useFiltersStore.getState().updateFilter('reviewRequestTypes', 'team', true);
      });
      expect(reviewRequestTypeFilter.isFilterSet('team')).toBe(true);
    });
  });

  describe('getTypeDetails', () => {
    it('returns details for direct', () => {
      const details = reviewRequestTypeFilter.getTypeDetails('direct');
      expect(details.title).toBe('Direct');
      expect(details.description).toBe('You were asked to review directly.');
    });

    it('returns details for team', () => {
      const details = reviewRequestTypeFilter.getTypeDetails('team');
      expect(details.title).toBe('Team');
      expect(details.description).toBe('A team you belong to was asked to review.');
    });

    it('returns details for other', () => {
      const details = reviewRequestTypeFilter.getTypeDetails('other');
      expect(details.title).toBe('Other');
    });
  });

  describe('filterNotification', () => {
    it('returns true when notification has matching review request type', () => {
      const notification = {
        subject: { reviewRequested: ['direct'] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(true);
    });

    it('returns false when notification does not have matching review request type', () => {
      const notification = {
        subject: { reviewRequested: ['team'] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(false);
    });

    it('returns true when notification has no reviewRequested data and filtering other', () => {
      const notification = {} satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'other')).toBe(true);
    });

    it('returns true when reviewRequested is empty and filtering other', () => {
      const notification = {
        subject: { reviewRequested: [] as ReviewRequestType[] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'other')).toBe(true);
    });

    it('returns false for other when review data is present', () => {
      const notification = {
        subject: { reviewRequested: ['team'] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'other')).toBe(false);
    });
  });

  describe('classify', () => {
    const buildClassifyNotification = (reviewRequested: ReviewRequestType[]): GitifyNotification =>
      ({ subject: { reviewRequested } }) as GitifyNotification;

    it('classifies direct as direct', () => {
      expect(reviewRequestTypeFilter.classify(buildClassifyNotification(['direct']))).toBe(
        'direct',
      );
    });

    it('classifies team as team', () => {
      expect(reviewRequestTypeFilter.classify(buildClassifyNotification(['team']))).toBe('team');
    });

    it('classifies direct and team under direct (precedence)', () => {
      expect(reviewRequestTypeFilter.classify(buildClassifyNotification(['direct', 'team']))).toBe(
        'direct',
      );
    });

    it('classifies empty review request data as other', () => {
      expect(reviewRequestTypeFilter.classify(buildClassifyNotification([]))).toBe('other');
    });

    it('classifies notification without review data as other', () => {
      expect(reviewRequestTypeFilter.classify({} as GitifyNotification)).toBe('other');
    });
  });

  describe('getFilterCount', () => {
    const buildNotification = (reviewRequested: ReviewRequestType[]): AccountNotifications => ({
      account: {} as AccountNotifications['account'],
      notifications: [
        {
          subject: { reviewRequested },
        } as GitifyNotification,
      ],
      error: null,
    });

    it('counts notifications matching the type using canonical buckets', () => {
      const accountNotifications = [
        buildNotification(['direct']),
        buildNotification(['team']),
        buildNotification(['direct', 'team']),
        buildNotification([]),
      ];

      // Both-requested PR counts only under direct; no-review-request counts under other.
      expect(reviewRequestTypeFilter.getFilterCount(accountNotifications, 'direct')).toBe(2);
      expect(reviewRequestTypeFilter.getFilterCount(accountNotifications, 'team')).toBe(1);
      expect(reviewRequestTypeFilter.getFilterCount(accountNotifications, 'other')).toBe(1);
    });

    it('returns 0 when no notifications match', () => {
      const accountNotifications = [buildNotification(['team'])];

      const count = reviewRequestTypeFilter.getFilterCount(accountNotifications, 'direct');
      expect(count).toBe(0);
    });
  });

  describe('requiresDetailsNotifications', () => {
    it('is true', () => {
      expect(reviewRequestTypeFilter.requiresDetailsNotifications).toBe(true);
    });
  });
});
