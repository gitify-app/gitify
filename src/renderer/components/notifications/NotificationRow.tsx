import { type CSSProperties, type FC, useState } from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Stack, Text, Tooltip } from '@primer/react';

import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationActionFailuresStore, useSettingsStore } from '../../stores';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import { type GitifyNotification, Opacity, Size } from '../../types';

import {
  isMarkAsDoneFeatureSupported,
  isUnsubscribeThreadSupported,
} from '../../utils/api/features';
import { isGroupByDate } from '../../utils/notifications/group';
import { shouldRemoveNotificationsFromState } from '../../utils/notifications/remove';
import { openNotification } from '../../utils/system/links';
import { cn } from '../../utils/ui/cn';
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
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
    notificationFailures,
  } = useNotifications();

  const markAsDoneOnOpen = useSettingsStore((s) => s.markAsDoneOnOpen);
  const wrapNotificationTitle = useSettingsStore((s) => s.wrapNotificationTitle);
  const showNumber = useSettingsStore((s) => s.showNumber);

  const [shouldAnimateNotificationExit, setShouldAnimateNotificationExit] = useState(false);

  const shouldAnimateExit = shouldRemoveNotificationsFromState();

  const failure = notificationFailures[notification.id];

  // Explains the failed action and suggests the browser as a fallback,
  // rather than a dedicated retry control - clicking the (now red) hover
  // action again re-attempts it. Phrased as "You can also..." rather than
  // "...instead", since some descriptions already suggest waiting/retrying
  // (e.g. `RATE_LIMITED`), which "instead" would read as contradicting.
  const failureTooltip = failure
    ? `${failure.error.title}: ${failure.error.descriptions.join(' ')} You can also try opening this notification in the browser.`
    : undefined;

  // Starts the exit animation immediately, then reverts it if this specific
  // action failed, checked directly against the failure store once it
  // settles. Checking a stale value (e.g. via an effect watching the failure
  // map) would wrongly revert a retry's animation using the previous
  // attempt's still-present entry.
  const runAction = async (action: () => Promise<void>) => {
    setShouldAnimateNotificationExit(shouldAnimateExit);

    await action();

    if (useNotificationActionFailuresStore.getState().failures[notification.id]) {
      setShouldAnimateNotificationExit(false);
    }
  };

  const actionNotificationInteraction = () => {
    openNotification(notification);

    runAction(() =>
      markAsDoneOnOpen
        ? markNotificationsAsDone([notification])
        : markNotificationsAsRead([notification]),
    );
  };

  const actionMarkAsDone = () => runAction(() => markNotificationsAsDone([notification]));

  const actionMarkAsRead = () => runAction(() => markNotificationsAsRead([notification]));

  const actionUnsubscribeFromThread = () => runAction(() => unsubscribeNotification(notification));

  const NotificationIcon = notification.display.icon.type;
  const isNotificationRead = !notification.unread;

  // How many action buttons the HoverGroup below actually renders. Exposed as a
  // CSS var so the Glass hover-fade (App.css) sizes to the buttons instead of a
  // fixed width, which would over-fade rows that show fewer than three.
  const enabledActionCount =
    Number(!isNotificationRead) +
    Number(isMarkAsDoneFeatureSupported(notification.account) && notification.unread) +
    Number(isUnsubscribeThreadSupported(notification.account));

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
      style={{ '--gitify-actions': enabledActionCount } as CSSProperties}
    >
      <Stack align="center" className="gitify-row-content" direction="horizontal" gap="condensed">
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
          className={cn('cursor-pointer text-sm w-full', !wrapNotificationTitle && 'truncate')}
          direction="vertical"
          gap="none"
          onClick={actionNotificationInteraction}
        >
          <NotificationHeader notification={notification} />

          <Stack
            align="start"
            className={cn('mb-0.5', !wrapNotificationTitle && 'truncate')}
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
                (isGroupByDate() || !showNumber) && 'hidden',
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
            label={failureTooltip ?? 'Mark as read'}
            testid="notification-mark-as-read"
            variant={failure ? 'danger' : 'invisible'}
          />

          <HoverButton
            action={actionMarkAsDone}
            enabled={isMarkAsDoneFeatureSupported(notification.account) && notification.unread}
            icon={CheckIcon}
            label={failureTooltip ?? 'Mark as done'}
            testid="notification-mark-as-done"
            variant={failure ? 'danger' : 'invisible'}
          />

          <HoverButton
            action={actionUnsubscribeFromThread}
            enabled={isUnsubscribeThreadSupported(notification.account)}
            icon={BellSlashIcon}
            label={failureTooltip ?? 'Unsubscribe from thread'}
            testid="notification-unsubscribe-from-thread"
            variant={failure ? 'danger' : 'invisible'}
          />
        </HoverGroup>
      )}
    </div>
  );
};
