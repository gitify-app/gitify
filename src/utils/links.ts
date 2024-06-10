import type { Account } from '../types';
import type { Notification, Repository, SubjectUser } from '../typesGitHub';
import { getDeveloperSettingsURL } from './auth/utils';
import { openExternalLink } from './comms';
import Constants from './constants';
import { generateGitHubWebUrl } from './helpers';

export function openGitifyRepository() {
  openExternalLink(`https://github.com/${Constants.REPO_SLUG}`);
}

export function openGitifyReleaseNotes(version: string) {
  openExternalLink(
    `https://github.com/${Constants.REPO_SLUG}/releases/tag/v${version}`,
  );
}

export function openGitHubNotifications() {
  openExternalLink('https://github.com/notifications');
}

export function openAccountProfile(account: Account) {
  const url = new URL(`https://${account.hostname}`);
  url.pathname = account.user.login;
  openExternalLink(url.toString());
}

export function openUserProfile(user: SubjectUser) {
  openExternalLink(user.html_url);
}

export function openHost(hostname: string) {
  openExternalLink(`https://${hostname}`);
}

export function openDeveloperSettings(account: Account) {
  const url = getDeveloperSettingsURL(account);
  openExternalLink(url);
}

export function openRepository(repository: Repository) {
  openExternalLink(repository.html_url);
}

export async function openNotification(notification: Notification) {
  const url = await generateGitHubWebUrl(notification);
  openExternalLink(url);
}

export function openGitHubParticipatingDocs() {
  openExternalLink(Constants.GITHUB_DOCS.PARTICIPATING_URL);
}
