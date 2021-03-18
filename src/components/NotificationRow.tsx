const { shell } = require('electron');

import React, { useCallback, useContext } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CheckIcon, MuteIcon } from '@primer/octicons-react';

import { formatReason, getNotificationTypeIcon } from '../utils/github-api';
import { generateGitHubWebUrl } from '../utils/helpers';
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
  const { settings } = useContext(AppContext);
  const { markNotification, unsubscribeNotification } = useContext(AppContext);

  const pressTitle = useCallback(() => {
    openBrowser();

    if (settings.markOnClick) {
      markNotification(notification.id, hostname);
    }
  }, [settings]);

  const openBrowser = useCallback(() => {
    // Some Notification types from GitHub are missing urls in their subjects.
    if (notification.subject.url) {
      const url = generateGitHubWebUrl(notification.subject.url);
      shell.openExternal(url);
    }

    // TODO remove this future-legacy code when Github have pushed a fix (see #424)
    if (
      notification.subject.url === null &&
      notification.subject.type === 'Discussion' &&
      notification.repository.url
    ) {
      const url = generateGitHubWebUrl(
        `${notification.repository.url}/discussions`
      );
      shell.openExternal(url);
    }
  }, [notification]);

  const unsubscribe = (event: React.MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification.id, hostname);
  };

  const reason = formatReason(notification.reason);
  const NotificationIcon = getNotificationTypeIcon(notification.subject.type);
  const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="flex space-x-2 p-2 bg-white dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker border-b border-gray-100 dark:border-gray-darker">
      <div className="flex justify-center items-center w-8">
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
          <button
            className="border-0 bg-none float-right"
            title="Unsubscribe"
            onClick={unsubscribe}
          >
            <MuteIcon
              className="hover:text-red-500"
              size={13}
              aria-label="Unsubscribe"
            />
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center w-8">
        <button
          className="focus:outline-none"
          title="Mark as Read"
          onClick={() => markNotification(notification.id, hostname)}
        >
          <CheckIcon
            className="hover:text-green-500"
            size={20}
            aria-label="Mark as Read"
          />
        </button>
      </div>
    </div>
  );
};
