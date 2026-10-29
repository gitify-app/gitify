import type { RawGitifyNotification, SubjectType } from '../../types';

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
 * Labels for subject types whose camel-case split reads wrong. `GitLabTodo`
 * would otherwise render as "Git Lab Todo", because the split fires inside the
 * brand name.
 */
const SUBJECT_TYPE_LABELS: Partial<Record<SubjectType, string>> = {
  GitLabTodo: 'GitLab To-Do',
};

/**
 * Return the formatted notification type for this notification.
 *
 * @param notification - The notification whose type to format.
 * @returns A human-readable type string (e.g. "Open Pull Request").
 */
export function formatNotificationType(notification: RawGitifyNotification): string {
  const { state, type } = notification.subject;
  const override = SUBJECT_TYPE_LABELS[type];

  if (!override) {
    return formatForDisplay([state ?? '', type]);
  }

  const prefix = formatForDisplay([state ?? '']);
  return prefix ? `${prefix} ${override}` : override;
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

  const noun = count === 1 ? singular : `${singular}s`;

  return formatter ? formatter(count, noun) : `${count} ${noun}`;
}
