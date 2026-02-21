import type {
  AccountNotifications,
  GitifyNotification,
  SubjectType,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import useFiltersStore from '../../../stores/useFiltersStore';

const SUBJECT_TYPE_DETAILS: Record<SubjectType, TypeDetails> = {
  CheckSuite: {
    title: 'Check Suite',
  },
  Commit: {
    title: 'Commit',
  },
  Discussion: {
    title: 'Discussion',
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
};

export const subjectTypeFilter: Filter<SubjectType> = {
  FILTER_TYPES: SUBJECT_TYPE_DETAILS,

  requiresDetailsNotifications: false,

  getTypeDetails(subjectType: SubjectType): TypeDetails {
    return this.FILTER_TYPES[subjectType];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.subjectTypes.length > 0;
  },

  isFilterSet(subjectType: SubjectType): boolean {
    const filters = useFiltersStore.getState();
    return filters.subjectTypes.includes(subjectType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    subjectType: SubjectType,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum +
        account.notifications.filter((n) =>
          this.filterNotification(n, subjectType),
        ).length,
      0,
    );
  },

  filterNotification(
    notification: GitifyNotification,
    subjectType: SubjectType,
  ): boolean {
    return notification.subject.type === subjectType;
  },
};
