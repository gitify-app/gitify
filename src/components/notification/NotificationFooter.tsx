import {
  CommentIcon,
  FeedPersonIcon,
  IssueClosedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';
import { type FC, type MouseEvent, useContext } from 'react';
import { AppContext } from '../../context/App';
import { IconColor, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { formatNotificationUpdatedAt } from '../../utils/helpers';
import { getPullRequestReviewIcon } from '../../utils/icons';
import { openUserProfile } from '../../utils/links';
import { formatReason } from '../../utils/reason';
import { PillButton } from '../buttons/PillButton';
import { AvatarIcon } from '../icons/AvatarIcon';

interface INotificationFooter {
  notification: Notification;
}

export const NotificationFooter: FC<INotificationFooter> = ({
  notification,
}: INotificationFooter) => {
  const { settings } = useContext(AppContext);

  const reason = formatReason(notification.reason);

  const updatedAt = formatNotificationUpdatedAt(notification);
  const updatedLabel = notification.subject.user
    ? `${notification.subject.user.login} updated ${updatedAt}`
    : `Updated ${updatedAt}`;

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
      className={cn(
        'flex flex-wrap items-center gap-1 text-xs capitalize',
        Opacity.MEDIUM,
      )}
    >
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
            size={Size.XSMALL}
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
  );
};
