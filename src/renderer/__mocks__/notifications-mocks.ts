import { Constants } from '../constants';
import type { Hostname } from '../types';
import type {
  Notification,
  Repository,
  StateType,
  Subject,
  SubjectType,
} from '../typesGitHub';
import { mockGitHubCloudAccount } from './account-mocks';
import { mockToken } from './state-mocks';
import { mockGitifyUser } from './user-mocks';

export function createMockSubject(mocks: {
  title?: string;
  type?: SubjectType;
  state?: StateType;
}): Subject {
  return {
    title: mocks.title ?? 'Mock Subject',
    type: mocks.type ?? ('Unknown' as SubjectType),
    state: mocks.state ?? ('Unknown' as StateType),
    url: null,
    latest_comment_url: null,
  };
}

export function createPartialMockNotification(
  subject: Partial<Subject>,
  repository?: Partial<Repository>,
): Notification {
  const mockNotification: Partial<Notification> = {
    account: {
      method: 'Personal Access Token',
      platform: 'GitHub Cloud',
      hostname: Constants.GITHUB_API_BASE_URL as Hostname,
      token: mockToken,
      user: mockGitifyUser,
      hasRequiredScopes: true,
    },
    subject: subject as Subject,
    repository: repository as Repository,
  };

  return mockNotification as Notification;
}

export function createMockNotificationForRepoName(
  id: string,
  repoFullName: string | null,
): Notification {
  return {
    id,
    repository: repoFullName ? { full_name: repoFullName } : null,
    account: mockGitHubCloudAccount,
  } as Notification;
}
