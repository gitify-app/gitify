import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  const updateFilter = jest.fn();

  describe('should render itself & its children', () => {
    it('with detailed notifications enabled', () => {
      const tree = render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              detailedNotifications: true,
            } as SettingsState,
            notifications: mockAccountNotifications,
          }}
        >
          <MemoryRouter>
            <StateFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('with detailed notifications disabled', () => {
      const tree = render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              detailedNotifications: false,
            } as SettingsState,
            notifications: mockAccountNotifications,
          }}
        >
          <MemoryRouter>
            <StateFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });

  it('should be able to toggle user type - none already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterStates: [],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <StateFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Open'));

    expect(updateFilter).toHaveBeenCalledWith('filterStates', 'open', true);

    expect(
      screen.getByLabelText('Open').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle user type - some filters already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterStates: ['open'],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <StateFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Closed'));

    expect(updateFilter).toHaveBeenCalledWith('filterStates', 'closed', true);

    expect(
      screen.getByLabelText('Closed').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
