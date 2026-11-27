import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  GitifyIssueStatusKind,
  IssueStatusFilterValue,
  RawGitifyNotification,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import i18n from '../../../i18n';

/**
 * Classify a notification as exactly one issue status filter bucket.
 *
 * Notifications without a recognized issue status, including pull requests
 * and unknown future statuses, map to the catch-all `other` bucket.
 */
function mapIssueStatusToFilter(
  kind: GitifyIssueStatusKind | null | undefined,
): IssueStatusFilterValue {
  switch (kind) {
    case 'backlog':
    case 'todo':
    case 'in_progress':
    case 'in_review':
    case 'done':
    case 'not_planned':
    case 'duplicate':
      return kind;
    default:
      return 'other';
  }
}

export const issueStatusFilter: Filter<IssueStatusFilterValue> = {
  get FILTER_TYPES(): Record<IssueStatusFilterValue, TypeDetails> {
    return {
      backlog: {
        title: i18n.t('filters.issue_status.backlog', 'Backlog'),
        description: i18n.t(
          'filters.issue_status.backlog_description',
          'Open issues waiting to be planned.',
        ),
      },
      todo: {
        title: i18n.t('filters.issue_status.todo', 'Todo'),
        description: i18n.t('filters.issue_status.todo_description', 'Open issues ready to start.'),
      },
      in_progress: {
        title: i18n.t('filters.issue_status.in_progress', 'In progress'),
        description: i18n.t(
          'filters.issue_status.in_progress_description',
          'Open issues with work underway.',
        ),
      },
      in_review: {
        title: i18n.t('filters.issue_status.in_review', 'In review'),
        description: i18n.t(
          'filters.issue_status.in_review_description',
          'Open issues with a pull request ready for review.',
        ),
      },
      done: {
        title: i18n.t('filters.issue_status.done', 'Done'),
        description: i18n.t('filters.issue_status.done_description', 'Issues closed as completed.'),
      },
      not_planned: {
        title: i18n.t('filters.issue_status.not_planned', 'Not planned'),
        description: i18n.t(
          'filters.issue_status.not_planned_description',
          'Issues closed without completing the work.',
        ),
      },
      duplicate: {
        title: i18n.t('filters.issue_status.duplicate', 'Duplicate'),
        description: i18n.t(
          'filters.issue_status.duplicate_description',
          'Issues closed as duplicates of another issue.',
        ),
      },
      other: {
        title: i18n.t('filters.issue_status.other', 'Other'),
        description: i18n.t(
          'filters.issue_status.other_description',
          'Notifications without an issue status.',
        ),
      },
    };
  },

  requiresDetailsNotifications: true,
  preserveFilterOrder: true,

  getTypeDetails(statusType: IssueStatusFilterValue): TypeDetails {
    return this.FILTER_TYPES[statusType];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.issueStatuses.length > 0;
  },

  isFilterSet(statusType: IssueStatusFilterValue): boolean {
    const filters = useFiltersStore.getState();
    return filters.issueStatuses.includes(statusType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    statusType: IssueStatusFilterValue,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.classify(n) === statusType).length,
      0,
    );
  },

  filterNotification(
    notification: RawGitifyNotification,
    statusType: IssueStatusFilterValue,
  ): boolean {
    return mapIssueStatusToFilter(notification.subject?.issueStatus?.kind) === statusType;
  },

  classify(notification: RawGitifyNotification): IssueStatusFilterValue {
    return mapIssueStatusToFilter(notification.subject?.issueStatus?.kind);
  },
};
