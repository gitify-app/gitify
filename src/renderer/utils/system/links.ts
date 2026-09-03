import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import type {
  Account,
  GitifyNotification,
  GitifyNotificationUser,
  GitifyRepository,
  Hostname,
  Link,
} from '../../types';

import { getAccountAdapter } from '../forges/registry';
import { generateNotificationWebUrl } from '../notifications/url';
import { openExternalLink } from './comms';

export function openGitifyReleaseNotes(version: string) {
  openExternalLink(
    `${APPLICATION.GITHUB_BASE_URL}/${APPLICATION.REPO_SLUG}/releases/tag/${version}` as Link,
  );
}

export function openHostNotifications(account: Account) {
  openExternalLink(getAccountAdapter(account).getNotificationsUrl());
}

export function openHostIssues(account: Account) {
  openExternalLink(getAccountAdapter(account).getIssuesUrl());
}

export function openHostPulls(account: Account) {
  openExternalLink(getAccountAdapter(account).getPullRequestsUrl());
}

export function openAccountProfile(account: Account) {
  const url = new URL(`https://${account.hostname}`);
  url.pathname = account.user!.login;
  openExternalLink(url.toString() as Link);
}

export function openUserProfile(user: GitifyNotificationUser) {
  openExternalLink(user.htmlUrl);
}

export function openHost(hostname: Hostname) {
  openExternalLink(`https://${hostname}` as Link);
}

export function openAccountSettings(account: Account) {
  const url = getAccountAdapter(account).getAccountSettingsUrl();
  openExternalLink(url);
}

export function openRepository(repository: GitifyRepository) {
  openExternalLink(repository.htmlUrl);
}

export async function openNotification(notification: GitifyNotification) {
  const url = await generateNotificationWebUrl(notification);
  openExternalLink(url);
}

export function openGitHubParticipatingDocs() {
  openExternalLink(Constants.GITHUB_DOCS.PARTICIPATING_URL);
}
