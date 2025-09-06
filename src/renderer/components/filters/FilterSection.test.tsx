import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

describe('renderer/components/filters/FilterSection.tsx', () => {
  const updateFilter = jest.fn();

  const mockFilter = stateFilter;
  const mockFilterSetting = 'filterStates';

  describe('should render itself & its children', () => {
    it('with detailed notifications enabled', () => {
      const tree = render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              detailedNotifications: true,
            } as SettingsState,
            notifications: mockAccountNotifications,
          }}
        >
          <FilterSection
            filter={{
              ...mockFilter,
              requiresDetailsNotifications: true,
            }}
            filterSetting={mockFilterSetting}
            icon={MarkGithubIcon}
            id={'FilterSectionTest'}
            title={'FilterSectionTitle'}
          />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('with detailed notifications disabled', () => {
      const tree = render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              detailedNotifications: false,
            } as SettingsState,
            notifications: mockAccountNotifications,
          }}
        >
          <FilterSection
            filter={{
              ...mockFilter,
              requiresDetailsNotifications: false,
            }}
            filterSetting={mockFilterSetting}
            icon={MarkGithubIcon}
            id={'FilterSectionTest'}
            title={'FilterSectionTitle'}
          />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });

  it('should be able to toggle filter value - none already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterStates: [],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <FilterSection
            filter={mockFilter}
            filterSetting={mockFilterSetting}
            icon={MarkGithubIcon}
            id={'FilterSectionTest'}
            title={'FilterSectionTitle'}
          />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByLabelText('Open'));

    expect(updateFilter).toHaveBeenCalledWith(mockFilterSetting, 'open', true);

    expect(
      screen.getByLabelText('Open').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle filter value - some filters already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterStates: ['open'],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <FilterSection
            filter={mockFilter}
            filterSetting={mockFilterSetting}
            icon={MarkGithubIcon}
            id={'FilterSectionTest'}
            title={'FilterSectionTitle'}
          />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilter).toHaveBeenCalledWith(
      mockFilterSetting,
      'closed',
      true,
    );

    expect(
      screen.getByLabelText('Closed').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
