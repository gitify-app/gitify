import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { userTypeFilter } from '../../utils/notifications/filters';
import { UserTypeFilter } from './UserTypeFilter';

describe('renderer/components/filters/UserTypeFilter.tsx', () => {
  it('renders every user type filter option', () => {
    renderWithProviders(<UserTypeFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    const fieldset = screen.getByRole('heading', { name: 'User Type' }).closest('fieldset');

    if (!fieldset) {
      throw new Error('Could not find the User Type filter section');
    }

    const expectedCounts = new Map<string, number>();

    for (const details of Object.values(userTypeFilter.FILTER_TYPES)) {
      expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
    }

    for (const [option, count] of expectedCounts) {
      expect(within(fieldset).getAllByRole('checkbox', { name: option })).toHaveLength(count);
    }
  });
});
