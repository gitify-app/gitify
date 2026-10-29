import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  RawGitifyNotification,
  SubjectType,
  SubjectTypeFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import i18n from '../../../i18n';

export const subjectTypeFilter: Filter<SubjectTypeFilterValue> = {
  get FILTER_TYPES(): Record<SubjectTypeFilterValue, TypeDetails> {
    return {
      AgentSessionThread: {
        title: i18n.t('filters.subject_type.agent_session_thread', 'Agent Session Thread'),
      },
      BitbucketNotification: {
        title: i18n.t('filters.subject_type.bitbucket', 'Bitbucket'),
      },
      CheckSuite: {
        title: i18n.t('filters.subject_type.check_suite', 'Check Suite'),
      },
      Commit: {
        title: i18n.t('filters.subject_type.commit', 'Commit'),
      },
      Discussion: {
        title: i18n.t('filters.subject_type.discussion', 'Discussion'),
      },
      GitLabTodo: {
        title: i18n.t('filters.subject_type.gitlab_todo', 'GitLab To-Do'),
      },
      Issue: {
        title: i18n.t('filters.subject_type.issue', 'Issue'),
      },
      PullRequest: {
        title: i18n.t('filters.subject_type.pull_request', 'Pull Request'),
      },
      Release: {
        title: i18n.t('filters.subject_type.release', 'Release'),
      },
      RepositoryAdvisory: {
        title: i18n.t('filters.subject_type.advisory', 'Advisory'),
      },
      RepositoryDependabotAlertsThread: {
        title: i18n.t('filters.subject_type.dependabot_alert', 'Dependabot Alert'),
      },
      RepositoryInvitation: {
        title: i18n.t('filters.subject_type.invitation', 'Invitation'),
      },
      RepositoryVulnerabilityAlert: {
        title: i18n.t('filters.subject_type.vulnerability_alert', 'Vulnerability Alert'),
      },
      WorkflowRun: {
        title: i18n.t('filters.subject_type.workflow_run', 'Workflow Run'),
      },
      other: {
        title: i18n.t('filters.subject_type.other', 'Other'),
        description: i18n.t('filters.subject_type.other_description', 'A type not listed above.'),
      },
    };
  },

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
      return !(notification.subject.type in this.FILTER_TYPES);
    }
    return notification.subject.type === subjectType;
  },

  classify(notification: RawGitifyNotification): SubjectTypeFilterValue {
    return notification.subject.type in this.FILTER_TYPES
      ? (notification.subject.type as SubjectType)
      : 'other';
  },
};
