import { screen } from '@testing-library/react';
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

      const tooltipIconElement = screen.getByRole('button', { name: 'Help: Search' });
      await userEvent.click(tooltipIconElement);

      expect(screen.getByText('Author (author:handle)')).toBeInTheDocument();
      expect(screen.getByText('Commenter (commenter:handle)')).toBeInTheDocument();
      expect(screen.getByText('Organization (org:name)')).toBeInTheDocument();
      expect(screen.getByText('Repository (repo:fullname)')).toBeInTheDocument();
    });

    it('marks qualifiers that require detailed notifications as disabled', async () => {
      renderWithProviders(<SearchFilter />, { settings: { detailedNotifications: false } });

      const tooltipIconElement = screen.getByRole('button', { name: 'Help: Search' });
      await userEvent.click(tooltipIconElement);

      expect(screen.getByText('Author (author:handle)')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByText('Commenter (commenter:handle)')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  describe('Include Search Tokens', () => {
    it('adds include actor token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      await userEvent.type(includeInput, 'author:octocat{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith('includeSearchTokens', 'author:octocat', true);
    });

    it('adds include org token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      await userEvent.type(includeInput, 'org:gitify-app{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith('includeSearchTokens', 'org:gitify-app', true);
    });

    it('adds include repo token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      await userEvent.type(includeInput, 'repo:gitify-app/gitify{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'includeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized include prefixes', async () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Include searches');
      await userEvent.type(includeInput, 'some:search{Enter}');

      expect(updateFilterSpy).not.toHaveBeenCalledWith();
    });
  });

  describe('Exclude Search Tokens', () => {
    it('adds exclude actor token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const includeInput = screen.getByTitle('Exclude searches');
      await userEvent.type(includeInput, 'author:octocat{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith('excludeSearchTokens', 'author:octocat', true);
    });

    it('adds exclude org token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      await userEvent.type(excludeInput, 'org:gitify-app{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith('excludeSearchTokens', 'org:gitify-app', true);
    });

    it('adds exclude repo token with prefix', async () => {
      renderWithProviders(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      await userEvent.type(excludeInput, 'repo:gitify-app/gitify{Enter}');

      expect(updateFilterSpy).toHaveBeenCalledWith(
        'excludeSearchTokens',
        'repo:gitify-app/gitify',
        true,
      );
    });

    it('prevent unrecognized exclude prefixes', async () => {
      renderWithProviders(<SearchFilter />);

      const excludeInput = screen.getByTitle('Exclude searches');
      await userEvent.type(excludeInput, 'some:search{Enter}');

      expect(updateFilterSpy).not.toHaveBeenCalledWith();
    });
  });
});
