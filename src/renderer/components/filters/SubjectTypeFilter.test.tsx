import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { subjectTypeFilter } from '../../utils/notifications/filters';
import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  it('renders every type filter option', () => {
    renderWithProviders(<SubjectTypeFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    const fieldset = screen.getByRole('heading', { name: 'Type' }).closest('fieldset');

    if (!fieldset) {
      throw new Error('Could not find the Type filter section');
    }

    const expectedCounts = new Map<string, number>();

    for (const details of Object.values(subjectTypeFilter.FILTER_TYPES)) {
      expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
    }

    for (const [option, count] of expectedCounts) {
      expect(within(fieldset).getAllByRole('checkbox', { name: option })).toHaveLength(count);
    }
  });
});
