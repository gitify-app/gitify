import React, { useCallback, useContext } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CheckIcon, BellSlashIcon, ReadIcon } from '@primer/octicons-react';

import {
  formatReason,
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/github-api';
import { openInBrowser } from '../utils/helpers';
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
    markNotification,
    markNotificationDone,
    unsubscribeNotification,
  } = useContext(AppContext);

  const pressTitle = useCallback(() => {
    openBrowser();

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification.id, hostname, settings);
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
  const NotificationIcon = getNotificationTypeIcon(
    notification.subject.type,
    notification.subject.state,
  );
  const iconColor = getNotificationTypeIconColor(notification.subject.state);
  const realIconColor = settings
    ? (settings.colors && iconColor) || ''
    : iconColor;
  const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="flex space-x-3 py-2 px-3 bg-white dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker border-b border-gray-100 dark:border-gray-darker">
      <div className={`flex justify-center items-center w-5 ${realIconColor}`}>
        <NotificationIcon size={18} aria-label={notification.subject.type} />
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

      <div className="flex justify-center items-center gap-2">
        <button
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Done"
          onClick={() =>
            markNotificationDone(notification.id, hostname, settings)
          }
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

        <button
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Read"
          onClick={() => markNotification(notification.id, hostname, settings)}
        >
          <ReadIcon size={14} aria-label="Mark as Read" />
        </button>
      </div>
    </div>
  );
};
