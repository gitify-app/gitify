import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { FiltersRoute } from './Filters';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate }));

describe('renderer/routes/Filters.tsx', () => {
  const clearFilters = jest.fn();
  const fetchNotifications = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />, {
          
            auth: mockAuth,
            settings: mockSettings,
            notifications: [] });
      });

      expect(screen.getByTestId('filters')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />, {
          
            auth: mockAuth,
            settings: mockSettings,
            notifications: [],
            fetchNotifications });
      });

      await userEvent.click(screen.getByTestId('header-nav-back'));

      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Footer section', () => {
    it('should clear filters', async () => {
      await act(async () => {
        renderWithAppContext(<FiltersRoute />, {
          
            auth: mockAuth,
            settings: mockSettings,
            notifications: [],
            clearFilters });
      });

      await userEvent.click(screen.getByTestId('filters-clear'));

      expect(clearFilters).toHaveBeenCalled();
    });
  });
});
