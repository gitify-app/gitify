import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { GroupBy } from '../../types';

import * as comms from '../../utils/comms';
import * as links from '../../utils/links';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

describe('renderer/components/notifications/NotificationRow.tsx', () => {
  jest.spyOn(links, 'openNotification').mockImplementation();
  jest.spyOn(comms, 'openExternalLink').mockImplementation();
  jest
    .spyOn(globalThis.Date, 'now')
    .mockImplementation(() => new Date('2024').valueOf());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children - group by date', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - hide numbers', async () => {
    const props: NotificationRowProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />, {
      settings: { ...mockSettings, showNumber: false },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - notification is read', async () => {
    const props: NotificationRowProps = {
      notification: { ...mockGitifyNotification, unread: false },
    };

    const tree = renderWithAppContext(<NotificationRow {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('notification interactions', () => {
    it('should open a notification in the browser - click', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        { settings: { ...mockSettings, markAsDoneOnOpen: false } },
      );

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'read',
      );
    });

    it('should open a notification in the browser - delay notification setting enabled', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        {
          settings: {
            ...mockSettings,
            markAsDoneOnOpen: false,
            delayNotificationState: true,
          },
        },
      );

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'read',
      );
    });

    it('should open a notification in browser & mark it as done', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        { settings: { ...mockSettings, markAsDoneOnOpen: true } },
      );

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'done',
      );
    });

    it('should mark as done when markAsDoneOnOpen is true even with fetchReadNotifications enabled', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        {
          settings: {
            ...mockSettings,
            markAsDoneOnOpen: true,
            fetchReadNotifications: true,
          },
        },
      );

      await userEvent.click(screen.getByTestId('notification-row'));

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'done',
      );
    });

    it('should mark notifications as read', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        { settings: { ...mockSettings, markAsDoneOnOpen: false } },
      );

      await userEvent.click(screen.getByTestId('notification-mark-as-read'));

      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'read',
      );
    });

    it('should hide mark as read button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
      };

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-read'),
      ).not.toBeInTheDocument();
    });

    it('should mark notifications as done', async () => {
      const onNotificationActionMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionMock}
        />,
        { settings: mockSettings },
      );

      await userEvent.click(screen.getByTestId('notification-mark-as-done'));

      expect(onNotificationActionMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'done',
      );
    });

    it('should hide mark as done button when notification is already read', async () => {
      const props: NotificationRowProps = {
        notification: {
          ...mockGitifyNotification,
          unread: false,
        },
      };

      renderWithAppContext(<NotificationRow {...props} />);

      expect(
        screen.queryByTestId('notification-mark-as-done'),
      ).not.toBeInTheDocument();
    });

    it('should show mark as done button when fetchReadNotifications is enabled and notification is unread', async () => {
      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(<NotificationRow {...props} />, {
        settings: { ...mockSettings, fetchReadNotifications: true },
      });

      expect(
        screen.getByTestId('notification-mark-as-done'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('notification-mark-as-read'),
      ).toBeInTheDocument();
    });

    it('should unsubscribe from a notification thread', async () => {
      const onNotificationActionIdsMock = jest.fn();

      const props: NotificationRowProps = {
        notification: mockGitifyNotification,
      };

      renderWithAppContext(
        <NotificationRow
          {...props}
          onNotificationActionIds={onNotificationActionIdsMock}
        />,
      );

      await userEvent.click(
        screen.getByTestId('notification-unsubscribe-from-thread'),
      );

      expect(onNotificationActionIdsMock).toHaveBeenCalledTimes(1);
      expect(onNotificationActionIdsMock).toHaveBeenCalledWith(
        mockGitifyNotification,
        'unsubscribe',
      );
    });
  });
});
