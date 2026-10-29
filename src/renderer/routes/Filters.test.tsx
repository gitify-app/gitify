import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockAuth } from '../__mocks__/state-mocks';

import { type FiltersStore, useFiltersStore } from '../stores';

import type { TypeDetails } from '../types';

import {
  type Filter,
  reasonFilter,
  reviewRequestTypeFilter,
  stateFilter,
  subjectTypeFilter,
  userTypeFilter,
} from '../utils/notifications/filters';
import { FiltersRoute } from './Filters';

describe('renderer/routes/Filters.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  let resetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // spy the actions on the real store
    resetSpy = vi.spyOn(useFiltersStore.getState() as FiltersStore, 'reset');
  });

  describe('General', () => {
    it('renders the filter sections and footer', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />, {
          accounts: mockAuth.accounts,
        });
      });

      expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();

      const section = (name: string) => {
        const fieldset = screen.getByRole('heading', { name }).closest('fieldset');

        if (!fieldset) {
          throw new Error(`Could not find the ${name} filter section`);
        }

        return fieldset;
      };

      for (const name of [
        'Account',
        'Search',
        'User Type',
        'Type',
        'State',
        'Review Request Type',
        'Reason',
      ]) {
        expect(screen.getByRole('heading', { name })).toBeInTheDocument();
      }

      const expectFilterOptions = <T extends string>(name: string, filter: Filter<T>) => {
        const fieldset = section(name);
        const expectedCounts = new Map<string, number>();

        for (const details of Object.values(filter.FILTER_TYPES) as TypeDetails[]) {
          expectedCounts.set(details.title, (expectedCounts.get(details.title) ?? 0) + 1);
        }

        for (const [title, count] of expectedCounts) {
          expect(within(fieldset).getAllByRole('checkbox', { name: title })).toHaveLength(count);
        }
      };

      expectFilterOptions('User Type', userTypeFilter);
      expectFilterOptions('Type', subjectTypeFilter);
      expectFilterOptions('State', stateFilter);
      expectFilterOptions('Review Request Type', reviewRequestTypeFilter);
      expectFilterOptions('Reason', reasonFilter);

      const accountSection = section('Account');
      const expectedAccountCounts = new Map<string, number>();

      for (const account of mockAuth.accounts) {
        const label = account.user?.login ?? account.hostname;
        expectedAccountCounts.set(label, (expectedAccountCounts.get(label) ?? 0) + 1);
      }

      for (const [label, count] of expectedAccountCounts) {
        expect(within(accountSection).getAllByRole('checkbox', { name: label })).toHaveLength(
          count,
        );
      }

      const searchSection = section('Search');
      expect(
        within(searchSection).getByRole('textbox', { name: 'Include searches' }),
      ).toBeInTheDocument();
      expect(
        within(searchSection).getByRole('textbox', { name: 'Exclude searches' }),
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    });

    it('goes back by pressing the icon', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />, {
          fetchNotifications: fetchNotificationsMock,
        });
      });

      await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('Footer section', () => {
    it('clears filters', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />);
      });

      await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(resetSpy).toHaveBeenCalled();
    });
  });
});
