import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

describe('renderer/components/filters/FilterSection.tsx', () => {
  const updateFilterMock = jest.fn();

  const mockFilter = stateFilter;
  const mockFilterSetting = 'filterStates';

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

      expect(tree).toMatchSnapshot();
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

      expect(tree).toMatchSnapshot();
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
          settings: {
            ...mockSettings,
            filterStates: [],
          },
          updateFilter: updateFilterMock,
        },
      );
    });

    await userEvent.click(screen.getByLabelText('Open'));

    expect(updateFilterMock).toHaveBeenCalledWith(
      mockFilterSetting,
      'open',
      true,
    );

    expect(
      screen.getByLabelText('Open').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle filter value - some filters already set', async () => {
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
          settings: {
            ...mockSettings,
            filterStates: ['open'],
          },
          updateFilter: updateFilterMock,
        },
      );
    });

    await userEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilterMock).toHaveBeenCalledWith(
      mockFilterSetting,
      'closed',
      true,
    );

    expect(
      screen.getByLabelText('Closed').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
