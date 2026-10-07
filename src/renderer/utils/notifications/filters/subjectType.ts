import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  RawGitifyNotification,
  SubjectType,
  SubjectTypeFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

const SUBJECT_TYPE_DETAILS: Record<SubjectTypeFilterValue, TypeDetails> = {
  AgentSessionThread: {
    title: 'Agent Session Thread',
  },
  BitbucketNotification: {
    title: 'Bitbucket',
  },
  CheckSuite: {
    title: 'Check Suite',
  },
  Commit: {
    title: 'Commit',
  },
  Discussion: {
    title: 'Discussion',
  },
  GitLabTodo: {
    title: 'GitLab To-Do',
  },
  Issue: {
    title: 'Issue',
  },
  PullRequest: {
    title: 'Pull Request',
  },
  Release: {
    title: 'Release',
  },
  RepositoryAdvisory: {
    title: 'Advisory',
  },
  RepositoryDependabotAlertsThread: {
    title: 'Dependabot Alert',
  },
  RepositoryInvitation: {
    title: 'Invitation',
  },
  RepositoryVulnerabilityAlert: {
    title: 'Vulnerability Alert',
  },
  WorkflowRun: {
    title: 'Workflow Run',
  },
  other: {
    title: 'Other',
    description: 'Notifications of a type that is not listed above.',
  },
};

export const subjectTypeFilter: Filter<SubjectTypeFilterValue> = {
  FILTER_TYPES: SUBJECT_TYPE_DETAILS,

  requiresDetailsNotifications: false,

  getTypeDetails(subjectType: SubjectTypeFilterValue): TypeDetails {
    return this.FILTER_TYPES[subjectType];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.subjectTypes.length > 0;
  },

  isFilterSet(subjectType: SubjectTypeFilterValue): boolean {
    const filters = useFiltersStore.getState();
    return filters.subjectTypes.includes(subjectType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    subjectType: SubjectTypeFilterValue,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.classify(n) === subjectType).length,
      0,
    );
  },

  filterNotification(
    notification: RawGitifyNotification,
    subjectType: SubjectTypeFilterValue,
  ): boolean {
    if (subjectType === 'other') {
      return !(notification.subject.type in SUBJECT_TYPE_DETAILS);
    }
    return notification.subject.type === subjectType;
  },

  classify(notification: RawGitifyNotification): SubjectTypeFilterValue {
    return notification.subject.type in SUBJECT_TYPE_DETAILS
      ? (notification.subject.type as SubjectType)
      : 'other';
  },
};
