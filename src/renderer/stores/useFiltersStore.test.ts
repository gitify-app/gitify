import { act, renderHook } from '@testing-library/react';

import type { AccountUUID, SearchToken } from '../types';

import { DEFAULT_FILTERS_STATE } from './defaults';
import useFiltersStore from './useFiltersStore';

describe('renderer/stores/useFiltersStore.ts', () => {
  test('starts with default filters', () => {
    const { result } = renderHook(() => useFiltersStore());

    expect(result.current).toMatchObject(DEFAULT_FILTERS_STATE);
  });

  test('updates a filter (add value)', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.updateFilter('subjectTypes', 'Issue', true);
    });

    expect(result.current.subjectTypes).toContain('Issue');
  });

  test('updates a filter (remove value)', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.updateFilter('subjectTypes', 'Issue', true);
      result.current.updateFilter('subjectTypes', 'Issue', false);
    });

    expect(result.current.subjectTypes).not.toContain('Issue');
  });

  test('resets filters to default', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.updateFilter('subjectTypes', 'Issue', true);
      result.current.reset();
    });

    expect(result.current).toMatchObject(DEFAULT_FILTERS_STATE);
  });

  describe('hasActiveFilters', () => {
    it('default filter settings', () => {
      expect(useFiltersStore.getState().hasActiveFilters()).toBe(false);
    });

    it('non-default include search tokens filters', () => {
      useFiltersStore.setState({
        includeSearchTokens: ['org:gitify-app' as SearchToken],
      });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });

    it('non-default exclude search tokens filters', () => {
      useFiltersStore.setState({
        excludeSearchTokens: ['org:gitify-app' as SearchToken],
      });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });

    it('non-default user types filters', () => {
      useFiltersStore.setState({ userTypes: ['Bot'] });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });

    it('non-default subject types filters', () => {
      useFiltersStore.setState({ subjectTypes: ['Issue'] });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });

    it('non-default state filters', () => {
      useFiltersStore.setState({ states: ['draft'] });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });

    it('non-default reason filters', () => {
      useFiltersStore.setState({ reasons: ['review_requested'] });

      expect(useFiltersStore.getState().hasActiveFilters()).toBe(true);
    });
  });

  describe('pruneAccounts', () => {
    it('keeps only account filters that match a known account', () => {
      useFiltersStore.setState({
        accounts: ['valid' as AccountUUID, 'stale' as AccountUUID],
      });

      useFiltersStore.getState().pruneAccounts(['valid' as AccountUUID]);

      expect(useFiltersStore.getState().accounts).toEqual(['valid']);
    });

    it('leaves state untouched when every account filter is still valid', () => {
      const accounts = ['valid' as AccountUUID];
      useFiltersStore.setState({ accounts });

      useFiltersStore.getState().pruneAccounts(['valid' as AccountUUID, 'other' as AccountUUID]);

      expect(useFiltersStore.getState().accounts).toBe(accounts);
    });
  });
});
