import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { issueStatusFilter } from '../../utils/notifications/filters';
import { IssueStatusFilter } from './IssueStatusFilter';

describe('renderer/components/filters/IssueStatusFilter.tsx', () => {
  it('renders every issue status filter option', () => {
    renderWithProviders(<IssueStatusFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    const fieldset = screen.getByRole('heading', { name: 'Issue status' }).closest('fieldset');

    if (!fieldset) {
      throw new Error('Could not find the Issue status filter section');
    }

    const expectedCounts = new Map<string, number>();

    for (const details of Object.values(issueStatusFilter.FILTER_TYPES)) {
      expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
    }

    for (const [option, count] of expectedCounts) {
      expect(within(fieldset).getAllByRole('checkbox', { name: option })).toHaveLength(count);
    }
  });
});
