import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { reasonFilter } from '../../utils/notifications/filters';
import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  it('renders every reason filter option', () => {
    renderWithProviders(<ReasonFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    const fieldset = screen.getByRole('heading', { name: 'Reason' }).closest('fieldset');

    if (!fieldset) {
      throw new Error('Could not find the Reason filter section');
    }

    const expectedCounts = new Map<string, number>();

    for (const details of Object.values(reasonFilter.FILTER_TYPES)) {
      expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
    }

    for (const [title, count] of expectedCounts) {
      expect(within(fieldset).getAllByRole('checkbox', { name: title })).toHaveLength(count);
    }
  });
});
