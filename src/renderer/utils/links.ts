import { APPLICATION } from '../../shared/constants';

import { Constants } from '../constants';

import type {
  Account,
  GitifyNotification,
  GitifyNotificationUser,
  GitifyRepository,
  Hostname,
  Link,
} from '../types';

import { getDeveloperSettingsURL } from './auth/utils';
import { openExternalLink } from './comms';
import { generateGitHubWebUrl } from './helpers';

export function openGitifyReleaseNotes(version: string) {
  openExternalLink(
    `https://github.com/${APPLICATION.REPO_SLUG}/releases/tag/${version}` as Link,
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

export function openAccountProfile(account: Account) {
  const url = new URL(`https://${account.hostname}`);
  url.pathname = account.user.login;
  openExternalLink(url.toString() as Link);
}

export function openUserProfile(user: GitifyNotificationUser) {
  openExternalLink(user.htmlUrl);
}

export function openHost(hostname: Hostname) {
  openExternalLink(`https://${hostname}` as Link);
}

export function openDeveloperSettings(account: Account) {
  const url = getDeveloperSettingsURL(account);
  openExternalLink(url);
}

export function openRepository(repository: GitifyRepository) {
  openExternalLink(repository.htmlUrl);
}

export async function openNotification(notification: GitifyNotification) {
  const url = await generateGitHubWebUrl(notification);
  openExternalLink(url);
}

export function openGitHubParticipatingDocs() {
  openExternalLink(Constants.GITHUB_DOCS.PARTICIPATING_URL);
}
