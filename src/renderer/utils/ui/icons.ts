import type { FC } from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CommentIcon,
  FeedPersonIcon,
  FileDiffIcon,
  type Icon,
  MarkGithubIcon,
  type OcticonProps,
  OrganizationIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@primer/octicons-react';

import {
  type ChevronDirection,
  IconColor,
  type PullRequestApprovalIcon,
  type UserType,
} from '../../types';
import type { PlatformType } from '../auth/types';

import { BitbucketIcon } from '../../icons/BitbucketIcon';
import { GitLabIcon } from '../../icons/GitLabIcon';
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
        description: `${descriptionPrefix} approved these changes`,
      };
    case 'CHANGES_REQUESTED':
      return {
        type: FileDiffIcon,
        color: IconColor.RED,
        description: `${descriptionPrefix} requested changes`,
      };
    case 'COMMENTED':
      return {
        type: CommentIcon,
        color: IconColor.YELLOW,
        description: `${descriptionPrefix} left review comments`,
      };
    case 'DISMISSED':
      return {
        type: CommentIcon,
        color: IconColor.GRAY,
        description: `${descriptionPrefix} ${
          review.users.length > 1 ? 'reviews have' : 'review has'
        } been dismissed`,
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

const CHEVRON_ICONS: Record<ChevronDirection, Icon> = {
  down: ChevronDownIcon,
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
};

export function getChevronIcon(direction: ChevronDirection): Icon {
  return CHEVRON_ICONS[direction];
}
