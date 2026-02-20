import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('should render itself & its children', () => {
    it('with detailed notifications enabled', () => {
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
      renderWithAppContext(
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

    expect(updateFilterSpy).toHaveBeenCalledWith(
      mockFilterSetting,
      'open',
      true,
    );

    expect(
      screen.getByLabelText('Open').parentNode.parentNode,
    ).toMatchSnapshot();
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
        {
          settings: mockSettings,
        },
      );
    });

    await userEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilterSpy).toHaveBeenCalledWith(
      mockFilterSetting,
      'closed',
      true,
    );

    expect(
      screen.getByLabelText('Closed').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
