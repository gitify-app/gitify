import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { UserHandleFilter } from './UserHandleFilter';

describe('renderer/components/filters/UserHandleFilter.tsx', () => {
  const updateFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
          <UserHandleFilter />
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
          <UserHandleFilter />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Include user handles', () => {
    it('should be able to filter by include user handle - none already set', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: {
                ...mockSettings,
                filterIncludeHandles: [],
              },
              notifications: [],
              updateFilter,
            }}
          >
            <UserHandleFilter />
          </AppContext.Provider>,
        );
      });

      await userEvent.type(
        screen.getByTitle('Include handles'),
        'github-user{enter}',
      );

      expect(updateFilter).toHaveBeenCalledWith(
        'filterIncludeHandles',
        'github-user',
        true,
      );
    });

    it('should not allow duplicate include user handle', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: {
                ...mockSettings,
                filterIncludeHandles: ['github-user'],
              },
              notifications: [],
              updateFilter,
            }}
          >
            <UserHandleFilter />
          </AppContext.Provider>,
        );
      });

      await userEvent.type(
        screen.getByTitle('Include handles'),
        'github-user{enter}',
      );

      expect(updateFilter).toHaveBeenCalledTimes(0);
    });
  });

  describe('Exclude user handles', () => {
    it('should be able to filter by exclude user handle - none already set', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: {
                ...mockSettings,
                filterExcludeHandles: [],
              },
              notifications: [],
              updateFilter,
            }}
          >
            <UserHandleFilter />
          </AppContext.Provider>,
        );
      });

      await userEvent.type(
        screen.getByTitle('Exclude handles'),
        'github-user{enter}',
      );

      expect(updateFilter).toHaveBeenCalledWith(
        'filterExcludeHandles',
        'github-user',
        true,
      );
    });

    it('should not allow duplicate exclude user handle', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: {
                ...mockSettings,
                filterExcludeHandles: ['github-user'],
              },
              notifications: [],
              updateFilter,
            }}
          >
            <UserHandleFilter />
          </AppContext.Provider>,
        );
      });

      await userEvent.type(
        screen.getByTitle('Exclude handles'),
        'github-user{enter}',
      );

      expect(updateFilter).toHaveBeenCalledTimes(0);
    });
  });
});
