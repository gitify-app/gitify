import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { UserTypeFilter } from './UserTypeFilter';

describe('renderer/components/filters/UserTypeFilter.tsx', () => {
  const updateFilter = jest.fn();

  it('should render itself & its children - detailed notifications enabled', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          } as SettingsState,
          notifications: [],
        }}
      >
        <MemoryRouter>
          <UserTypeFilter />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - detailed notifications disabled', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: false,
          } as SettingsState,
          notifications: [],
        }}
      >
        <MemoryRouter>
          <UserTypeFilter />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should be able to toggle user type - none already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterUserTypes: [],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <UserTypeFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    // click the checkbox
    fireEvent.click(screen.getByLabelText('User'));

    // check if the checkbox is still unchecked
    expect(updateFilter).toHaveBeenCalledWith('filterUserTypes', 'User', true);

    expect(
      screen.getByLabelText('User').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle user type - some filters already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterUserTypes: ['User'],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <UserTypeFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    // click the checkbox
    fireEvent.click(screen.getByLabelText('Bot'));

    // check if the checkbox is still unchecked
    expect(updateFilter).toHaveBeenCalledWith('filterUserTypes', 'Bot', true);

    expect(
      screen.getByLabelText('Bot').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
