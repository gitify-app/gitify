import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';

import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import { IconButton, Tooltip } from '@primer/react';

import { AppContext } from '../../context/App';
import { Opacity, Size } from '../../types';
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

  return (
    <div
      id={notification.id}
      className={cn(
        'group flex border-b pl-3 pr-1 py-1.5 text-gitify-font border-gitify-notifications-border bg-gitify-notifications-rest hover:bg-gitify-notifications-hover',
        (isAnimated || animateExit) &&
          'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
        (isRead || showAsRead) && Opacity.READ,
      )}
    >
      <div className="mr-3 flex items-center justify-center">
        <Tooltip text={notificationType} direction="e">
          <NotificationIcon size={Size.LARGE} className={iconColor} />
        </Tooltip>
      </div>

      <div
        className="flex-1 truncate cursor-pointer"
        onClick={() => handleNotification()}
      >
        <NotificationHeader notification={notification} />

        <div
          className="flex gap-1 items-center mb-1 truncate text-sm"
          title={notificationTitle}
          data-testid="notification-row"
        >
          <span className="truncate">{notification.subject.title}</span>
          <span
            className={cn(
              'text-xxs',
              Opacity.READ,
              !settings.showNumber && 'hidden',
            )}
          >
            {notificationNumber}
          </span>
        </div>

        <NotificationFooter notification={notification} />
      </div>

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
    </div>
  );
};
