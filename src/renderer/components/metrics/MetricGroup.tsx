import { type FC, useContext } from 'react';

import {
  CommentIcon,
  IssueOpenedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';

import { AppContext } from '../../context/App';
import { IconColor } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getPullRequestReviewIcon } from '../../utils/icons';
import { MetricPill } from './MetricPill';

interface IMetricGroup {
  notification: Notification;
}

export const MetricGroup: FC<IMetricGroup> = ({
  notification,
}: IMetricGroup) => {
  const { settings } = useContext(AppContext);

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
    settings.showPills && (
      <div className="flex gap-1">
        {notification.subject?.linkedIssues?.length > 0 && (
          <MetricPill
            color={IconColor.GRAY}
            icon={IssueOpenedIcon}
            metric={notification.subject.linkedIssues.length}
            title={linkedIssuesPillDescription}
          />
        )}

        {notification.subject.reviews?.map((review) => {
          const icon = getPullRequestReviewIcon(review);
          if (!icon) {
            return null;
          }

          return (
            <MetricPill
              color={icon.color}
              icon={icon.type}
              key={review.state}
              metric={review.users.length}
              title={icon.description}
            />
          );
        })}
        {notification.subject?.comments > 0 && (
          <MetricPill
            color={IconColor.GRAY}
            icon={CommentIcon}
            metric={notification.subject.comments}
            title={commentsPillDescription}
          />
        )}
        {notification.subject?.labels?.length > 0 && (
          <MetricPill
            color={IconColor.GRAY}
            icon={TagIcon}
            metric={notification.subject.labels.length}
            title={labelsPillDescription}
          />
        )}
        {notification.subject.milestone && (
          <MetricPill
            color={
              notification.subject.milestone.state === 'open'
                ? IconColor.GREEN
                : IconColor.RED
            }
            icon={MilestoneIcon}
            title={notification.subject.milestone.title}
          />
        )}
      </div>
    )
  );
};
