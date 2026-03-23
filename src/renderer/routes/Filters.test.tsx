import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';

import { type FiltersStore, useFiltersStore } from '../stores';
import { FiltersRoute } from './Filters';

describe('renderer/routes/Filters.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  let resetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // spy the actions on the real store
    resetSpy = vi.spyOn(useFiltersStore.getState() as FiltersStore, 'reset');
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />);
      });

      expect(screen.getByTestId('filters')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />, {
          fetchNotifications: fetchNotificationsMock,
        });
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('Footer section', () => {
    it('should clear filters', async () => {
      await act(async () => {
        renderWithProviders(<FiltersRoute />);
      });

      await userEvent.click(screen.getByTestId('filters-clear'));

      expect(resetSpy).toHaveBeenCalled();
    });
  });
});
