import type { TypeDetails } from '../types';
import type { Reason } from '../typesGitHub';

export const FORMATTED_REASONS: Record<Reason, TypeDetails> = {
  approval_requested: {
    title: 'Approval Requested',
    description: 'You were requested to review and approve a deployment.',
  },
  assign: {
    title: 'Assigned',
    description: 'You were assigned to the issue.',
  },
  author: {
    title: 'Authored',
    description: 'You created the thread.',
  },
  ci_activity: {
    title: 'Workflow Run Completed',
    description:
      'A GitHub Actions workflow run was triggered for your repository.',
  },
  comment: {
    title: 'Commented',
    description: 'You commented on the thread.',
  },
  invitation: {
    title: 'Invitation Received',
    description: 'You accepted an invitation to contribute to the repository.',
  },
  manual: {
    title: 'Updated',
    description: 'You subscribed to the thread (via an issue or pull request).',
  },
  member_feature_requested: {
    title: 'Member Feature Requested',
    description:
      'Organization members have requested to enable a feature such as Draft Pull Requests or Copilot.',
  },
  mention: {
    title: 'Mentioned',
    description: 'You were specifically @mentioned in the content.',
  },
  review_requested: {
    title: 'Review Requested',
    description:
      "You, or a team you're a member of, were requested to review a pull request.",
  },
  security_advisory_credit: {
    title: 'Security Advisory Credit Received',
    description: 'You were credited for contributing to a security advisory.',
  },
  security_alert: {
    title: 'Security Alert Received',
    description:
      'GitHub discovered a security vulnerability in your repository.',
  },
  state_change: {
    title: 'State Changed',
    description:
      'You changed the thread state (for example, closing an issue or merging a pull request).',
  },
  subscribed: {
    title: 'Updated',
    description: "You're watching the repository.",
  },
  team_mention: {
    title: 'Team Mentioned',
    description: 'You were on a team that was mentioned.',
  },
};

const UNKNOWN_REASON: TypeDetails = {
  title: 'Unknown',
  description: 'The reason for this notification is not supported by the app.',
};

export function getReasonDetails(reason: Reason): TypeDetails {
  return FORMATTED_REASONS[reason] || UNKNOWN_REASON;
}
