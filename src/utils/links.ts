import type { Account, Hostname, Link } from '../types';
import type { Notification, Repository, SubjectUser } from '../typesGitHub';
import { getDeveloperSettingsURL } from './auth/utils';
import { openExternalLink } from './comms';
import Constants from './constants';
import { generateGitHubWebUrl } from './helpers';

export function openGitifyRepository() {
  openExternalLink(`https://github.com/${Constants.REPO_SLUG}` as Link);
}

export function openGitifyReleaseNotes(version: string) {
  openExternalLink(
    `https://github.com/${Constants.REPO_SLUG}/releases/tag/${version}` as Link,
  );
}

export function openGitHubNotifications(hostname: Hostname) {
  const url = new URL(`https://${hostname}`);
  url.pathname = 'notifications';
  openExternalLink(url.toString() as Link);
}

export function openGitHubIssues(hostname: Hostname) {
  const url = new URL(`https://${hostname}`);
  url.pathname = 'issues';
  openExternalLink(url.toString() as Link);
}

export function openGitHubPulls(hostname: Hostname) {
  const url = new URL(`https://${hostname}`);
  url.pathname = 'pulls';
  openExternalLink(url.toString() as Link);
}

export function openBitbucketPulls(account: Account) {
  const url = new URL(
    `${account.hostname.replace('api.bitbucket.org/internal/workspaces', 'bitbucket.org')}/workspace/pull-requests/?user_filter=ALL&author=${account.user.id}`,
  );
  openExternalLink(url.toString() as Link);
}

export function openAccountProfile(account: Account) {
  if (account.platform === 'Bitbucket Cloud') {
    openExternalLink('https://bitbucket.org/account/settings/' as Link);
  } else {
    const url = new URL(`https://${account.hostname}`);
    url.pathname = account.user.login;
    openExternalLink(url.toString() as Link);
  }
}

export function openUserProfile(user: SubjectUser) {
  openExternalLink(user.html_url);
}

export function openHost(hostname: Hostname) {
  openExternalLink(`https://${hostname}` as Link);
}

export function openDeveloperSettings(account: Account) {
  const url = getDeveloperSettingsURL(account);
  openExternalLink(url);
}

export function openRepository(repository: Repository) {
  openExternalLink(repository.html_url);
}

export async function openNotification(notification: Notification) {
  let url = '' as Link;
  if (notification.account.platform === 'Bitbucket Cloud') {
    url = notification.url;
  } else {
    url = await generateGitHubWebUrl(notification);
  }

  openExternalLink(url);
}

export function openGitHubParticipatingDocs() {
  openExternalLink(Constants.GITHUB_DOCS.PARTICIPATING_URL);
}
