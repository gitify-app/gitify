import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification, SubjectType } from '../../../typesGitHub';
import type { Filter } from './types';

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

  hasFilters(settings: SettingsState) {
    return settings.filterSubjectTypes.length > 0;
  },

  isFilterSet(settings: SettingsState, subjectType: SubjectType) {
    return settings.filterSubjectTypes.includes(subjectType);
  },

  getFilterCount(
    notifications: AccountNotifications[],
    subjectType: SubjectType,
  ) {
    return notifications.reduce(
      (sum, account) =>
        sum +
        account.notifications.filter((n) =>
          this.filterNotification(n, subjectType),
        ).length,
      0,
    );
  },

  filterNotification(
    notification: Notification,
    subjectType: SubjectType,
  ): boolean {
    return notification.subject.type === subjectType;
  },
};
