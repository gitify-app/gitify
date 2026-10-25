import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { stateFilter } from '../../utils/notifications/filters';
import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  it('renders every state filter option', () => {
    renderWithProviders(<StateFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    const fieldset = screen.getByRole('heading', { name: 'State' }).closest('fieldset');

    if (!fieldset) {
      throw new Error('Could not find the State filter section');
    }

    const expectedCounts = new Map<string, number>();

    for (const details of Object.values(stateFilter.FILTER_TYPES)) {
      expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
    }

    for (const [option, count] of expectedCounts) {
      expect(within(fieldset).getAllByRole('checkbox', { name: option })).toHaveLength(count);
    }
  });
});
