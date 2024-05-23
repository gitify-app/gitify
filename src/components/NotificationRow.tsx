import {
  BellSlashIcon,
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  ReadIcon,
} from '@primer/octicons-react';
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useContext,
} from 'react';

import { AppContext } from '../context/App';
import { IconColor } from '../types';
import type { Notification } from '../typesGitHub';
import { openExternalLink } from '../utils/comms';
import {
  formatForDisplay,
  formatNotificationUpdatedAt,
  openInBrowser,
} from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
  getPullRequestReviewIcon,
} from '../utils/icons';
import { formatReason } from '../utils/reason';

interface IProps {
  hostname: string;
  notification: Notification;
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
    openInBrowser(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification.id, hostname);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(settings, notification.id, hostname);
    }
  }, [notifications, notification, accounts, settings]); // notifications required here to prevent weird state issues

  const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification.id, hostname);
  };

  const openUserProfile = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    openExternalLink(notification.subject.user.html_url);
  };

  const reason = formatReason(notification.reason);
  const NotificationIcon = getNotificationTypeIcon(notification.subject);
  const iconColor = getNotificationTypeIconColor(notification.subject);

  const updatedAt = formatNotificationUpdatedAt(notification);
  const updatedLabel = notification.subject.user
    ? `${notification.subject.user.login} updated ${updatedAt}`
    : `Updated ${updatedAt}`;

  const notificationTitle = formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);

  const commentsLabel = `${notification.subject.comments} ${
    notification.subject.comments > 1 ? 'comments' : 'comment'
  }`;

  return (
    <div
      id={notification.id}
      className="flex space-x-3 py-2 px-3 bg-white dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker border-b border-gray-100 dark:border-gray-darker group"
    >
      <div
        className={`flex justify-center items-center w-5 ${iconColor}`}
        title={notificationTitle}
      >
        <NotificationIcon size={18} aria-label={notification.subject.type} />
      </div>

      <div
        className="flex-1 overflow-hidden"
        onClick={() => openNotification()}
        onKeyDown={() => openNotification()}
      >
        <div
          className="mb-1 text-sm whitespace-nowrap overflow-ellipsis overflow-hidden cursor-pointer"
          role="main"
          title={notification.subject.title}
        >
          {notification.subject.title}
        </div>

        <div className="text-xs text-capitalize whitespace-nowrap overflow-ellipsis overflow-hidden">
          <span className="flex items-center">
            <span title={updatedLabel} className="flex">
              {notification.subject.user ? (
                <span
                  title="View User Profile"
                  onClick={openUserProfile}
                  onKeyDown={openUserProfile}
                >
                  <img
                    className="rounded-full w-4 h-4 cursor-pointer"
                    src={notification.subject.user.avatar_url}
                    title={notification.subject.user.login}
                    alt={`${notification.subject.user.login}'s avatar`}
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
              <span className="ml-1">{updatedAt}</span>
              {notification.subject.reviews
                ? notification.subject.reviews.map((review) => {
                    const icon = getPullRequestReviewIcon(review);
                    if (!icon) {
                      return null;
                    }

                    return (
                      <span
                        key={review.state}
                        title={icon.description}
                        className="ml-1"
                      >
                        <icon.type
                          size={16}
                          className={icon.color}
                          aria-label={icon.description}
                        />
                      </span>
                    );
                  })
                : null}
              {notification.subject?.comments > 0 && (
                <span className="ml-1" title={commentsLabel}>
                  <CommentIcon
                    size={16}
                    className={IconColor.GRAY}
                    aria-label={commentsLabel}
                  />
                </span>
              )}
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
          title="Unsubscribe from Thread"
          onClick={unsubscribeFromThread}
        >
          <BellSlashIcon size={14} aria-label="Unsubscribe from Thread" />
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
