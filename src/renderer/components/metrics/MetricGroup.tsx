import { type FC, useContext } from 'react';

import {
  CommentIcon,
  IssueClosedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';
import { Box } from '@primer/react';

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
      <Box className="flex gap-1">
        {notification.subject?.linkedIssues?.length > 0 && (
          <MetricPill
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
            <MetricPill
              key={review.state}
              title={icon.description}
              metric={review.users.length}
              icon={icon.type}
              color={icon.color}
            />
          );
        })}
        {notification.subject?.comments > 0 && (
          <MetricPill
            title={commentsPillDescription}
            metric={notification.subject.comments}
            icon={CommentIcon}
            color={IconColor.GRAY}
          />
        )}
        {notification.subject?.labels?.length > 0 && (
          <MetricPill
            title={labelsPillDescription}
            metric={notification.subject.labels.length}
            icon={TagIcon}
            color={IconColor.GRAY}
          />
        )}
        {notification.subject.milestone && (
          <MetricPill
            title={notification.subject.milestone.title}
            icon={MilestoneIcon}
            color={
              notification.subject.milestone.state === 'open'
                ? IconColor.GREEN
                : IconColor.RED
            }
          />
        )}
      </Box>
    )
  );
};
