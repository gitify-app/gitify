import { fireEvent, render, screen } from '@testing-library/react';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
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

  it('should handle organization includes', () => {
    const props = {
      updateFilter: mockUpdateFilter,
      settings: mockSettings,
    };

    render(
      <AppContext.Provider value={props}>
        <OrganizationFilter />
      </AppContext.Provider>,
    );

    const includeInput = screen.getByTitle('Include organizations');
    fireEvent.change(includeInput, { target: { value: 'microsoft' } });
    fireEvent.blur(includeInput);

    expect(mockUpdateFilter).toHaveBeenCalledWith(
      'filterIncludeOrganizations',
      'microsoft',
      true,
    );
  });

  it('should handle organization excludes', () => {
    const props = {
      updateFilter: mockUpdateFilter,
      settings: mockSettings,
    };

    render(
      <AppContext.Provider value={props}>
        <OrganizationFilter />
      </AppContext.Provider>,
    );

    const excludeInput = screen.getByTitle('Exclude organizations');
    fireEvent.change(excludeInput, { target: { value: 'github' } });
    fireEvent.blur(excludeInput);

    expect(mockUpdateFilter).toHaveBeenCalledWith(
      'filterExcludeOrganizations',
      'github',
      true,
    );
  });
});
