import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
          <MemoryRouter>
            <UserHandleFilter />
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
            <UserHandleFilter />
          </MemoryRouter>
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
            <MemoryRouter>
              <UserHandleFilter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.change(screen.getByTitle('Include handles'), {
        target: { value: 'github-user' },
      });

      fireEvent.keyDown(screen.getByTitle('Include handles'), {
        key: 'Enter',
        code: 'Enter',
      });

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
            <MemoryRouter>
              <UserHandleFilter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.change(screen.getByTitle('Include handles'), {
        target: { value: 'github-user' },
      });

      fireEvent.keyDown(screen.getByTitle('Include handles'), {
        key: 'Enter',
        code: 'Enter',
      });

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
            <MemoryRouter>
              <UserHandleFilter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.change(screen.getByTitle('Exclude handles'), {
        target: { value: 'github-user' },
      });

      fireEvent.keyDown(screen.getByTitle('Exclude handles'), {
        key: 'Enter',
        code: 'Enter',
      });

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
            <MemoryRouter>
              <UserHandleFilter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.change(screen.getByTitle('Exclude handles'), {
        target: { value: 'github-user' },
      });

      fireEvent.keyDown(screen.getByTitle('Exclude handles'), {
        key: 'Enter',
        code: 'Enter',
      });

      expect(updateFilter).toHaveBeenCalledTimes(0);
    });
  });
});
