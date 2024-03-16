import React, { useCallback, useContext } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  CheckIcon,
  BellSlashIcon,
  ReadIcon,
  DotFillIcon,
} from '@primer/octicons-react';

import {
  formatReason,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/github-api';
import { formatForDisplay, openInBrowser } from '../utils/helpers';
import { Notification } from '../typesGithub';
import { AppContext } from '../context/App';

interface IProps {
  hostname: string;
  notification: Notification;
}

export const NotificationRow: React.FC<IProps> = ({
  notification,
  hostname,
}) => {
  const {
    settings,
    accounts,
    removeNotificationFromState,
    markNotification,
    markNotificationDone,
    unsubscribeNotification,
  } = useContext(AppContext);

  const pressTitle = useCallback(() => {
    openBrowser();

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification.id, hostname);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(notification.id, hostname);
    }
  }, [settings]);

  const openBrowser = useCallback(
    () => openInBrowser(notification, accounts),
    [notification],
  );

  const unsubscribe = (event: React.MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification.id, hostname);
  };

  const reason = formatReason(notification.reason);
  const NotificationIcon = getNotificationTypeIcon(notification.subject);
  const iconColor = getNotificationTypeIconColor(notification.subject);
  const realIconColor = settings
    ? (settings.colors && iconColor) || ''
    : iconColor;
  const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
    addSuffix: true,
  });
  const notificationTitle = formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);

  return (
    <div
      className={`flex space-x-3 py-2 px-3 bg-white border-b border-gray-100 dark:border-gray-darker group dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker
          ${!notification.unread ? 'opacity-50 dark:opacity-50' : ''}`}
    >
      <div
        className={`flex flex-col justify-center items-center w-5 ${realIconColor}`}
        title={notificationTitle}
      >
        <NotificationIcon size={18} aria-label={notification.subject.type} />
        {notification.unread ? (
          <DotFillIcon
            className="focus:outline-none h-full text-blue-500"
            size={14}
            aria-label="Unread"
          />
        ) : (
          <div className="w-[14px]" />
        )}
      </div>

      <div
        className="flex-1 overflow-hidden"
        onClick={() => pressTitle()}
        role="main"
      >
        <div className="mb-1 text-sm whitespace-nowrap overflow-ellipsis overflow-hidden">
          {notification.subject.title}
        </div>

        <div className="text-xs text-capitalize">
          <span title={reason.description}>{reason.type}</span> - Updated{' '}
          {updatedAt}
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-80 transition-opacity">
        <button
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Done"
          onClick={() => markNotificationDone(notification.id, hostname)}
        >
          <CheckIcon size={16} aria-label="Mark as Done" />
        </button>

        <button
          className="focus:outline-none h-full hover:text-red-500"
          title="Unsubscribe"
          onClick={unsubscribe}
        >
          <BellSlashIcon size={14} aria-label="Unsubscribe" />
        </button>

        {notification.unread ? (
          <button
            className="focus:outline-none h-full hover:text-green-500"
            title="Mark as Read"
            onClick={() => markNotification(notification.id, hostname)}
          >
            <ReadIcon size={14} aria-label="Mark as Read" />
          </button>
        ) : (
          <div className="w-[14px]" />
        )}
      </div>
    </div>
  );
};
