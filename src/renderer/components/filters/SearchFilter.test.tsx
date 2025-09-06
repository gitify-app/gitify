import { fireEvent, render, screen } from '@testing-library/react';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SearchFilter } from './SearchFilter';

const updateFilter = jest.fn();

describe('renderer/components/filters/SearchFilter.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds include actor token with prefix', () => {
    render(
      <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
        <SearchFilter />
      </AppContext.Provider>,
    );

    const includeInput = screen.getByTitle('Include actors');
    fireEvent.change(includeInput, { target: { value: 'user:octocat' } });
    fireEvent.keyDown(includeInput, { key: 'Enter' });

    expect(updateFilter).toHaveBeenCalledWith(
      'filterIncludeActors',
      'user:octocat',
      true,
    );
  });
});
