import {
  BellSlashIcon,
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  IssueClosedIcon,
  MilestoneIcon,
  ReadIcon,
  TagIcon,
} from '@primer/octicons-react';
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useContext,
} from 'react';

import { AppContext } from '../context/App';
import { PILL_CLASS_NAME } from '../styles/gitify';
import { type Account, IconColor } from '../types';
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
  account: Account;
  notification: Notification;
}

export const NotificationRow: FC<IProps> = ({ notification, account }) => {
  const {
    auth,
    settings,
    removeNotificationFromState,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
    notifications,
  } = useContext(AppContext);

  const openNotification = useCallback(() => {
    openInBrowser(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(settings, notification);
    }
  }, [notifications, notification, auth, settings]); // notifications required here to prevent weird state issues

  const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification);
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

  const commentsPillDescription = `${notification.subject.comments} ${
    notification.subject.comments > 1 ? 'comments' : 'comment'
  }`;

  const labelsPillDescription = notification.subject.labels
    ?.map((label) => `🏷️ ${label}`)
    .join('\n');

  const linkedIssuesPillDescription = `Linked to ${
    notification.subject.linkedIssues?.length > 1 ? 'issues' : 'issue'
  } ${notification.subject?.linkedIssues?.join(', ')}`;

  return (
    <div
      id={notification.id}
      className="flex py-2 px-3 bg-white dark:bg-gray-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-darker border-b border-gray-100 dark:border-gray-darker group"
    >
      <div
        className={`flex justify-center items-center mr-3 w-5 ${iconColor}`}
        title={notificationTitle}
      >
        <NotificationIcon size={18} aria-label={notification.subject.type} />
      </div>

      <div
        className="flex-1 whitespace-nowrap overflow-hidden overflow-ellipsis"
        onClick={() => openNotification()}
        onKeyDown={() => openNotification()}
      >
        <div
          className="mb-1 text-sm truncate cursor-pointer"
          role="main"
          title={notification.subject.title}
        >
          {notification.subject.title}
        </div>

        <div className="flex flex-wrap items-center text-xs text-capitalize gap-1">
          {notification.subject.user ? (
            <div
              title="View User Profile"
              onClick={openUserProfile}
              onKeyDown={openUserProfile}
              className="flex-shrink-0"
            >
              <img
                className="rounded-full w-4 h-4 object-cover cursor-pointer"
                src={notification.subject.user.avatar_url}
                title={notification.subject.user.login}
                alt={`${notification.subject.user.login}'s avatar`}
              />
            </div>
          ) : (
            <div>
              <FeedPersonIcon
                size={16}
                className="text-gray-500 dark:text-gray-300"
              />
            </div>
          )}
          <div title={reason.description}>{reason.title}</div>
          <div title={updatedLabel}>{updatedAt}</div>
          {settings.showPills && (
            <div>
              {notification.subject?.linkedIssues?.length > 0 && (
                <span title={linkedIssuesPillDescription}>
                  <button type="button" className={PILL_CLASS_NAME}>
                    <IssueClosedIcon
                      size={12}
                      className={`mr-1 ${IconColor.GREEN}`}
                      aria-label={linkedIssuesPillDescription}
                    />
                    {notification.subject.linkedIssues.length}
                  </button>
                </span>
              )}
              {notification.subject.reviews?.map((review) => {
                const icon = getPullRequestReviewIcon(review);
                if (!icon) {
                  return null;
                }

                return (
                  <span key={review.state} title={icon.description}>
                    <button type="button" className={PILL_CLASS_NAME}>
                      <icon.type
                        size={12}
                        className={`mr-1 ${icon.color}`}
                        aria-label={icon.description}
                      />
                      {review.users.length}
                    </button>
                  </span>
                );
              })}
              {notification.subject?.comments > 0 && (
                <span title={commentsPillDescription}>
                  <button type="button" className={PILL_CLASS_NAME}>
                    <CommentIcon
                      size={12}
                      className={`mr-1 ${IconColor.GRAY}`}
                      aria-label={commentsPillDescription}
                    />
                    {notification.subject.comments}
                  </button>
                </span>
              )}
              {notification.subject?.labels?.length > 0 && (
                <span title={labelsPillDescription}>
                  <button type="button" className={PILL_CLASS_NAME}>
                    <TagIcon
                      size={12}
                      className={`mr-1 ${IconColor.GRAY}`}
                      aria-label={labelsPillDescription}
                    />
                    {notification.subject.labels.length}
                  </button>
                </span>
              )}
              {notification.subject.milestone && (
                <span
                  className="ml-1"
                  title={notification.subject.milestone.title}
                >
                  <button type="button" className={PILL_CLASS_NAME}>
                    <MilestoneIcon
                      size={12}
                      className={
                        notification.subject.milestone.state === 'open'
                          ? IconColor.GREEN
                          : IconColor.RED
                      }
                      aria-label={notification.subject.milestone.title}
                    />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-80 transition-opacity">
        <button
          type="button"
          className="focus:outline-none h-full hover:text-green-500"
          title="Mark as Done"
          onClick={() => markNotificationDone(notification)}
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
          onClick={() => markNotificationRead(notification)}
        >
          <ReadIcon size={14} aria-label="Mark as Read" />
        </button>
      </div>
    </div>
  );
};
