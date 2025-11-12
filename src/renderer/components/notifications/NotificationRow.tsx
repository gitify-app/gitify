import { type FC, useCallback, useContext, useState } from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Stack, Text, Tooltip } from '@primer/react';

import { AppContext } from '../../context/App';
import { GroupBy, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { openNotification } from '../../utils/links';
import { createNotificationHandler } from '../../utils/notifications/handlers';
import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';

interface INotificationRow {
  notification: Notification;
  isAnimated?: boolean;
}

export const NotificationRow: FC<INotificationRow> = ({
  notification,
  isAnimated = false,
}: INotificationRow) => {
  const {
    settings,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useContext(AppContext);
  const [animateExit, setAnimateExit] = useState(false);

  const handleNotification = useCallback(() => {
    setAnimateExit(!settings.delayNotificationState);
    openNotification(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationsAsDone([notification]);
    } else {
      markNotificationsAsRead([notification]);
    }
  }, [
    notification,
    markNotificationsAsRead,
    markNotificationsAsDone,
    settings,
  ]);

  const actionMarkAsDone = () => {
    setAnimateExit(!settings.delayNotificationState);
    markNotificationsAsDone([notification]);
  };

  const actionMarkAsRead = () => {
    setAnimateExit(!settings.delayNotificationState);
    markNotificationsAsRead([notification]);
  };

  const actionUnsubscribeFromThread = () => {
    unsubscribeNotification(notification);
  };

  const handler = createNotificationHandler(notification);
  const NotificationIcon = handler.iconType(notification.subject);
  const iconColor = handler.iconColor(notification.subject);
  const notificationType = handler.formattedNotificationType(notification);
  const notificationNumber = handler.formattedNotificationNumber(notification);
  const notificationTitle = handler.formattedNotificationTitle(notification);

  const groupByDate = settings.groupBy === GroupBy.DATE;

  const isNotificationRead = !notification.unread;

  return (
    <div
      className={cn(
        'group border-b',
        'pl-2.75 pr-1 py-0.75',
        'text-gitify-font border-gitify-notification-border hover:bg-gitify-notification-hover',
        (isAnimated || animateExit) &&
          'translate-x-full opacity-0 transition duration-350 ease-in-out',
        isNotificationRead && Opacity.READ,
      )}
      id={notification.id}
    >
      <Stack
        align="center"
        className="relative"
        direction="horizontal"
        gap="condensed"
      >
        <Tooltip direction="e" text={notificationType}>
          <button type="button">
            <NotificationIcon
              aria-label={notificationType}
              className={iconColor}
              size={Size.LARGE}
            />
          </button>
        </Tooltip>

        <Stack
          className={cn(
            'cursor-pointer text-sm w-full',
            !settings.wrapNotificationTitle && 'truncate',
          )}
          direction="vertical"
          gap="none"
          onClick={() => handleNotification()}
        >
          <NotificationHeader notification={notification} />

          <Stack
            align="start"
            className={cn(
              'mb-0.5',
              !settings.wrapNotificationTitle && 'truncate',
            )}
            data-testid="notification-row"
            direction="horizontal"
            gap="condensed"
            justify="space-between"
            title={notificationTitle}
          >
            <Text className={!settings.wrapNotificationTitle && 'truncate'}>
              {notification.subject.title}
            </Text>
            <Text
              className={cn(
                'text-xxs ml-auto mr-2',
                Opacity.READ,
                (groupByDate || !settings.showNumber) && 'hidden',
              )}
            >
              {notificationNumber}
            </Text>
          </Stack>

          <NotificationFooter notification={notification} />
        </Stack>

        {!animateExit && (
          <HoverGroup bgColor="group-hover:bg-gitify-notification-hover">
            <HoverButton
              action={actionMarkAsDone}
              enabled={isMarkAsDoneFeatureSupported(notification.account)}
              icon={CheckIcon}
              label="Mark as done"
              testid="notification-mark-as-done"
            />

            <HoverButton
              action={actionMarkAsRead}
              icon={ReadIcon}
              label="Mark as read"
              testid="notification-mark-as-read"
            />

            <HoverButton
              action={actionUnsubscribeFromThread}
              icon={BellSlashIcon}
              label="Unsubscribe from thread"
              testid="notification-unsubscribe-from-thread"
            />
          </HoverGroup>
        )}
      </Stack>
    </div>
  );
};
