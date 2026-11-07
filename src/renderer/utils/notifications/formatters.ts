import type { RawGitifyNotification, SubjectType, GitifyNotificationState } from '../../types';

import i18n from '../../i18n';

/**
 * Normalise an array of text segments into a single display-ready string.
 *
 * Joins the segments with spaces, inserts a space between a lowercase
 * character followed by an uppercase one (camelCase splitting), replaces
 * underscores with spaces, trims whitespace, and applies proper-case
 * capitalisation.
 *
 * @param text - The array of raw text segments to format.
 * @returns The formatted, human-readable string.
 */
export function formatForDisplay(text: string[]): string {
  if (!text) {
    return '';
  }

  return formatProperCase(
    text
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase character followed by an uppercase character
      .replaceAll('_', ' ') // Replace underscores with spaces
      .trim(),
  );
}

/**
 * Formats a string to proper case: capitalize the first letter of each word and
 * lower-case the remaining characters.
 *
 * @param text - The string to format.
 * @returns The proper-cased string.
 */
export function formatProperCase(text: string) {
  if (!text) {
    return '';
  }

  return text.replace(/\w+/g, (word) => {
    // Convert to proper case (capitalize first letter of each word)
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Return the formatted notification type for this notification.
 *
 * @param notification - The notification whose type to format.
 * @returns A human-readable type string (e.g. "Open Pull Request").
 */
export function formatNotificationType(notification: RawGitifyNotification): string {
  const { state, type } = notification.subject;
  const types: Record<SubjectType, string> = {
    AgentSessionThread: i18n.t('notification_type.AgentSessionThread', 'Agent Session Thread'),
    BitbucketNotification: i18n.t(
      'notification_type.BitbucketNotification',
      'Bitbucket Notification',
    ),
    CheckSuite: i18n.t('notification_type.CheckSuite', 'Check Suite'),
    Commit: i18n.t('notification_type.Commit', 'Commit'),
    Discussion: i18n.t('notification_type.Discussion', 'Discussion'),
    // Keep the GitLab brand intact; camel-case splitting would produce "Git Lab Todo".
    GitLabTodo: i18n.t('notification_type.GitLabTodo', 'GitLab To-Do'),
    Issue: i18n.t('notification_type.Issue', 'Issue'),
    PullRequest: i18n.t('notification_type.PullRequest', 'Pull Request'),
    Release: i18n.t('notification_type.Release', 'Release'),
    RepositoryAdvisory: i18n.t('notification_type.RepositoryAdvisory', 'Repository Advisory'),
    RepositoryDependabotAlertsThread: i18n.t(
      'notification_type.RepositoryDependabotAlertsThread',
      'Repository Dependabot Alerts Thread',
    ),
    RepositoryInvitation: i18n.t('notification_type.RepositoryInvitation', 'Repository Invitation'),
    RepositoryVulnerabilityAlert: i18n.t(
      'notification_type.RepositoryVulnerabilityAlert',
      'Repository Vulnerability Alert',
    ),
    WorkflowRun: i18n.t('notification_type.WorkflowRun', 'Workflow Run'),
  };
  const states: Record<GitifyNotificationState, string> = {
    ACTION_REQUIRED: i18n.t('notification_state.ACTION_REQUIRED', 'Action Required'),
    CANCELLED: i18n.t('notification_state.CANCELLED', 'Cancelled'),
    COMPLETED: i18n.t('notification_state.COMPLETED', 'Completed'),
    FAILURE: i18n.t('notification_state.FAILURE', 'Failure'),
    IN_PROGRESS: i18n.t('notification_state.IN_PROGRESS', 'In Progress'),
    PENDING: i18n.t('notification_state.PENDING', 'Pending'),
    QUEUED: i18n.t('notification_state.QUEUED', 'Queued'),
    REQUESTED: i18n.t('notification_state.REQUESTED', 'Requested'),
    SKIPPED: i18n.t('notification_state.SKIPPED', 'Skipped'),
    STALE: i18n.t('notification_state.STALE', 'Stale'),
    SUCCESS: i18n.t('notification_state.SUCCESS', 'Success'),
    TIMED_OUT: i18n.t('notification_state.TIMED_OUT', 'Timed Out'),
    WAITING: i18n.t('notification_state.WAITING', 'Waiting'),
    OUTDATED: i18n.t('notification_state.OUTDATED', 'Outdated'),
    OPEN: i18n.t('notification_state.OPEN', 'Open'),
    CLOSED: i18n.t('notification_state.CLOSED', 'Closed'),
    MERGED: i18n.t('notification_state.MERGED', 'Merged'),
    DRAFT: i18n.t('notification_state.DRAFT', 'Draft'),
    MERGE_QUEUE: i18n.t('notification_state.MERGE_QUEUE', 'Merge Queue'),
    REOPENED: i18n.t('notification_state.REOPENED', 'Reopened'),
    ANSWERED: i18n.t('notification_state.ANSWERED', 'Answered'),
    DUPLICATE: i18n.t('notification_state.DUPLICATE', 'Duplicate'),
    NOT_PLANNED: i18n.t('notification_state.NOT_PLANNED', 'Not Planned'),
    RESOLVED: i18n.t('notification_state.RESOLVED', 'Resolved'),
  };
  const label = types[type] ?? formatForDisplay([type]);
  return state
    ? i18n.t('notifications.type_with_state', '{{state}} {{type}}', {
        state: states[state] ?? formatForDisplay([state]),
        type: label,
      })
    : label;
}

/**
 * Return the formatted (issue, pull request, discussion) number for this notification.
 *
 * @param num - The numeric issue/PR/discussion number.
 * @returns The number prefixed with `#` (e.g. `"#42"`).
 */
export function formatGitHubNumber(num: number): string {
  return `#${num}`;
}

/** Length of an abbreviated commit SHA, matching GitHub's short form. */
export const COMMIT_SHA_SHORT_LENGTH = 7;

/**
 * Abbreviate a commit SHA to GitHub's short form.
 *
 * @param sha - The full commit SHA.
 * @returns The first seven characters of the SHA.
 */
export function formatCommitSha(sha: string): string {
  return sha.slice(0, COMMIT_SHA_SHORT_LENGTH);
}

/**
 * Return the identifier for this notification.
 *
 * Resolves the subject's identifier in priority order: an issue/PR/discussion
 * `#number`, a release tag, or an abbreviated commit SHA.
 *
 * @param notification - The notification whose subject identifier to format.
 * @returns The identifier string, or `""` when the subject has none.
 */
export function formatNotificationIdentifier(notification: RawGitifyNotification): string {
  const number = notification.subject?.number;

  if (number) {
    return formatGitHubNumber(number);
  }

  const tagName = notification.subject?.tagName;

  if (tagName) {
    return tagName;
  }

  const commitSha = notification.subject?.commitSha;

  if (commitSha) {
    return formatCommitSha(commitSha);
  }

  return '';
}

/**
 * Return the formatted notification title for this notification.
 *
 * Appends the subject number in brackets when present (e.g. `"Fix bug [#42]"`).
 * Release tags and commit SHAs are not appended - those subjects surface their
 * identifier in the row's identifier slot only.
 *
 * @param notification - The notification whose title to format.
 * @returns The display title string.
 */
export function formatNotificationTitle(notification: RawGitifyNotification): string {
  let title = notification.subject.title;
  const number = notification.subject?.number;

  if (number) {
    title = `${title} [${formatGitHubNumber(number)}]`;
  }

  return title;
}

/**
 * Helper to format the metric description, determine singular or plural noun,
 * and apply a custom formatter if needed.
 *
 * @param count - The numeric count for the metric.
 * @param singular - The singular noun for the metric (e.g. `"comment"`).
 * @param formatter - Optional custom formatter `(count, noun) => string`.
 * @returns The formatted description string, or `""` when `count` is falsy.
 */
export function formatMetricDescription(
  count: number,
  singular: string,
  formatter?: (count: number, noun: string) => string,
) {
  if (!count) {
    return '';
  }

  const noun = count === 1 || i18n.language === 'zh-Hans' ? singular : `${singular}s`;

  return formatter ? formatter(count, noun) : `${count} ${noun}`;
}
