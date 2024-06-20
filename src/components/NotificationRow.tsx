import {
  BellSlashIcon,
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  IssueClosedIcon,
  MarkGithubIcon,
  MilestoneIcon,
  ReadIcon,
  TagIcon,
} from '@primer/octicons-react';
import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AppContext } from '../context/App';
import { IconColor, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import {
  formatForDisplay,
  formatNotificationUpdatedAt,
} from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
  getPullRequestReviewIcon,
} from '../utils/icons';
import {
  openNotification,
  openRepository,
  openUserProfile,
} from '../utils/links';
import { formatReason } from '../utils/reason';
import { PillButton } from './buttons/PillButton';
import { AvatarIcon } from './icons/AvatarIcon';

interface INotificationRow {
  notification: Notification;
}

export const NotificationRow: FC<INotificationRow> = ({
  notification,
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

  const handleNotification = useCallback(() => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);

    openNotification(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(settings, notification);
    }
  }, [
    notification,
    markNotificationDone,
    removeNotificationFromState,
    settings,
  ]);
  const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification);
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

  const repoAvatarUrl = notification.repository.owner.avatar_url;
  const repoSlug = notification.repository.full_name;

  const groupByRepository = settings.groupBy === 'REPOSITORY';

  return (
    <div
      id={notification.id}
      className={cn(
        'group flex border-b border-gray-100 bg-white px-3 py-2 hover:bg-gray-100 dark:border-gray-darker dark:bg-gray-dark dark:text-white dark:hover:bg-gray-darker',
        animateExit &&
          'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
        showAsRead && 'opacity-50 dark:opacity-50',
      )}
    >
      <div
        className={cn('mr-3 flex w-5 items-center justify-center', iconColor)}
        title={notificationTitle}
      >
        <NotificationIcon
          size={groupByRepository ? Size.MEDIUM : Size.XLARGE}
          aria-label={notification.subject.type}
        />
      </div>

      <div
        className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
        onClick={() => handleNotification()}
      >
        {!groupByRepository && (
          <div
            className="mb-1 flex items-center gap-1 cursor-pointer truncate text-sm font-medium "
            title={repoSlug}
          >
            <span>
              <AvatarIcon
                title={repoSlug}
                url={repoAvatarUrl}
                size={Size.LARGE}
                defaultIcon={MarkGithubIcon}
              />
            </span>
            <span
              className="cursor-pointer truncate opacity-90"
              onClick={() => openRepository(notification.repository)}
            >
              {repoSlug}
            </span>
          </div>
        )}

        <div
          className="mb-1 cursor-pointer truncate text-sm"
          role="main"
          title={notification.subject.title}
        >
          {notification.subject.title}
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs capitalize">
          {notification.subject.user ? (
            <button
              type="button"
              title="View User Profile"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openUserProfile(notification.subject.user);
              }}
              className="flex-shrink-0"
            >
              <AvatarIcon
                title={notification.subject.user.login}
                url={notification.subject.user.avatar_url}
                size={Size.SMALL}
                defaultIcon={FeedPersonIcon}
              />
            </button>
          ) : (
            <div>
              <FeedPersonIcon size={Size.MEDIUM} className={IconColor.GRAY} />
            </div>
          )}
          <div title={reason.description}>{reason.title}</div>
          <div title={updatedLabel}>{updatedAt}</div>
          {settings.showPills && (
            <div className="flex">
              {notification.subject?.linkedIssues?.length > 0 && (
                <PillButton
                  title={linkedIssuesPillDescription}
                  metric={notification.subject.linkedIssues.length}
                  icon={IssueClosedIcon}
                  color={IconColor.GREEN}
                />
              )}

              {notification.subject.reviews?.map((review) => {
                const icon = getPullRequestReviewIcon(review);
                if (!icon) {
                  return null;
                }

                return (
                  <PillButton
                    key={review.state}
                    title={icon.description}
                    metric={review.users.length}
                    icon={icon.type}
                    color={icon.color}
                  />
                );
              })}
              {notification.subject?.comments > 0 && (
                <PillButton
                  title={commentsPillDescription}
                  metric={notification.subject.comments}
                  icon={CommentIcon}
                  color={IconColor.GRAY}
                />
              )}
              {notification.subject?.labels?.length > 0 && (
                <PillButton
                  title={labelsPillDescription}
                  metric={notification.subject.labels.length}
                  icon={TagIcon}
                  color={IconColor.GRAY}
                />
              )}
              {notification.subject.milestone && (
                <PillButton
                  title={notification.subject.milestone.title}
                  icon={MilestoneIcon}
                  color={
                    notification.subject.milestone.state === 'open'
                      ? IconColor.GREEN
                      : IconColor.RED
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-80">
        <button
          type="button"
          className="h-full hover:text-green-500 focus:outline-none"
          title="Mark as Done"
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationDone(notification);
          }}
        >
          <CheckIcon size={Size.MEDIUM} aria-label="Mark as Done" />
        </button>

        <button
          type="button"
          className="h-full hover:text-green-500 focus:outline-none"
          title="Mark as Read"
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationRead(notification);
          }}
        >
          <ReadIcon size={Size.SMALL} aria-label="Mark as Read" />
        </button>

        <button
          type="button"
          className="h-full hover:text-red-500 focus:outline-none"
          title="Unsubscribe from Thread"
          onClick={unsubscribeFromThread}
        >
          <BellSlashIcon
            size={Size.SMALL}
            aria-label="Unsubscribe from Thread"
          />
        </button>
      </div>
    </div>
  );
};
