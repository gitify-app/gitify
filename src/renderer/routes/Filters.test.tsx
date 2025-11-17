import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { FiltersRoute } from './Filters';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/Filters.tsx', () => {
  const clearFiltersMock = jest.fn();
  const fetchNotificationsMock = jest.fn();

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
        renderWithAppContext(<FiltersRoute />, {
          clearFilters: clearFiltersMock,
        });
      });

      await userEvent.click(screen.getByTestId('filters-clear'));

      expect(clearFiltersMock).toHaveBeenCalled();
    });
  });
});
