import type { Account, GitifyNotificationUser } from '../../../types';

// Overrides: app slugs treated as AI rather than a plain bot, plus display-name
const AI_APP_SLUGS = new Set(['copilot-pull-request-reviewer']);

// Overrides for app slugs where the slug itself is not a friendly label.
const APP_DISPLAY_NAMES: Record<string, string> = {
  'copilot-pull-request-reviewer': 'copilot',
};

export function formatGitHubNotificationUser(
  account: Account,
  user: GitifyNotificationUser,
): string {
  if (user.type === 'Bot') {
    return formatGitHubBotUser(user);
  }

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

function formatGitHubBotUser(user: GitifyNotificationUser): string {
  try {
    const pathname = new URL(user.htmlUrl).pathname;
    const match = /^\/apps\/([^/]+)\/?$/.exec(pathname);
    if (!match) {
      return user.login;
    }

    const appSlug = match[1].toLowerCase();
    const displayName = APP_DISPLAY_NAMES[appSlug] ?? match[1];
    const userType = AI_APP_SLUGS.has(appSlug) ? 'ai' : 'bot';
    return `${displayName}[${userType}]`;
  } catch {
    return user.login;
  }
}
