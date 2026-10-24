import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ForwardedRef, ReactElement } from 'react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockGithubEnterpriseGitifyNotifications,
  mockGitifyNotification,
  mockMultipleAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import { useFiltersStore, useNotificationFocusStore, useSettingsStore } from '../../stores';

import { GroupBy } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import { FOCUS_HIGHLIGHT_MS, FOCUS_VIEW_OFFSET } from '../../utils/notifications/listPositioning';
import { NotificationList } from './NotificationList';

const legendListMock = vi.hoisted(() => ({
  scrollToIndex: vi.fn(() => Promise.resolve()),
  scrollToOffset: vi.fn(() => Promise.resolve()),
  autoReady: true,
  readyCallback: null as (() => void) | null,
  props: [] as Array<{ dataKey?: unknown }>,
}));

// LegendList virtualizes based on real scroll metrics, which happy-dom cannot
// provide. Renders every flattened item through the real renderItem callback so
// the component's useMemo flattening still runs and can be asserted on. The
// ref spies let tests assert programmatic positioning without a real scroller.
vi.mock('@legendapp/list/react', async () => {
  const React = await import('react');

  interface MockLegendListProps {
    data: unknown[];
    dataKey?: unknown;
    renderItem: (info: { item: unknown }) => ReactElement;
    onReady?: () => void;
  }

  const LegendList = React.forwardRef<unknown, MockLegendListProps>(
    ({ data, dataKey, renderItem, onReady }, ref: ForwardedRef<unknown>) => {
      legendListMock.props.push({ dataKey });

      React.useImperativeHandle(ref, () => ({
        scrollToIndex: legendListMock.scrollToIndex,
        scrollToOffset: legendListMock.scrollToOffset,
      }));

      React.useEffect(() => {
        legendListMock.readyCallback = onReady ?? null;

        if (legendListMock.autoReady) {
          onReady?.();
        }
      }, [onReady]);

      return (
        <div>
          {data.map((item, index) => (
            <div key={index}>{renderItem({ item })}</div>
          ))}
        </div>
      );
    },
  );

  return { LegendList };
});

