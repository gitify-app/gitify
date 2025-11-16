import { fireEvent, screen } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';
import { SearchFilter } from './SearchFilter';

const updateFilter = jest.fn();

describe('renderer/components/filters/SearchFilter.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Include Search Tokens', () => {
    it('adds include actor token with prefix', () => {
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

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
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

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
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'repo:gitify-app/gitify' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterIncludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized include prefixes', () => {
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, {
        target: { value: 'some:search' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilter).not.toHaveBeenCalledWith();
    });
  });

  describe('Exclude Search Tokens', () => {
    it('adds exclude actor token with prefix', () => {
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

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
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

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
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'repo:gitify-app/gitify' } });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilter).toHaveBeenCalledWith(
        'filterExcludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized exclude prefixes', () => {
      renderWithAppContext(<SearchFilter />, {
         settings: mockSettings, updateFilter  });

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'some:search' } });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilter).not.toHaveBeenCalledWith();
    });
  });
});
