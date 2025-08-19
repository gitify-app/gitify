import type { FC } from 'react';

import {
  AppsIcon,
  CheckIcon,
  CommentIcon,
  FeedPersonIcon,
  FileDiffIcon,
  KeyIcon,
  MarkGithubIcon,
  type OcticonProps,
  OrganizationIcon,
  PersonIcon,
  ServerIcon,
} from '@primer/octicons-react';

import { IconColor, type PullRequestApprovalIcon } from '../types';
import type { GitifyPullRequestReview, UserType } from '../typesGitHub';
import type { AuthMethod, PlatformType } from './auth/types';

export function getPullRequestReviewIcon(
  review: GitifyPullRequestReview,
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

export function getAuthMethodIcon(method: AuthMethod): FC<OcticonProps> | null {
  switch (method) {
    case 'GitHub App':
      return AppsIcon;
    case 'OAuth App':
      return PersonIcon;
    default:
      return KeyIcon;
  }
}

export function getPlatformIcon(
  platform: PlatformType,
): FC<OcticonProps> | null {
  switch (platform) {
    case 'GitHub Enterprise Server':
      return ServerIcon;
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
