import { type FC, useCallback, useState } from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Stack, Text, Tooltip } from '@primer/react';

import { useAppContext } from '../../context/App';
import { type GitifyNotification, Opacity, Size } from '../../types';
import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { openNotification } from '../../utils/links';
import { isGroupByDate } from '../../utils/notifications/group';
import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';

interface NotificationRowProps {
  notification: GitifyNotification;
  isAnimated?: boolean;
}

export const NotificationRow: FC<NotificationRowProps> = ({
  notification,
  isAnimated = false,
}: NotificationRowProps) => {
  const {
    settings,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useAppContext();
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

  const NotificationIcon = notification.display.icon.type;
  const isNotificationRead = !notification.unread;

  return (
    <div
      className={cn(
        'group relative border-b',
        'pl-2.75 pr-1 py-0.75',
        'text-gitify-font border-gitify-notification-border hover:bg-gitify-notification-hover',
        (isAnimated || animateExit) &&
          'translate-x-full opacity-0 transition duration-350 ease-in-out',
        isNotificationRead && Opacity.READ,
      )}
      id={notification.id}
    >
      <Stack align="center" direction="horizontal" gap="condensed">
        <Tooltip direction="e" text={notification.display.type}>
          <button type="button">
            <NotificationIcon
              aria-label={notification.display.type}
              className={notification.display.icon.color}
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
            title={notification.display.title}
          >
            <Text className={!settings.wrapNotificationTitle && 'truncate'}>
              {notification.subject.title}
            </Text>
            <Text
              className={cn(
                'text-xxs ml-auto mr-2',
                Opacity.READ,
                (isGroupByDate(settings) || !settings.showNumber) && 'hidden',
              )}
            >
              {notification.display.number}
            </Text>
          </Stack>

          <NotificationFooter notification={notification} />
        </Stack>
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
    </div>
  );
};
