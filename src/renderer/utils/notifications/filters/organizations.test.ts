import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Notification } from '../../../typesGitHub';
import {
  filterNotificationByOrganization,
  hasExcludeOrganizationFilters,
  hasIncludeOrganizationFilters,
} from './organizations';

describe('utils/notifications/filters/organizations.ts', () => {
  it('should check if include organization filters exist', () => {
    const settingsWithInclude = {
      ...mockSettings,
      filterIncludeOrganizations: ['microsoft'],
    };

    expect(hasIncludeOrganizationFilters(mockSettings)).toBe(false);
    expect(hasIncludeOrganizationFilters(settingsWithInclude)).toBe(true);
  });

  it('should check if exclude organization filters exist', () => {
    const settingsWithExclude = {
      ...mockSettings,
      filterExcludeOrganizations: ['github'],
    };

    expect(hasExcludeOrganizationFilters(mockSettings)).toBe(false);
    expect(hasExcludeOrganizationFilters(settingsWithExclude)).toBe(true);
  });

  it('should filter notification by organization', () => {
    const notification = {
      repository: {
        owner: {
          login: 'microsoft',
        },
      },
    } as Notification;

    expect(filterNotificationByOrganization(notification, 'microsoft')).toBe(
      true,
    );
    expect(filterNotificationByOrganization(notification, 'github')).toBe(
      false,
    );
  });
});
