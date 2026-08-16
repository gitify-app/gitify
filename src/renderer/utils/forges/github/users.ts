import type { GitifyNotificationUser } from '../../../types';

const AI_APP_SLUGS = new Set(['copilot-pull-request-reviewer']);
const APP_DISPLAY_NAMES: Record<string, string> = {
  'copilot-pull-request-reviewer': 'copilot',
};

export function formatGitHubNotificationUser(user: GitifyNotificationUser): string {
  if (user.type !== 'Bot') {
    return user.login;
  }

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
