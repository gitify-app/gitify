import {
  BellSlashIcon,
  CheckIcon,
  FeedPersonIcon,
  ReadIcon,
} from '@primer/octicons-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useContext,
} from 'react';

import { AppContext } from '../context/App';
import type { GitifyNotification } from '../types';
import type { Notification } from '../typesGithub';
import { openExternalLink } from '../utils/comms';
import { formatForDisplay, openInBrowser } from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/icons';
import { formatReason } from '../utils/reason';

interface IProps {
  hostname: string;
  notification: GitifyNotification;
}

export const NotificationRow: FC<IProps> = ({ notification, hostname }) => {
  const {
    settings,
    accounts,
    removeNotificationFromState,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    notifications,
  } = useContext(AppContext);

  const openNotification = useCallback(() => {
    openInBrowser(notification, accounts);

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification.id, hostname);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(notification.id, hostname);
    }
  }, [notifications, notification, accounts, settings]); // notifications required here to prevent weird state issues

  const unsubscribe = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification.id, hostname);
  };

  const openUserProfile = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    openExternalLink(notification.user.html_url);
  };

  const reason = notification.reason; //formatReason(notification.reason);
  const NotificationIcon = notification.icon.type; //getNotificationTypeIcon(notification.subject);
  const iconColor = notification.icon.color; // getNotificationTypeIconColor(notification.subject);
  // const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
  //   addSuffix: true,
  // });

  const updatedLabel = notification.user
    ? `${notification.user.login} updated ${notification.updated_at.formatted}`
    : `Updated ${notification.updated_at.formatted}`;
  const notificationTitle = formatForDisplay([
    notification.state,
    notification.type,
  ]);

  return (
    <div className="flex space-x-3 py-2 px-3 bg-white dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker border-b border-gray-100 dark:border-gray-darker group">
      <div
        className={`flex justify-center items-center w-5 ${iconColor}`}
        title={notificationTitle}
      >
        <NotificationIcon size={18} aria-label={notification.type} />
      </div>

      <div
        className="flex-1 overflow-hidden"
        onClick={() => openNotification()}
        onKeyDown={() => openNotification()}
      >
        <div
          className="mb-1 text-sm whitespace-nowrap overflow-ellipsis overflow-hidden cursor-pointer"
          role="main"
          title={notification.title}
        >
          {notification.title}
        </div>

        <div className="text-xs text-capitalize whitespace-nowrap overflow-ellipsis overflow-hidden">
          <span className="flex items-center">
            <span title={updatedLabel} className="flex">
              {notification.user ? (
                <span
                  title="View User Profile"
                  onClick={openUserProfile}
                  onKeyDown={openUserProfile}
                >
                  <img
                    className="rounded-full w-4 h-4 cursor-pointer"
                    src={notification.user.avatar_url}
                    title={notification.user.login}
                    alt={`${notification.user.login}'s avatar`}
                  />
                </span>
              ) : (
                <span>
                  <FeedPersonIcon
                    size={16}
                    className="text-gray-500 dark:text-gray-300"
                  />
                </span>
              )}
              <span className="ml-1" title={reason.description}>
                {reason.title}
              </span>
              <span className="ml-1">{notification.updated_at.formatted}</span>
            </span>
          </span>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-80 transition-opacity">
        <button
          type="button"
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Done"
          onClick={() => markNotificationDone(notification.id, hostname)}
        >
          <CheckIcon size={16} aria-label="Mark as Done" />
        </button>

        <button
          type="button"
          className="focus:outline-none h-full hover:text-red-500"
          title="Unsubscribe"
          onClick={unsubscribe}
        >
          <BellSlashIcon size={14} aria-label="Unsubscribe" />
        </button>

        <button
          type="button"
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Read"
          onClick={() => markNotificationRead(notification.id, hostname)}
        >
          <ReadIcon size={14} aria-label="Mark as Read" />
        </button>
      </div>
    </div>
  );
};
