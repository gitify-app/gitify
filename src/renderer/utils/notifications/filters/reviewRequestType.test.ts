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
    it('should return false when no review request types are selected', () => {
      expect(reviewRequestTypeFilter.hasFilters()).toBe(false);
    });

    it('should return true when review request types are selected', () => {
      act(() => {
        useFiltersStore.getState().updateFilter('reviewRequestTypes', 'direct', true);
      });
      expect(reviewRequestTypeFilter.hasFilters()).toBe(true);
    });
  });

  describe('isFilterSet', () => {
    it('should return false when type is not selected', () => {
      expect(reviewRequestTypeFilter.isFilterSet('direct')).toBe(false);
    });

    it('should return true when type is selected', () => {
      act(() => {
        useFiltersStore.getState().updateFilter('reviewRequestTypes', 'team', true);
      });
      expect(reviewRequestTypeFilter.isFilterSet('team')).toBe(true);
    });
  });

  describe('getTypeDetails', () => {
    it('should return details for direct', () => {
      const details = reviewRequestTypeFilter.getTypeDetails('direct');
      expect(details.title).toBe('Direct');
      expect(details.description).toBe('You were directly requested as a reviewer.');
    });

    it('should return details for team', () => {
      const details = reviewRequestTypeFilter.getTypeDetails('team');
      expect(details.title).toBe('Team');
      expect(details.description).toBe('A team you are a member of was requested to review.');
    });
  });

  describe('filterNotification', () => {
    it('should return true when notification has matching review request type', () => {
      const notification = {
        subject: { reviewRequested: ['direct'] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(true);
    });

    it('should return false when notification does not have matching review request type', () => {
      const notification = {
        subject: { reviewRequested: ['team'] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(false);
    });

    it('should return false when notification has no reviewRequested data', () => {
      const notification = {} satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(false);
    });

    it('should return false when reviewRequested is empty', () => {
      const notification = {
        subject: { reviewRequested: [] as ReviewRequestType[] },
      } satisfies DeepPartial<GitifyNotification> as GitifyNotification;

      expect(reviewRequestTypeFilter.filterNotification(notification, 'direct')).toBe(false);
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

    it('should count notifications matching the type', () => {
      const accountNotifications = [
        buildNotification(['direct']),
        buildNotification(['team']),
        buildNotification(['direct', 'team']),
      ];

      const count = reviewRequestTypeFilter.getFilterCount(accountNotifications, 'direct');
      expect(count).toBe(2);
    });

    it('should return 0 when no notifications match', () => {
      const accountNotifications = [buildNotification(['team'])];

      const count = reviewRequestTypeFilter.getFilterCount(accountNotifications, 'direct');
      expect(count).toBe(0);
    });
  });

  describe('requiresDetailsNotifications', () => {
    it('should be true', () => {
      expect(reviewRequestTypeFilter.requiresDetailsNotifications).toBe(true);
    });
  });
});
