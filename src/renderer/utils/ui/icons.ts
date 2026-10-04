import type { FC } from 'react';

import {
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  FileDiffIcon,
  MarkGithubIcon,
  type OcticonProps,
  OrganizationIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@primer/octicons-react';

import { BitbucketIcon } from '../../components/icons/BitbucketIcon';
import { GitLabIcon } from '../../components/icons/GitLabIcon';

import { IconColor, type PullRequestApprovalIcon, type UserType } from '../../types';
import type { PlatformType } from '../auth/types';

import i18n from '../../i18n';
import type { PullRequestReviewState } from '../forges/github/graphql/generated/graphql';

export interface PullRequestReviewGroup {
  state: PullRequestReviewState;
  users: string[];
}

export function getPullRequestReviewIcon(
  review: PullRequestReviewGroup,
): PullRequestApprovalIcon | null {
  const descriptionPrefix = review.users.join(', ');

  switch (review.state) {
    case 'APPROVED':
      return {
        type: CheckIcon,
        color: IconColor.GREEN,
        description: i18n.t('review.approved', '{{users}} approved these changes', {
          users: descriptionPrefix,
        }),
      };
    case 'CHANGES_REQUESTED':
      return {
        type: FileDiffIcon,
        color: IconColor.RED,
        description: i18n.t('review.changes_requested', '{{users}} requested changes', {
          users: descriptionPrefix,
        }),
      };
    case 'COMMENTED':
      return {
        type: CommentIcon,
        color: IconColor.YELLOW,
        description: i18n.t('review.commented', '{{users}} left review comments', {
          users: descriptionPrefix,
        }),
      };
    case 'DISMISSED':
      return {
        type: CommentIcon,
        color: IconColor.GRAY,
        description:
          review.users.length > 1
            ? i18n.t('review.dismissed_plural', '{{users}} reviews have been dismissed', {
                users: descriptionPrefix,
              })
            : i18n.t('review.dismissed_singular', '{{user}} review has been dismissed', {
                user: descriptionPrefix,
              }),
      };
    default:
      return null;
  }
}

export function getPlatformIcon(platform: PlatformType): FC<OcticonProps> | null {
  switch (platform) {
    case 'Bitbucket Cloud':
      return BitbucketIcon;
    case 'Gitea':
      return ServerIcon;
    case 'GitLab Cloud':
    case 'GitLab Self-Managed':
      return GitLabIcon;
    case 'GitHub Enterprise Server':
      return ServerIcon;
    case 'GitHub Enterprise Cloud with Data Residency':
      return ShieldCheckIcon;
    default:
      return MarkGithubIcon;
  }
}

export function getDefaultUserIcon(userType: UserType) {
  switch (userType) {
    case 'Bot':
    case 'Mannequin':
      return MarkGithubIcon;
    case 'Organization':
      return OrganizationIcon;
    default:
      return FeedPersonIcon;
  }
}
