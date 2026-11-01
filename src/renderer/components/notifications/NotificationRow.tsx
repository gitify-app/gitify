import { useTranslation } from 'react-i18next';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Stack, Text, Tooltip } from '@primer/react';

import { cn } from 'cn';

import { useNotificationActions } from '../../hooks/notifications/useNotificationActions';
import {
  getNotificationFailureKey,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../../stores';

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
import { ExitCollapse } from './ExitCollapse';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';
import { NotificationTitle } from './NotificationTitle';

export interface NotificationRowProps {
  notification: GitifyNotification;
  isAnimatingExit: boolean;
  onAnimateExit: (animate: boolean) => void;
}

export function NotificationRow({
  notification,
  isAnimatingExit,
  onAnimateExit,
}: Readonly<NotificationRowProps>) {
  const { t } = useTranslation();
  const { markNotificationsAsRead, markNotificationsAsDone, unsubscribeNotification } =
    useNotificationActions();

  const markAsDoneOnOpen = useSettingsStore((s) => s.markAsDoneOnOpen);
  const wrapNotificationTitle = useSettingsStore((s) => s.wrapNotificationTitle);
  const showNumber = useSettingsStore((s) => s.showNumber);

  const shouldAnimateExit = shouldRemoveNotificationsFromState();

  const notificationFailureKey = getNotificationFailureKey(notification.account, notification.id);
  const failure = useNotificationActionFailuresStore(
    (state) => state.failures[notificationFailureKey],
  );

  // Explains the failed action and suggests the browser as a fallback,
  // rather than a dedicated retry control - clicking the (now red) hover
  // action again re-attempts it. Phrased as "You can also..." rather than
  // "...instead", since some descriptions already suggest waiting/retrying
  // (e.g. `RATE_LIMITED`), which "instead" would read as contradicting.
  const failureTooltip = failure
    ? t(
        'notifications.failure_tooltip',
        '{{title}}: {{description}} You can also try opening this notification in your browser.',
        {
          title: failure.error.title,
          description: failure.error.descriptions.join(' '),
        },
      )
    : undefined;

  const runAction = async (action: () => Promise<boolean>) => {
    onAnimateExit(shouldAnimateExit);
    try {
      await action();
    } finally {
      onAnimateExit(false);
    }
  };

  const actionNotificationInteraction = () => {
    void openNotification(notification);

    void runAction(() =>
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

  return (
    <ExitCollapse isExiting={isAnimatingExit}>
      <div
        className={cn(
          'group relative border-b',
          'pl-2.75 pr-1 py-0.75',
          'text-gitify-font border-gitify-notification-border hover:bg-gitify-notification-hover',
          'min-h-0 min-w-0',
          isNotificationRead && Opacity.READ,
        )}
        data-animating-exit={isAnimatingExit || undefined}
        id={notification.id}
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
            className={cn(
              'cursor-pointer text-sm w-full min-w-0',
              !wrapNotificationTitle && 'truncate',
            )}
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
              {/* Hidden (keeping its space) while the row is hovered, so the
                full-height action rail can never leave the number partially
                rendered. */}
              <Text
                className={cn(
                  'text-xxs ml-auto mr-2 group-hover:invisible',
                  Opacity.READ,
                  (isGroupByDate() || !showNumber) && 'hidden',
                )}
                data-hidden={isGroupByDate() || !showNumber || undefined}
                data-testid="notification-reference"
              >
                {notification.display.identifier}
              </Text>
            </Stack>

            <NotificationFooter notification={notification} />
          </Stack>
        </Stack>

        {!isAnimatingExit && (
          <HoverGroup bgColor="group-hover:bg-gitify-notification-hover" fullHeight>
            <HoverButton
              action={actionMarkAsRead}
              enabled={!isNotificationRead}
              icon={ReadIcon}
              label={
                failure?.action === 'markAsRead'
                  ? (failureTooltip ?? t('notifications.mark_as_read', 'Mark as read'))
                  : t('notifications.mark_as_read', 'Mark as read')
              }
              testid="notification-mark-as-read"
              variant={failure?.action === 'markAsRead' ? 'danger' : 'invisible'}
            />

            <HoverButton
              action={actionMarkAsDone}
              enabled={isMarkAsDoneFeatureSupported(notification.account) && notification.unread}
              icon={CheckIcon}
              label={
                failure?.action === 'markAsDone'
                  ? (failureTooltip ?? t('notifications.mark_as_done', 'Mark as done'))
                  : t('notifications.mark_as_done', 'Mark as done')
              }
              testid="notification-mark-as-done"
              variant={failure?.action === 'markAsDone' ? 'danger' : 'invisible'}
            />

            <HoverButton
              action={actionUnsubscribeFromThread}
              enabled={isUnsubscribeThreadSupported(notification.account)}
              icon={BellSlashIcon}
              label={
                failure?.action === 'unsubscribe'
                  ? (failureTooltip ?? t('notifications.unsubscribe', 'Unsubscribe from thread'))
                  : t('notifications.unsubscribe', 'Unsubscribe from thread')
              }
              testid="notification-unsubscribe-from-thread"
              variant={failure?.action === 'unsubscribe' ? 'danger' : 'invisible'}
            />
          </HoverGroup>
        )}
      </div>
    </ExitCollapse>
  );
}
