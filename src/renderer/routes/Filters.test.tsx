import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { FiltersRoute } from './Filters';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Filters.tsx', () => {
  const mockClearFilters = jest.fn();
  const mockFetchNotifications = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />);
      });

      expect(screen.getByTestId('filters')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />, {
          fetchNotifications: mockFetchNotifications,
        });
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Footer section', () => {
    it('should clear filters', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />, {
          clearFilters: mockClearFilters,
        });
      });

      await userEvent.click(screen.getByTestId('filters-clear'));

      expect(mockClearFilters).toHaveBeenCalled();
    });
  });
});
