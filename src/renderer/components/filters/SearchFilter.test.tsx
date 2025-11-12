import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SearchFilter } from './SearchFilter';

const updateFilter = vi.fn();

describe('renderer/components/filters/SearchFilter.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Include Search Tokens', () => {
    it('adds include actor token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterIncludeSearchTokens',
        'author:octocat',
        true,
      );
    });

    it('adds include org token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterIncludeSearchTokens',
        'org:gitify-app',
        true,
      );
    });

    it('adds include repo token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'repo:gitify-app/gitify' },
      });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterIncludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized include prefixes', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'some:search' },
      });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).not.toHaveBeenCalledWith();
    });
  });

  describe('Exclude Search Tokens', () => {
    it('adds exclude actor token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const includeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterExcludeSearchTokens',
        'author:octocat',
        true,
      );
    });

    it('adds exclude org token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterExcludeSearchTokens',
        'org:gitify-app',
        true,
      );
    });

    it('adds exclude repo token with prefix', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'repo:gitify-app/gitify' },
      });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterExcludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized exclude prefixes', () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings, updateFilter }}>
          <SearchFilter />
        </AppContext.Provider>,
      );

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'some:search' },
      });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilter).not.toHaveBeenCalledWith();
    });
  });
});
