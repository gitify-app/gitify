import { type FC, useState } from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Stack, Text, Tooltip } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import { type GitifyNotification, Opacity, Size } from '../../types';

import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { openNotification } from '../../utils/links';
import { isGroupByDate } from '../../utils/notifications/group';
import { shouldRemoveNotificationsFromState } from '../../utils/notifications/remove';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';
import { NotificationTitle } from './NotificationTitle';

export interface NotificationRowProps {
  notification: GitifyNotification;
  isRepositoryAnimatingExit: boolean;
}

export const NotificationRow: FC<NotificationRowProps> = ({
  notification,
  isRepositoryAnimatingExit,
}: NotificationRowProps) => {
  const {
    settings,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useAppContext();

  const [shouldAnimateNotificationExit, setShouldAnimateNotificationExit] =
    useState(false);

  const shouldAnimateExit = shouldRemoveNotificationsFromState(settings);

  const actionNotificationInteraction = () => {
    setShouldAnimateNotificationExit(shouldAnimateExit);
    openNotification(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationsAsDone([notification]);
    } else {
      markNotificationsAsRead([notification]);
    }
  };

  const actionMarkAsDone = () => {
    setShouldAnimateNotificationExit(shouldAnimateExit);
    markNotificationsAsDone([notification]);
  };

  const actionMarkAsRead = () => {
    setShouldAnimateNotificationExit(shouldAnimateExit);
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
        (isRepositoryAnimatingExit || shouldAnimateNotificationExit) &&
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
          onClick={actionNotificationInteraction}
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
            <NotificationTitle title={notification.subject.title} />
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

      {!shouldAnimateNotificationExit && (
        <HoverGroup bgColor="group-hover:bg-gitify-notification-hover">
          <HoverButton
            action={actionMarkAsRead}
            enabled={!isNotificationRead}
            icon={ReadIcon}
            label="Mark as read"
            testid="notification-mark-as-read"
          />

          <HoverButton
            action={actionMarkAsDone}
            enabled={
              isMarkAsDoneFeatureSupported(notification.account) &&
              notification.unread
            }
            icon={CheckIcon}
            label="Mark as done"
            testid="notification-mark-as-done"
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
