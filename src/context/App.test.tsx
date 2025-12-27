import { act, fireEvent, waitFor } from '@testing-library/react';
import { useContext } from 'react';

import type { AxiosResponse } from 'axios';
import type { Mock } from 'vitest';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockSettings } from '../__mocks__/state-mocks';
import { Constants } from '../constants';
import { useNotifications } from '../hooks/useNotifications';
import type { AuthState, Hostname, SettingsState, Token } from '../types';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import * as apiRequests from '../utils/api/request';
import * as notifications from '../utils/notifications/notifications';
import * as storage from '../utils/storage';
import * as tray from '../utils/tray';
import { AppContext, type AppContextState, AppProvider } from './App';
import { defaultSettings } from './defaults';

// Mock isTauriEnvironment to return false so axios is used instead of Tauri fetch
vi.mock('../utils/environment', () => ({
  isTauriEnvironment: () => false,
}));

// Mock decryptValue since isTauriEnvironment is false
vi.mock('../utils/comms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/comms')>();
  return {
    ...actual,
    decryptValue: vi.fn().mockResolvedValue('decrypted'),
    encryptValue: vi.fn().mockResolvedValue('encrypted'),
  };
});

vi.mock('../hooks/useNotifications');

// Helper to render a button that calls a context method when clicked
const renderContextButton = (
  contextMethodName: keyof AppContextState,
  ...args: unknown[]
) => {
  const TestComponent = () => {
    const context = useContext(AppContext);
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
  const mockFetchNotifications = vi.fn();
  const markNotificationsAsReadMock = vi.fn();
  const markNotificationsAsDoneMock = vi.fn();
  const unsubscribeNotificationMock = vi.fn();

  const saveStateSpy = vi
    .spyOn(storage, 'saveState')
    .mockImplementation(vi.fn());

  beforeEach(() => {
    vi.useFakeTimers();
    (useNotifications as Mock).mockReturnValue({
      fetchNotifications: mockFetchNotifications,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('notification methods', () => {
    const setTrayIconColorAndTitleSpy = vi
      .spyOn(tray, 'setTrayIconColorAndTitle')
      .mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getNotificationCount').mockImplementation(vi.fn());

    vi.spyOn(notifications, 'getUnreadNotificationCount').mockImplementation(
      vi.fn(),
    );

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
        vi.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(mockFetchNotifications).toHaveBeenCalledTimes(3);

      act(() => {
        vi.advanceTimersByTime(
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
        mockSingleNotification,
      ]);

      fireEvent.click(button);

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const { button } = renderContextButton('markNotificationsAsDone', [
        mockSingleNotification,
      ]);

      fireEvent.click(button);

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockSingleNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const { button } = renderContextButton(
        'unsubscribeNotification',
        mockSingleNotification,
      );

      fireEvent.click(button);

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockSingleNotification,
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('authentication methods', () => {
    const apiRequestAuthSpy = vi.spyOn(apiRequests, 'apiRequestAuth');

    it('should call loginWithGitHubApp', async () => {
      const { button } = renderContextButton('loginWithGitHubApp');

      fireEvent.click(button);

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );
    });

    it('should call loginWithOAuthApp', async () => {
      const { button } = renderContextButton('loginWithOAuthApp');

      fireEvent.click(button);

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );
    });

    it('should call loginWithPersonalAccessToken', async () => {
      apiRequestAuthSpy.mockResolvedValueOnce({} as AxiosResponse);

      const { button } = renderContextButton('loginWithPersonalAccessToken', {
        hostname: 'github.com' as Hostname,
        token: '123-456' as Token,
      });

      fireEvent.click(button);

      await waitFor(() =>
        expect(mockFetchNotifications).toHaveBeenCalledTimes(1),
      );

      expect(apiRequestAuthSpy).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthSpy).toHaveBeenCalledWith(
        'https://api.github.com/notifications',
        'HEAD',
        'encrypted',
      );
    });
  });

  describe('settings methods', () => {
    const saveStateSpy = vi
      .spyOn(storage, 'saveState')
      .mockImplementation(vi.fn());

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
