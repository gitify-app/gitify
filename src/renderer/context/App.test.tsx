import { act, fireEvent, waitFor } from '@testing-library/react';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { mockRawUser } from '../utils/api/__mocks__/response-mocks';

import { Constants } from '../constants';

import { useAppContext } from '../hooks/useAppContext';
import { useNotifications } from '../hooks/useNotifications';

import type { AuthState, SettingsState } from '../types';

import * as notifications from '../utils/notifications/notifications';
import * as storage from '../utils/storage';
import * as tray from '../utils/tray';
import { type AppContextState, AppProvider } from './App';
import { defaultSettings } from './defaults';

jest.mock('../hooks/useNotifications');

// Helper to render a button that calls a context method when clicked
const renderContextButton = (
  contextMethodName: keyof AppContextState,
  ...args: unknown[]
) => {
  const TestComponent = () => {
    const context = useAppContext();

    const method = context[contextMethodName];
    return (
      <button
        data-testid="context-method-button"
        onClick={() => {
          if (typeof method === 'function') {
            (method as (...args: unknown[]) => void)(...args);
          }
        }}
        type="button"
      >
        {String(contextMethodName)}
      </button>
    );
  };

  const result = renderWithAppContext(
    <AppProvider>
      <TestComponent />
    </AppProvider>,
  );

  const button = result.getByTestId('context-method-button');
  return { ...result, button };
};

describe('renderer/context/App.tsx', () => {
  const mockFetchNotifications = jest.fn();
  const markNotificationsAsReadMock = jest.fn();
  const markNotificationsAsDoneMock = jest.fn();
  const unsubscribeNotificationMock = jest.fn();

  const saveStateSpy = jest
    .spyOn(storage, 'saveState')
    .mockImplementation(jest.fn());

  beforeEach(() => {
    jest.useFakeTimers();
    (useNotifications as jest.Mock).mockReturnValue({
      fetchNotifications: mockFetchNotifications,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('notification methods', () => {
    const setTrayIconColorAndTitleSpy = jest
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getNotificationCount')
      .mockImplementation(jest.fn());

    jest
      .spyOn(notifications, 'getUnreadNotificationCount')
      .mockImplementation(jest.fn());

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: mockSettings,
    };

    it('fetch notifications each interval', async () => {
      renderWithAppContext(<AppProvider>{null}</AppProvider>);

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(3);

      act(() => {
        jest.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(4);
    });

    it('should call fetchNotifications', async () => {
      const { button } = renderContextButton('fetchNotifications');

      mockFetchNotifications.mockReset();

      fireEvent.click(button);

      expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const { button } = renderContextButton('markNotificationsAsRead', [
        mockGitifyNotification,
      ]);

      fireEvent.click(button);

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const { button } = renderContextButton('markNotificationsAsDone', [
        mockGitifyNotification,
      ]);

      fireEvent.click(button);

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const { button } = renderContextButton(
        'unsubscribeNotification',
        mockGitifyNotification,
      );

      fireEvent.click(button);

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockGitifyNotification,
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('settings methods', () => {
    const saveStateSpy = jest
      .spyOn(storage, 'saveState')
      .mockImplementation(jest.fn());

    it('should call updateSetting', async () => {
      const { button } = renderContextButton(
        'updateSetting',
        'participating',
        true,
      );

      fireEvent.click(button);

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          participating: true,
        } as SettingsState,
      });
    });

    it('should call resetSettings', async () => {
      const { button } = renderContextButton('resetSettings');

      fireEvent.click(button);

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: defaultSettings,
      });
    });
  });

  describe('filter methods', () => {
    it('should call updateFilter - checked', async () => {
      const { button } = renderContextButton(
        'updateFilter',
        'filterReasons',
        'assign',
        true,
      );

      fireEvent.click(button);

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          filterReasons: ['assign'],
        } as SettingsState,
      });
    });

    it('should call updateFilter - unchecked', async () => {
      const { button } = renderContextButton(
        'updateFilter',
        'filterReasons',
        'assign',
        false,
      );

      fireEvent.click(button);

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...defaultSettings,
          filterReasons: [],
        } as SettingsState,
      });
    });

    it('should clear filters back to default', async () => {
      const { button } = renderContextButton('clearFilters');

      fireEvent.click(button);

      expect(saveStateSpy).toHaveBeenCalledWith({
        auth: {
          accounts: [],
        } as AuthState,
        settings: {
          ...mockSettings,
          filterIncludeSearchTokens: defaultSettings.filterIncludeSearchTokens,
          filterExcludeSearchTokens: defaultSettings.filterExcludeSearchTokens,
          filterUserTypes: defaultSettings.filterUserTypes,
          filterSubjectTypes: defaultSettings.filterSubjectTypes,
          filterStates: defaultSettings.filterStates,
          filterReasons: defaultSettings.filterReasons,
        },
      });
    });
  });
});
