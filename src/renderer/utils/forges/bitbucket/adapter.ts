import { KeyIcon } from '@primer/octicons-react';

import useSettingsStore from '../../../stores/useSettingsStore';

import type { Account, Hostname, Link, RawGitifyNotification } from '../../../types';
import { IconColor } from '../../../types';
import type {
  ForgeAdapter,
  ForgeCapabilities,
  NotificationDisplayHelpers,
  RefreshAccountData,
} from '../types';

import { decryptValue } from '../../system/comms';
import {
  fetchBitbucketAuthenticatedUser,
  listRawBitbucketNotifications,
  markBitbucketNotificationsAsRead,
} from './client';
import { transformBitbucketNotifications } from './transform';

const BITBUCKET_DOCS_URL =
  'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/' as Link;

const ATLASSIAN_TOKEN_SETTINGS_URL =
  'https://id.atlassian.com/manage-profile/security/api-tokens' as Link;

const capabilities: ForgeCapabilities = {
  markAsDone: () => false,
  unsubscribeThread: () => false,
};

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  const data = await fetchBitbucketAuthenticatedUser(account);
  const user = data.me?.user;

  if (!user) {
    throw new Error('Failed to retrieve Bitbucket authenticated user.');
  }

  return {
    user: {
      id: user.accountId,
      login: account.username ?? user.accountId,
      name: user.name ?? null,
      avatar: user.picture ?? '',
    },
  };
}

async function listNotifications(account: Account): Promise<RawGitifyNotification[]> {
  const { fetchReadNotifications } = useSettingsStore.getState();
  const fetchOnlyUnread = !fetchReadNotifications;
  const raw = await listRawBitbucketNotifications(account, fetchOnlyUnread);
  return transformBitbucketNotifications(raw, account);
}

function getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers {
  return {
    iconType: KeyIcon,
    iconColor: IconColor.GRAY,
    defaultUrl: notification.subject.url ?? ('' as Link),
    defaultUserType: 'User',
  };
}

async function followUrl<T>(account: Account, url: Link): Promise<T> {
  const { token } = await decryptValue(account.token);
  const credentials = btoa(`${account.username}:${token}`);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Bitbucket fetch error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const bitbucketAdapter: ForgeAdapter = {
  id: 'bitbucket',
  displayName: 'Bitbucket',
  tagline: 'Bitbucket Cloud',
  icon: KeyIcon,
  capabilities,

  fetchAuthenticatedUser,
  listNotifications,

  markThreadAsRead: async (account, threadId) => {
    await markBitbucketNotificationsAsRead(account, [threadId]);
  },
  markThreadAsDone: () => {
    throw new Error(
      'Mark-as-done is not supported for Bitbucket; check capabilities.markAsDone before calling.',
    );
  },
  unsubscribeThread: () => {
    throw new Error(
      'Unsubscribing threads is not supported for Bitbucket; check capabilities.unsubscribeThread before calling.',
    );
  },

  followUrl,
  getDisplayHelpers,

  defaultHostname: 'bitbucket.org' as Hostname,

  validateToken: (token) => token.length > 0,

  getPersonalAccessTokenSettingsUrl: (_hostname: Hostname) => ATLASSIAN_TOKEN_SETTINGS_URL,

  getAccountSettingsUrl: (_account: Account) => ATLASSIAN_TOKEN_SETTINGS_URL,

  documentationUrl: BITBUCKET_DOCS_URL,

  getAuthMethodIcon: () => KeyIcon,

  loginMethods: [
    {
      testId: 'login-bitbucket-pat',
      icon: KeyIcon,
      label: 'Atlassian API Token',
      route: '/login/bitbucket/personal-access-token',
      authMethod: 'Personal Access Token',
    },
  ],
};
