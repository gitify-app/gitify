import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockMultipleAccountNotifications,
  mockPartialGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { useFiltersStore } from '../../stores';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

describe('renderer/components/filters/FilterSection.tsx', () => {
  const mockFilter = stateFilter;
  const mockFilterSetting = 'states';

  let updateFilterSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateFilterSpy = vi.spyOn(useFiltersStore.getState(), 'updateFilter');
  });

  describe('should render itself & its children', () => {
    it('with detailed notifications enabled', () => {
      const tree = renderWithProviders(
        <FilterSection
          filter={{
            ...mockFilter,
            requiresDetailsNotifications: true,
          }}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
        {
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          },
          notifications: mockMultipleAccountNotifications,
        },
      );

      expect(tree.container).toMatchSnapshot();
    });

    it('with detailed notifications disabled', () => {
      const tree = renderWithProviders(
        <FilterSection
          filter={{
            ...mockFilter,
            requiresDetailsNotifications: false,
          }}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
        {
          settings: {
            ...mockSettings,
            detailedNotifications: false,
          },
          notifications: mockMultipleAccountNotifications,
        },
      );

      expect(tree.container).toMatchSnapshot();
    });
  });

  it('should be able to toggle filter value - none already set', async () => {
    await act(async () => {
      renderWithProviders(
        <FilterSection
          filter={mockFilter}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
        {
          settings: mockSettings,
        },
      );
    });

    await userEvent.click(screen.getByLabelText('Open'));

    expect(updateFilterSpy).toHaveBeenCalledWith(mockFilterSetting, 'open', true);
  });

  it('should be able to toggle filter value - some filters already set', async () => {
    await act(async () => {
      renderWithProviders(
        <FilterSection
          filter={mockFilter}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
        {
          settings: mockSettings,
          filters: {
            states: ['open'],
          },
        },
      );
    });

    await userEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilterSpy).toHaveBeenCalledWith(mockFilterSetting, 'closed', true);
  });

  it('should count notifications from the currently filtered list', () => {
    const filteredNotifications = [
      mockPartialGitifyNotification({ state: 'OPEN' }),
      mockPartialGitifyNotification({ state: 'CLOSED' }),
      mockPartialGitifyNotification({ state: 'MERGED' }),
    ].map((notification) => ({
      account: notification.account,
      notifications: [notification],
      error: null,
    }));

    renderWithProviders(
      <FilterSection
        filter={mockFilter}
        filterSetting={mockFilterSetting}
        icon={MarkGithubIcon}
        id={'FilterSectionTest'}
        title={'FilterSectionTitle'}
      />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: true,
        },
        notifications: filteredNotifications,
      },
    );

    const counters = getCounterValues();
    expect(counters.reduce((sum, value) => sum + value, 0)).toBe(3);
  });

  it('should rescale counts when a filter in another section is toggled', () => {
    renderWithProviders(
      <FilterSection
        filter={mockFilter}
        filterSetting={mockFilterSetting}
        icon={MarkGithubIcon}
        id={'FilterSectionTest'}
        title={'FilterSectionTitle'}
      />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: true,
        },
        notifications: [
          mockPartialGitifyNotification({ state: 'OPEN' }),
          mockPartialGitifyNotification({ state: 'CLOSED' }),
          mockPartialGitifyNotification({ state: 'MERGED' }),
        ].map((notification) => ({
          account: notification.account,
          notifications: [notification],
          error: null,
        })),
      },
    );

    const before = getCounterValues();
    expect(before.reduce((sum, value) => sum + value, 0)).toBe(3);

    act(() => {
      useFiltersStore.getState().updateFilter('reasons', 'mention', true);
    });

    const after = getCounterValues();
    expect(after).toEqual(before);
  });

  function getCounterValues(): number[] {
    return Array.from(document.querySelectorAll('span.text-gitify-counter-text')).map((el) =>
      Number.parseInt(el.textContent ?? '0', 10),
    );
  }
});
