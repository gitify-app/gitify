import { type FC, useCallback, useContext, useState } from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Box, Stack, Text, Tooltip } from '@primer/react';

import { AppContext } from '../../context/App';
import { GroupBy, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { formatForDisplay } from '../../utils/helpers';
import { getNotificationTypeIconColor } from '../../utils/icons';
import { openNotification } from '../../utils/links';
import { createNotificationHandler } from '../../utils/notifications/handlers';
import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';

interface INotificationRow {
  notification: Notification;
  isAnimated?: boolean;
  isRead?: boolean;
}

export const NotificationRow: FC<INotificationRow> = ({
  notification,
  isAnimated = false,
  isRead = false,
}: INotificationRow) => {
  const {
    settings,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useContext(AppContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [showAsRead, setShowAsRead] = useState(false);

  const handleNotification = useCallback(() => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);

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
    setShowAsRead(settings.delayNotificationState);
    markNotificationsAsDone([notification]);
  };

  const actionMarkAsRead = () => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);
    markNotificationsAsRead([notification]);
  };

  const actionUnsubscribeFromThread = () => {
    unsubscribeNotification(notification);
  };

  const handler = createNotificationHandler(notification);

  const NotificationIcon = handler.getIcon(notification.subject);
  const iconColor = getNotificationTypeIconColor(notification.subject);

  const notificationType = formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);

  const notificationNumber = notification.subject?.number
    ? `#${notification.subject.number}`
    : '';

  const notificationTitle = notificationNumber
    ? `${notification.subject.title} [${notificationNumber}]`
    : notification.subject.title;

  const groupByDate = settings.groupBy === GroupBy.DATE;

  return (
    <Box
      id={notification.id}
      className={cn(
        'group border-b',
        'pl-3 pr-1 py-1.5',
        'text-gitify-font border-gitify-notification-border hover:bg-gitify-notification-hover',
        (isAnimated || animateExit) &&
          'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
        (isRead || showAsRead) && Opacity.READ,
      )}
    >
      <Stack
        direction="horizontal"
        align="center"
        gap="condensed"
        className="relative"
      >
        <Tooltip text={notificationType} direction="e">
          <NotificationIcon size={Size.LARGE} className={iconColor} />
        </Tooltip>

        <Stack
          direction="vertical"
          gap="none"
          className={cn(
            'cursor-pointer text-sm w-full',
            !settings.wrapNotificationTitle && 'truncate',
          )}
          onClick={() => handleNotification()}
        >
          <NotificationHeader notification={notification} />

          <Stack
            direction="horizontal"
            align="start"
            justify="space-between"
            gap="condensed"
            title={notificationTitle}
            className={cn(
              'mb-0.5',
              !settings.wrapNotificationTitle && 'truncate',
            )}
            data-testid="notification-row"
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
              label="Mark as done"
              icon={CheckIcon}
              enabled={isMarkAsDoneFeatureSupported(notification.account)}
              testid="notification-mark-as-done"
              action={actionMarkAsDone}
            />

            <HoverButton
              label="Mark as read"
              icon={ReadIcon}
              testid="notification-mark-as-read"
              action={actionMarkAsRead}
            />

            <HoverButton
              label="Unsubscribe from thread"
              icon={BellSlashIcon}
              testid="notification-unsubscribe-from-thread"
              action={actionUnsubscribeFromThread}
            />
          </HoverGroup>
        )}
      </Stack>
    </Box>
  );
};
