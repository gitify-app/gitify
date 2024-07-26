import { BellSlashIcon, CheckIcon, ReadIcon } from '@primer/octicons-react';
import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AppContext } from '../context/App';
import { Opacity, OpenPreference, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import { formatForDisplay } from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/icons';
import { isCtrlOrMetaKey, openNotification } from '../utils/links';
import { HoverGroup } from './HoverGroup';
import { InteractionButton } from './buttons/InteractionButton';
import { NotificationFooter } from './notification/NotificationFooter';
import { NotificationHeader } from './notification/NotificationHeader';

interface INotificationRow {
  notification: Notification;
  isRead?: boolean;
}

export const NotificationRow: FC<INotificationRow> = ({
  notification,
  isRead = false,
}: INotificationRow) => {
  const {
    settings,
    removeNotificationFromState,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
  } = useContext(AppContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [showAsRead, setShowAsRead] = useState(false);

  const handleNotification = useCallback(
    (event) => {
      setAnimateExit(!settings.delayNotificationState);
      setShowAsRead(settings.delayNotificationState);

      const openLinkUserForeground = !isCtrlOrMetaKey(event);
      const openLinkPreferenceForeground =
        settings.openLinks === OpenPreference.FOREGROUND;

      openNotification(
        notification,
        openLinkUserForeground && openLinkPreferenceForeground,
      );

      if (settings.markAsDoneOnOpen) {
        markNotificationDone(notification);
      } else {
        // no need to mark as read, github does it by default when opening it
        removeNotificationFromState(settings, notification);
      }
    },
    [notification, markNotificationDone, removeNotificationFromState, settings],
  );

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

  const groupByDate = settings.groupBy === 'DATE';

  return (
    <div
      id={notification.id}
      className={cn(
        'group flex border-b border-gray-100 bg-white px-3 py-2 hover:bg-gray-100 dark:border-gray-darker dark:bg-gray-dark dark:text-white dark:hover:bg-gray-darker',
        animateExit &&
          'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
        showAsRead && Opacity.READ,
        isRead && Opacity.READ,
      )}
    >
      <div
        className={cn('mr-3 flex items-center justify-center', iconColor)}
        title={notificationType}
      >
        <NotificationIcon
          size={groupByDate ? Size.XLARGE : Size.MEDIUM}
          aria-label={notification.subject.type}
        />
      </div>

      <div
        className="flex-1 truncate cursor-pointer"
        onClick={(event) => handleNotification(event)}
      >
        <NotificationHeader notification={notification} />

        <div
          className="flex gap-1 items-center mb-1 truncate text-sm"
          role="main"
          title={notificationTitle}
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

      <HoverGroup>
        <InteractionButton
          title="Mark as Done"
          icon={CheckIcon}
          size={Size.MEDIUM}
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationDone(notification);
          }}
        />
        <InteractionButton
          title="Mark as Read"
          icon={ReadIcon}
          size={Size.SMALL}
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationRead(notification);
          }}
        />
        <InteractionButton
          title="Unsubscribe from Thread"
          icon={BellSlashIcon}
          size={Size.SMALL}
          onClick={unsubscribeFromThread}
        />
      </HoverGroup>
    </div>
  );
};