describe('renderer/components/notifications/NotificationList.tsx', () => {
  beforeEach(() => {
    legendListMock.autoReady = true;
    legendListMock.readyCallback = null;
    legendListMock.props = [];
    useNotificationFocusStore.getState().reset();
    useFiltersStore.getState().reset();
    useSettingsStore.getState().reset();
  });

  describe('NotificationList', () => {
    it('renders account headers, repository headers and notification rows flattened in order', () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      expect(screen.getAllByTestId('account-profile')).toHaveLength(2);
      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(2);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(4);
    });

    it('collapses an account when its header is toggled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getAllByTestId('account-toggle')[0]);

      expect(screen.getAllByTestId('account-profile')).toHaveLength(2);
      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(1);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });

    it('collapses a repository when its header is toggled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getAllByTestId('repository-toggle')[0]);

      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(2);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });

    it('renders an error row for a failed account and an all-read row for an empty account', () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={[
            {
              account: mockGitHubCloudAccount,
              notifications: [],
              error: { title: 'Account failed', descriptions: ['Try again'], emojis: ['🔥'] },
            },
            {
              account: mockGitHubEnterpriseServerAccount,
              notifications: mockGithubEnterpriseGitifyNotifications,
              error: null,
            },
            {
              account: mockGitHubCloudAccount,
              notifications: [],
              error: null,
            },
          ]}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.DATE },
        },
      );

      expect(screen.getByText('Account failed')).toBeInTheDocument();
      expect(screen.getByText(/No new notifications/)).toBeInTheDocument();
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });
  });

  describe('positioning and focus', () => {
    const accountUUID = getAccountUUID(mockGitHubCloudAccount);

    it('focuses a visible notification after the list is ready', async () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );

      await waitFor(() =>
        expect(legendListMock.scrollToIndex).toHaveBeenCalledWith(
          expect.objectContaining({
            index: 1,
            viewOffset: FOCUS_VIEW_OFFSET,
            viewPosition: 0,
            viewPositionFallback: 'start',
          }),
        ),
      );
      expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
      expect(useNotificationFocusStore.getState().intent).toBeNull();
    });

    it('waits for readiness before focusing', async () => {
      legendListMock.autoReady = false;

      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );

      expect(legendListMock.scrollToIndex).not.toHaveBeenCalled();

      act(() => legendListMock.readyCallback?.());

      await waitFor(() => expect(legendListMock.scrollToIndex).toHaveBeenCalledTimes(1));
    });

    it('expands a collapsed repository before focusing', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getByTestId('repository-toggle'));
      expect(screen.queryAllByTestId('notification-row')).toHaveLength(0);

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );

      await waitFor(() => expect(screen.getAllByTestId('notification-row')).toHaveLength(1));
      await waitFor(() => expect(legendListMock.scrollToIndex).toHaveBeenCalledTimes(1));
    });

    it('expands a collapsed account before focusing', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getByTestId('account-toggle'));
      expect(screen.queryAllByTestId('notification-row')).toHaveLength(0);

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );

      await waitFor(() => expect(screen.getAllByTestId('notification-row')).toHaveLength(1));
      await waitFor(() => expect(legendListMock.scrollToIndex).toHaveBeenCalledTimes(1));
    });

    it('clears a filtered-out target without scrolling', async () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      act(() => useNotificationFocusStore.getState().requestFocus(accountUUID, 'missing'));

      await waitFor(() => expect(useNotificationFocusStore.getState().intent).toBeNull());
      expect(legendListMock.scrollToIndex).not.toHaveBeenCalled();
    });

    it('focuses the notification belonging to the requested account when IDs repeat', async () => {
      const first = {
        ...mockGitHubCloudGitifyNotifications[0],
        id: '42',
        subject: { ...mockGitHubCloudGitifyNotifications[0].subject, title: 'First account' },
      };
      const second = {
        ...mockGitHubCloudGitifyNotifications[0],
        id: '42',
        account: mockGitHubEnterpriseServerAccount,
        subject: { ...mockGitHubCloudGitifyNotifications[0].subject, title: 'Second account' },
      };

      renderWithProviders(
        <NotificationList
          accountNotifications={[
            { account: mockGitHubCloudAccount, notifications: [first], error: null },
            { account: mockGitHubEnterpriseServerAccount, notifications: [second], error: null },
          ]}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.DATE },
        },
      );

      act(() =>
        useNotificationFocusStore
          .getState()
          .requestFocus(getAccountUUID(mockGitHubEnterpriseServerAccount), '42'),
      );

      await waitFor(() => expect(legendListMock.scrollToIndex).toHaveBeenCalledTimes(1));

      const focused = document.querySelector('[aria-current="true"]');
      expect(focused?.textContent).toContain('Second account');
    });

    it('clears the highlight when the user interacts with the list', async () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );
      await waitFor(() =>
        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1),
      );

      fireEvent.pointerDown(screen.getByTestId('notification-row'));

      expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(0);

      act(() =>
        useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
      );
      await waitFor(() =>
        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1),
      );

      fireEvent.keyDown(screen.getByTestId('notification-row'), { key: 'ArrowDown' });

      expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(0);
    });

    it('focuses the newest request and clears the previous highlight', async () => {
      const first = {
        ...mockGitHubCloudGitifyNotifications[0],
        id: 'first',
        order: 0,
        subject: { ...mockGitHubCloudGitifyNotifications[0].subject, title: 'First title' },
      };
      const second = {
        ...first,
        id: 'second',
        order: 1,
        subject: { ...first.subject, title: 'Second title' },
      };

      renderWithProviders(
        <NotificationList
          accountNotifications={[
            { account: mockGitHubCloudAccount, notifications: [first, second], error: null },
          ]}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.DATE },
        },
      );

      act(() => useNotificationFocusStore.getState().requestFocus(accountUUID, 'first'));
      await waitFor(() =>
        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1),
      );
      expect(document.querySelector('[aria-current="true"]')?.textContent).toContain('First title');

      act(() => useNotificationFocusStore.getState().requestFocus(accountUUID, 'second'));
      await waitFor(() =>
        expect(document.querySelector('[aria-current="true"]')?.textContent).toContain(
          'Second title',
        ),
      );
      expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
    });

    it('clears the highlight after its display duration', () => {
      vi.useFakeTimers();

      try {
        renderWithProviders(
          <NotificationList
            accountNotifications={mockSingleAccountNotifications}
            showAccountHeader={false}
          />,
          {
            accounts: [mockGitHubCloudAccount],
            settings: { groupBy: GroupBy.REPOSITORY },
          },
        );

        act(() =>
          useNotificationFocusStore.getState().requestFocus(accountUUID, mockGitifyNotification.id),
        );
        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1);

        act(() => {
          vi.advanceTimersByTime(FOCUS_HIGHLIGHT_MS);
        });

        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps the data key stable across content updates and changes it for the dataset', async () => {
      const tree = renderWithProviders(
        <NotificationList
          accountNotifications={mockSingleAccountNotifications}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      const initialKey = legendListMock.props.at(-1)?.dataKey;
      const updatedNotifications = [
        {
          ...mockSingleAccountNotifications[0],
          notifications: [
            {
              ...mockGitifyNotification,
              subject: { ...mockGitifyNotification.subject, title: 'Updated title' },
            },
          ],
        },
      ];

      tree.rerender(
        <NotificationList accountNotifications={updatedNotifications} showAccountHeader={false} />,
      );

      expect(legendListMock.props.at(-1)?.dataKey).toBe(initialKey);

      act(() => useSettingsStore.getState().updateSetting('groupBy', GroupBy.DATE));

      await waitFor(() => expect(legendListMock.props.at(-1)?.dataKey).not.toBe(initialKey));

      const groupedKey = legendListMock.props.at(-1)?.dataKey;

      act(() => useFiltersStore.getState().updateFilter('reasons', 'mention', true));

      await waitFor(() => expect(legendListMock.props.at(-1)?.dataKey).not.toBe(groupedKey));
    });
  });
});
