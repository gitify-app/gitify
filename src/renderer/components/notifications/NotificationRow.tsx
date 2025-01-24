import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Box, IconButton, Stack, Text, Tooltip } from '@primer/react';

import { AppContext } from '../../context/App';
import { GroupBy, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { formatForDisplay } from '../../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../../utils/icons';
import { openNotification } from '../../utils/links';
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

  const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification);
  };

  const NotificationIcon = getNotificationTypeIcon(notification.subject);
  const iconColor = getNotificationTypeIconColor(notification.subject);

  const notificationType = formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);

  const notificationNumber = notification.subject?.number
    ? `#${notification.subject.number}`
    : '';

  const notificationTitle =
    `${notification.subject.title} ${notificationNumber}`.trim();

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
          className="cursor-pointer truncate w-full mr-1"
          onClick={() => handleNotification()}
        >
          <NotificationHeader notification={notification} />

          <Stack
            direction="horizontal"
            align="start"
            justify="space-between"
            gap="condensed"
            title={notificationTitle}
            className="text-sm mb-1 truncate"
            data-testid="notification-row"
          >
            <Text className="block truncate flex-shrink overflow-ellipsis">
              {notification.subject.title}
            </Text>
            <Text
              className={cn(
                'text-xxs ml-auto',
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
          <HoverGroup>
            {isMarkAsDoneFeatureSupported(notification.account) && (
              <IconButton
                aria-label="Mark as done"
                icon={CheckIcon}
                size="small"
                variant="invisible"
                onClick={() => {
                  setAnimateExit(!settings.delayNotificationState);
                  setShowAsRead(settings.delayNotificationState);
                  markNotificationsAsDone([notification]);
                }}
                data-testid="notification-mark-as-done"
              />
            )}

            <IconButton
              aria-label="Mark as read"
              icon={ReadIcon}
              size="small"
              variant="invisible"
              onClick={() => {
                setAnimateExit(!settings.delayNotificationState);
                setShowAsRead(settings.delayNotificationState);
                markNotificationsAsRead([notification]);
              }}
              data-testid="notification-mark-as-read"
            />

            <IconButton
              aria-label="Unsubscribe from thread"
              icon={BellSlashIcon}
              size="small"
              variant="invisible"
              onClick={unsubscribeFromThread}
              data-testid="notification-unsubscribe-from-thread"
            />
          </HoverGroup>
        )}
      </Stack>
    </Box>
  );
};
