import { act } from '@testing-library/react';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Constants } from '../constants';

import { useAppContext } from '../hooks/useAppContext';
import { useNotifications } from '../hooks/useNotifications';

import { useAccountsStore } from '../stores';
import * as notifications from '../utils/notifications/notifications';
import * as tray from '../utils/system/tray';
import { type AppContextState, AppProvider } from './App';

vi.mock('../hooks/useNotifications');

// Helper to render the context
const renderWithContext = () => {
  let context!: AppContextState;

  const CaptureContext = () => {
    context = useAppContext();
    return null;
  };

  renderWithAppContext(
    <AppProvider>
      <CaptureContext />
    </AppProvider>,
  );

  return () => context;
};

describe('renderer/context/App.tsx', () => {
  const fetchNotificationsMock = vi.fn();
  const markNotificationsAsReadMock = vi.fn();
  const markNotificationsAsDoneMock = vi.fn();
  const unsubscribeNotificationMock = vi.fn();
  const removeAccountNotificationsMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useNotifications).mockReturnValue({
      status: 'success',
      globalError: null,
      notifications: [],
      notificationCount: 0,
      hasNotifications: false,
      unreadNotificationCount: 0,
      hasUnreadNotifications: false,
      fetchNotifications: fetchNotificationsMock,
      markNotificationsAsRead: markNotificationsAsReadMock,
      markNotificationsAsDone: markNotificationsAsDoneMock,
      unsubscribeNotification: unsubscribeNotificationMock,
      removeAccountNotifications: removeAccountNotificationsMock,
    } as ReturnType<typeof useNotifications>);
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

    beforeEach(() => {
      useAccountsStore.setState({ accounts: [] });
    });

    const mockDefaultState = {
      auth: { accounts: [] },
      settings: expect.objectContaining(mockSettings),
    };

    it('fetch notifications each interval', async () => {
      renderWithAppContext(<AppProvider>{null}</AppProvider>);

      // Initial fetch happens on mount - advance timers to ensure it runs
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(3);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          Constants.DEFAULT_FETCH_NOTIFICATIONS_INTERVAL_MS,
        );
      });
      expect(fetchNotificationsMock).toHaveBeenCalledTimes(4);
    });

    it('should call fetchNotifications', async () => {
      const getContext = renderWithContext();
      fetchNotificationsMock.mockReset();

      act(() => {
        getContext().fetchNotifications();
      });

      expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsRead', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsRead([mockGitifyNotification]);
      });

      expect(markNotificationsAsReadMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call markNotificationsAsDone', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markNotificationsAsDoneMock).toHaveBeenCalledTimes(1);
      expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
        mockDefaultState,
        [mockGitifyNotification],
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should call unsubscribeNotification', async () => {
      const getContext = renderWithContext();

      act(() => {
        getContext().unsubscribeNotification(mockGitifyNotification);
      });

      expect(unsubscribeNotificationMock).toHaveBeenCalledTimes(1);
      expect(unsubscribeNotificationMock).toHaveBeenCalledWith(
        mockDefaultState,
        mockGitifyNotification,
      );
      expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledTimes(1);
    });
  });
});
