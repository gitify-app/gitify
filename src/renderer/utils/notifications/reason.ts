import type { Reason, TypeDetails } from '../../types';

import i18n from '../../i18n';

export function getReasonTypeDetails(): Record<Reason, TypeDetails> {
  return {
    agent_session_finished: {
      title: i18n.t('reasons.agent_session_finished', 'Agent Session Finished'),
      description: i18n.t(
        'reasons.agent_session_finished_description',
        'A GitHub Copilot cloud agent session finished running.',
      ),
    },
    approval_requested: {
      title: i18n.t('reasons.approval_requested', 'Approval Requested'),
      description: i18n.t(
        'reasons.approval_requested_description',
        'You were requested to review and approve a deployment.',
      ),
    },
    assign: {
      title: i18n.t('reasons.assign', 'Assigned'),
      description: i18n.t('reasons.assign_description', 'You were assigned to the issue.'),
    },
    author: {
      title: i18n.t('reasons.author', 'Authored'),
      description: i18n.t('reasons.author_description', 'You created the thread.'),
    },
    ci_activity: {
      title: i18n.t('reasons.ci_activity', 'Workflow Run Completed'),
      description: i18n.t(
        'reasons.ci_activity_description',
        'A GitHub Actions workflow run was triggered for your repository.',
      ),
    },
    comment: {
      title: i18n.t('reasons.comment', 'Commented'),
      description: i18n.t('reasons.comment_description', 'You commented on the thread.'),
    },
    invitation: {
      title: i18n.t('reasons.invitation', 'Invitation Received'),
      description: i18n.t(
        'reasons.invitation_description',
        'You accepted an invitation to contribute to the repository.',
      ),
    },
    manual: {
      title: i18n.t('reasons.manual', 'Updated'),
      description: i18n.t(
        'reasons.manual_description',
        'You subscribed to the thread (via an issue or pull request).',
      ),
    },
    member_feature_requested: {
      title: i18n.t('reasons.member_feature_requested', 'Member Feature Requested'),
      description: i18n.t(
        'reasons.member_feature_requested_description',
        'Organization members have requested to enable a feature such as Draft Pull Requests or Copilot.',
      ),
    },
    mention: {
      title: i18n.t('reasons.mention', 'Mentioned'),
      description: i18n.t(
        'reasons.mention_description',
        'You were specifically @mentioned in the content.',
      ),
    },
    review_requested: {
      title: i18n.t('reasons.review_requested', 'Review Requested'),
      description: i18n.t(
        'reasons.review_requested_description',
        "You, or a team you're a member of, were requested to review a pull request.",
      ),
    },
    security_advisory_credit: {
      title: i18n.t('reasons.security_advisory_credit', 'Security Advisory Credit Received'),
      description: i18n.t(
        'reasons.security_advisory_credit_description',
        'You were credited for contributing to a security advisory.',
      ),
    },
    security_alert: {
      title: i18n.t('reasons.security_alert', 'Security Alert Received'),
      description: i18n.t(
        'reasons.security_alert_description',
        'GitHub discovered a security vulnerability in your repository.',
      ),
    },
    state_change: {
      title: i18n.t('reasons.state_change', 'State Changed'),
      description: i18n.t(
        'reasons.state_change_description',
        'You changed the thread state (for example, closing an issue or merging a pull request).',
      ),
    },
    subscribed: {
      title: i18n.t('reasons.subscribed', 'Updated'),
      description: i18n.t('reasons.subscribed_description', "You're watching the repository."),
    },
    team_mention: {
      title: i18n.t('reasons.team_mention', 'Team Mentioned'),
      description: i18n.t(
        'reasons.team_mention_description',
        'You were on a team that was mentioned.',
      ),
    },
  };
}

export function getUnknownReasonDetails(): TypeDetails {
  return {
    title: i18n.t('reasons.unknown', 'Unknown'),
    description: i18n.t(
      'reasons.unknown_description',
      'The reason for this notification is not supported by the app.',
    ),
  };
}

export function getReasonDetails(reason: Reason): TypeDetails {
  return getReasonTypeDetails()[reason] || getUnknownReasonDetails();
}
