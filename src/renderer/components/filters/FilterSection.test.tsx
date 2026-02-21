import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { useFiltersStore, useSettingsStore } from '../../stores';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

describe('renderer/components/filters/FilterSection.tsx', () => {
  const mockFilter = stateFilter;
  const mockFilterSetting = 'states';

  let updateFilterSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateFilterSpy = vi.spyOn(useFiltersStore.getState(), 'updateFilter');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('should render itself & its children', () => {
    it('with detailed notifications enabled', () => {
      useSettingsStore.setState({ detailedNotifications: true });

      const tree = renderWithAppContext(
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
          notifications: mockMultipleAccountNotifications,
        },
      );

      expect(tree.container).toMatchSnapshot();
    });

    it('with detailed notifications disabled', () => {
      useSettingsStore.setState({ detailedNotifications: false });

      const tree = renderWithAppContext(
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
          notifications: mockMultipleAccountNotifications,
        },
      );

      expect(tree.container).toMatchSnapshot();
    });
  });

  it('should be able to toggle filter value - none already set', async () => {
    await act(async () => {
      renderWithAppContext(
        <FilterSection
          filter={mockFilter}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
      );
    });

    await userEvent.click(screen.getByLabelText('Open'));

    expect(updateFilterSpy).toHaveBeenCalledWith(
      mockFilterSetting,
      'open',
      true,
    );
  });

  it('should be able to toggle filter value - some filters already set', async () => {
    useFiltersStore.setState({
      states: ['open'],
    });

    await act(async () => {
      renderWithAppContext(
        <FilterSection
          filter={mockFilter}
          filterSetting={mockFilterSetting}
          icon={MarkGithubIcon}
          id={'FilterSectionTest'}
          title={'FilterSectionTitle'}
        />,
      );
    });

    await userEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilterSpy).toHaveBeenCalledWith(
      mockFilterSetting,
      'closed',
      true,
    );
  });
});
