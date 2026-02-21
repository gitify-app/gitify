import { fireEvent, screen } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useFiltersStore } from '../../stores';

import { SearchFilter } from './SearchFilter';

describe('renderer/components/filters/SearchFilter.tsx', () => {
  let updateFilterSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateFilterSpy = vi.spyOn(useFiltersStore.getState(), 'updateFilter');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Include Search Tokens', () => {
    it('adds include actor token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'includeSearchTokens',
        'author:octocat',
        true,
      );
    });

    it('adds include org token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'includeSearchTokens',
        'org:gitify-app',
        true,
      );
    });

    it('adds include repo token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'repo:gitify-app/gitify' },
      });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'includeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized include prefixes', () => {
      renderWithAppContext(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'some:search' },
      });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).not.toHaveBeenCalledWith();
    });
  });

  describe('Exclude Search Tokens', () => {
    it('adds exclude actor token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const includeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'excludeSearchTokens',
        'author:octocat',
        true,
      );
    });

    it('adds exclude org token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'excludeSearchTokens',
        'org:gitify-app',
        true,
      );
    });

    it('adds exclude repo token with prefix', () => {
      renderWithAppContext(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'repo:gitify-app/gitify' },
      });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'excludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized exclude prefixes', () => {
      renderWithAppContext(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'some:search' },
      });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilterSpy).not.toHaveBeenCalledWith();
    });
  });
});
