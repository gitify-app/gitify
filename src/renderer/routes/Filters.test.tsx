import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { FiltersRoute } from './Filters';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Filters.tsx', () => {
  const updateSetting = jest.fn();
  const clearFilters = jest.fn();
  const fetchNotifications = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
              notifications: [],
            }}
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
              notifications: [],
              fetchNotifications,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTestId('header-nav-back'));
      expect(fetchNotifications).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });

  describe('Users section', () => {
    // it('should not be able to toggle the hideBots checkbox when detailedNotifications is disabled', async () => {
    //   await act(async () => {
    //     render(
    //       <AppContext.Provider
    //         value={{
    //           auth: mockAuth,
    //           settings: {
    //             ...mockSettings,
    //             detailedNotifications: false,
    //           },
    //           notifications: [],
    //           updateSetting,
    //         }}
    //       >
    //         <MemoryRouter>
    //           <FiltersRoute />
    //         </MemoryRouter>
    //       </AppContext.Provider>,
    //     );
    //   });
    //   expect(
    //     screen
    //       .getByLabelText('Hide notifications from Bot accounts')
    //       .closest('input'),
    //   ).toHaveProperty('disabled', true);
    //   // click the checkbox
    //   fireEvent.click(
    //     screen.getByLabelText('Hide notifications from Bot accounts'),
    //   );
    //   // check if the checkbox is still unchecked
    //   expect(updateSetting).not.toHaveBeenCalled();
    //   expect(
    //     screen.getByLabelText('Hide notifications from Bot accounts').parentNode
    //       .parentNode,
    //   ).toMatchSnapshot();
    // });
    // it('should be able to toggle the hideBots checkbox when detailedNotifications is enabled', async () => {
    //   await act(async () => {
    //     render(
    //       <AppContext.Provider
    //         value={{
    //           auth: mockAuth,
    //           settings: {
    //             ...mockSettings,
    //             detailedNotifications: true,
    //             hideBots: false,
    //           },
    //           notifications: [],
    //           updateSetting,
    //         }}
    //       >
    //         <MemoryRouter>
    //           <FiltersRoute />
    //         </MemoryRouter>
    //       </AppContext.Provider>,
    //     );
    //   });
    //   expect(
    //     screen
    //       .getByLabelText('Hide notifications from Bot accounts')
    //       .closest('input'),
    //   ).toHaveProperty('disabled', false);
    //   // click the checkbox
    //   fireEvent.click(
    //     screen.getByLabelText('Hide notifications from Bot accounts'),
    //   );
    //   // check if the checkbox is still unchecked
    //   expect(updateSetting).toHaveBeenCalledWith('hideBots', true);
    //   expect(
    //     screen.getByLabelText('Hide notifications from Bot accounts').parentNode
    //       .parentNode,
    //   ).toMatchSnapshot();
    // });
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
                filterReasons: [],
              },
              notifications: [],
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
      expect(updateSetting).toHaveBeenCalledWith('filterReasons', ['mention']);

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
                filterReasons: ['security_alert'],
              },
              notifications: [],
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
      expect(updateSetting).toHaveBeenCalledWith('filterReasons', [
        'security_alert',
        'mention',
      ]);

      expect(
        screen.getByLabelText('Mentioned').parentNode.parentNode,
      ).toMatchSnapshot();
    });
  });

  describe('Footer section', () => {
    it('should clear filters', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
              notifications: [],
              clearFilters,
            }}
          >
            <MemoryRouter>
              <FiltersRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTestId('filters-clear'));

      expect(clearFilters).toHaveBeenCalled();
    });
  });
});
