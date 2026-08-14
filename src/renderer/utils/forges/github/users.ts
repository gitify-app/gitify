import type { Account, GitifyNotificationUser } from '../../../types';

export function formatGitHubNotificationUser(
  account: Account,
  user: GitifyNotificationUser,
): string {
  const name = user.name?.trim();
  if (!name) {
    return user.login;
  }

  const managedUserSuffix = account.user?.login.match(/(_[^_]+)$/)?.[1];
  const isManagedUser =
    user.type === 'EnterpriseUserAccount' ||
    (managedUserSuffix !== undefined && user.login.endsWith(managedUserSuffix));

  return isManagedUser ? `${name} (${user.login})` : user.login;
}
