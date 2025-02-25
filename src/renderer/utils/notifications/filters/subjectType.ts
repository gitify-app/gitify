import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification, SubjectType } from '../../../typesGitHub';

export const FILTERS_SUBJECT_TYPES: Record<SubjectType, TypeDetails> = {
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

export function getSubjectTypeDetails(subjectType: SubjectType): TypeDetails {
  return FILTERS_SUBJECT_TYPES[subjectType];
}

export function hasSubjectTypeFilters(settings: SettingsState) {
  return settings.filterSubjectTypes.length > 0;
}

export function isSubjectTypeFilterSet(
  settings: SettingsState,
  subjectType: SubjectType,
) {
  return settings.filterSubjectTypes.includes(subjectType);
}

export function getSubjectTypeFilterCount(
  notifications: AccountNotifications[],
  subjectType: SubjectType,
) {
  return notifications.reduce(
    (sum, account) =>
      sum +
      account.notifications.filter((n) =>
        filterNotificationBySubjectType(n, subjectType),
      ).length,
    0,
  );
}

export function filterNotificationBySubjectType(
  notification: Notification,
  subjectType: SubjectType,
): boolean {
  return notification.subject.type === subjectType;
}
