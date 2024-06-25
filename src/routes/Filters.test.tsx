import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext, defaultSettings } from '../context/App';
import { FiltersRoute } from './Filters';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Filters.tsx', () => {
  const updateSetting = jest.fn();
  const fetchNotifications = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{ auth: mockAuth, settings: mockSettings }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTestId('filters')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
              fetchNotifications,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Go Back'));
      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });
  describe('Users section', () => {
    it('should not be able to toggle the showBots checkbox when detailedNotifications is disabled', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                detailedNotifications: false,
                showBots: true,
              },
              updateSetting,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(
        screen
          .getByLabelText('Show notifications from Bot accounts')
          .closest('input'),
      ).toHaveProperty('disabled', true);

      // click the checkbox
      fireEvent.click(
        screen.getByLabelText('Show notifications from Bot accounts'),
      );

      // check if the checkbox is still unchecked
      expect(updateSetting).not.toHaveBeenCalled();

      expect(
        screen.getByLabelText('Show notifications from Bot accounts').parentNode
          .parentNode,
      ).toMatchSnapshot();
    });

    it('should be able to toggle the showBots checkbox when detailedNotifications is enabled', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                detailedNotifications: true,
                showBots: true,
              },
              updateSetting,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(
        screen
          .getByLabelText('Show notifications from Bot accounts')
          .closest('input'),
      ).toHaveProperty('disabled', false);

      // click the checkbox
      fireEvent.click(
        screen.getByLabelText('Show notifications from Bot accounts'),
      );

      // check if the checkbox is still unchecked
      expect(updateSetting).toHaveBeenCalledWith('showBots', false);

      expect(
        screen.getByLabelText('Show notifications from Bot accounts').parentNode
          .parentNode,
      ).toMatchSnapshot();
    });
  });

  describe('Reasons section', () => {
    it('should be able to toggle reason type - none already set', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                filterReasons: '',
              },
              updateSetting,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      // click the checkbox
      fireEvent.click(screen.getByLabelText('Mentioned'));

      // check if the checkbox is still unchecked
      expect(updateSetting).toHaveBeenCalledWith('filterReasons', 'mention');

      expect(
        screen.getByLabelText('Mentioned').parentNode.parentNode,
      ).toMatchSnapshot();
    });

    it('should be able to toggle reason type - some filters already set', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                filterReasons: 'security',
              },
              updateSetting,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      // click the checkbox
      fireEvent.click(screen.getByLabelText('Mentioned'));

      // check if the checkbox is still unchecked
      expect(updateSetting).toHaveBeenCalledWith(
        'filterReasons',
        'security,mention',
      );

      expect(
        screen.getByLabelText('Mentioned').parentNode.parentNode,
      ).toMatchSnapshot();
    });
  });

  describe('Footer section', () => {
    it('should reset filters', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
              updateSetting,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('Reset to default filters'));

      expect(updateSetting).toHaveBeenCalled();
      expect(updateSetting).toHaveBeenCalledWith(
        'showBots',
        defaultSettings.showBots,
      );
      expect(updateSetting).toHaveBeenCalledWith(
        'filterReasons',
        defaultSettings.filterReasons,
      );
    });
  });
});
