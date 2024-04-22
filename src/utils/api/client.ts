import type { Axios, AxiosPromise } from 'axios';
import type { SettingsState } from '../../types';
import type {
  NotificationThreadSubscription,
  RootHypermediaLinks,
  UserDetails,
} from '../../typesGithub';
import { getGitHubAPIBaseUrl } from '../helpers';
import { apiRequestAuth } from './request';

export function getRootHypermediaLinks(
  hostname: string,
  token: string,
): AxiosPromise<RootHypermediaLinks> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(baseUrl);
  return apiRequestAuth(url.toString(), 'GET', token);
}

export function getAuthenticatedUser(
  hostname: string,
  token: string,
): AxiosPromise<UserDetails> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/user`);
  return apiRequestAuth(url.toString(), 'GET', token);
}

export function headNotifications(
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications`);
  return apiRequestAuth(url.toString(), 'HEAD', token);
}

export function listNotificationsForAuthenticatedUser(
  hostname: string,
  token: string,
  settings: SettingsState,
): AxiosPromise<Notification[]> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications`);
  url.searchParams.append('participating', String(settings.participating));

  return apiRequestAuth(url.toString(), 'GET', token);
}

export function markNotificationThreadAsRead(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications/threads/${threadId}`);
  return apiRequestAuth(url.toString(), 'PATCH', token, {});
}

export function markNotificationThreadAsDone(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications/threads/${threadId}`);
  return apiRequestAuth(url.toString(), 'DELETE', token, {});
}

export function ignoreNotificationThreadSubscription(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<NotificationThreadSubscription> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(
    `${baseUrl}/notifications/threads/${threadId}/subscriptions`,
  );
  return apiRequestAuth(url.toString(), 'PUT', token, { ignored: true });
}

export function markRepositoryNotificationsAsRead(
  repoSlug: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/repos/${repoSlug}/notifications`);
  return apiRequestAuth(url.toString(), 'PUT', token, {});
}
