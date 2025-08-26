import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { OrganizationFilter } from './OrganizationFilter';

const mockUpdateFilter = jest.fn();

describe('components/filters/OrganizationFilter.tsx', () => {
  beforeEach(() => {
    mockUpdateFilter.mockReset();
  });

  it('should render itself & its children', () => {
    const props = {
      updateFilter: mockUpdateFilter,
      settings: mockSettings,
    };

    render(
      <AppContext.Provider value={props}>
        <OrganizationFilter />
      </AppContext.Provider>,
    );

    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Include:')).toBeInTheDocument();
    expect(screen.getByText('Exclude:')).toBeInTheDocument();
  });

  describe('Include organizations', () => {
    it('should handle organization includes', async () => {
      const props = {
        updateFilter: mockUpdateFilter,
        settings: mockSettings,
      };

      render(
        <AppContext.Provider value={props}>
          <OrganizationFilter />
        </AppContext.Provider>,
      );

      await userEvent.type(
        screen.getByTitle('Include organizations'),
        'microsoft{enter}',
      );

      expect(mockUpdateFilter).toHaveBeenCalledWith(
        'filterIncludeOrganizations',
        'microsoft',
        true,
      );
    });

    it('should not allow duplicate include organizations', async () => {
      const props = {
        updateFilter: mockUpdateFilter,
        settings: {
          ...mockSettings,
          filterIncludeOrganizations: ['microsoft'],
        } as SettingsState,
      };

      render(
        <AppContext.Provider value={props}>
          <OrganizationFilter />
        </AppContext.Provider>,
      );

      await userEvent.type(
        screen.getByTitle('Include organizations'),
        'microsoft{enter}',
      );

      expect(mockUpdateFilter).toHaveBeenCalledTimes(0);
    });
  });

  describe('Exclude organizations', () => {
    it('should handle organization excludes', async () => {
      const props = {
        updateFilter: mockUpdateFilter,
        settings: mockSettings,
      };

      render(
        <AppContext.Provider value={props}>
          <OrganizationFilter />
        </AppContext.Provider>,
      );

      await userEvent.type(
        screen.getByTitle('Exclude organizations'),
        'github{enter}',
      );

      expect(mockUpdateFilter).toHaveBeenCalledWith(
        'filterExcludeOrganizations',
        'github',
        true,
      );
    });

    it('should not allow duplicate exclude organizations', async () => {
      const props = {
        updateFilter: mockUpdateFilter,
        settings: {
          ...mockSettings,
          filterExcludeOrganizations: ['github'],
        } as SettingsState,
      };

      render(
        <AppContext.Provider value={props}>
          <OrganizationFilter />
        </AppContext.Provider>,
      );

      await userEvent.type(
        screen.getByTitle('Exclude organizations'),
        'github{enter}',
      );

      expect(mockUpdateFilter).toHaveBeenCalledTimes(0);
    });
  });
});
