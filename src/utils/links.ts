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

export function openGitHubNotifications() {
  openExternalLink('https://github.com/notifications' as Link);
}

export function openGitHubIssues() {
  openExternalLink('https://github.com/issues' as Link);
}

export function openGitHubPulls() {
  openExternalLink('https://github.com/pulls' as Link);
}

export function openAccountProfile(account: Account) {
  const url = new URL(`https://${account.hostname}`);
  url.pathname = account.user.login;
  openExternalLink(url.toString() as Link);
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

export async function openNotification(
  notification: Notification,
  withReferer = true,
) {
  const url = await generateGitHubWebUrl(notification, withReferer);
  openExternalLink(url);
}

export function openGitHubParticipatingDocs() {
  openExternalLink(Constants.GITHUB_DOCS.PARTICIPATING_URL);
}
