import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { useFiltersStore } from '../../stores';

import { SearchFilter } from './SearchFilter';

describe('renderer/components/filters/SearchFilter.tsx', () => {
  let updateFilterSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateFilterSpy = vi.spyOn(useFiltersStore.getState(), 'updateFilter');
  });

  describe('Search tooltip', () => {
    it('lists the supported search qualifiers including commenter', async () => {
      renderWithProviders(<SearchFilter />);

      const tooltipIconElement = screen.getByTestId('tooltip-icon-tooltip-search');
      await userEvent.click(tooltipIconElement);

      expect(screen.getByText('Author (author:handle)')).toBeInTheDocument();
      expect(screen.getByText('Commenter (commenter:handle)')).toBeInTheDocument();
      expect(screen.getByText('Organization (org:name)')).toBeInTheDocument();
      expect(screen.getByText('Repository (repo:fullname)')).toBeInTheDocument();
    });
  });

  describe('Include Search Tokens', () => {
    it('adds include actor token with prefix', () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith('includeSearchTokens', 'author:octocat', true);
    });

    it('adds include org token with prefix', () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      fireEvent.change(includeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith('includeSearchTokens', 'org:gitify-app', true);
    });

    it('adds include repo token with prefix', () => {
      renderWithProviders(<SearchFilter />);

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
      renderWithProviders(<SearchFilter />);

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
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(includeInput, { target: { value: 'author:octocat' } });
      fireEvent.keyDown(includeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith('excludeSearchTokens', 'author:octocat', true);
    });

    it('adds exclude org token with prefix', () => {
      renderWithProviders(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, { target: { value: 'org:gitify-app' } });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilterSpy).toHaveBeenCalledWith('excludeSearchTokens', 'org:gitify-app', true);
    });

    it('adds exclude repo token with prefix', () => {
      renderWithProviders(<SearchFilter />);

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
      renderWithProviders(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      fireEvent.change(excludeInput, {
        target: { value: 'some:search' },
      });
      fireEvent.keyDown(excludeInput, { key: 'Enter' });

      expect(updateFilterSpy).not.toHaveBeenCalledWith();
    });
  });
});
