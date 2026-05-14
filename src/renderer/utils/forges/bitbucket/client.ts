import type { Account } from '../../../types';
import {
  ATLASSIAN_GRAPHQL_URL,
  type AtlassianNotificationFragment,
  BITBUCKET_REGISTRATION_PRODUCT,
  MAX_NOTIFICATIONS,
} from './types';

import { decryptValue } from '../../system/comms';
import type {
  MarkAsReadMutation,
  MarkAsReadMutationVariables,
  MarkAsUnreadMutation,
  MarkAsUnreadMutationVariables,
  MeQuery,
  MeQueryVariables,
  MyNotificationsQuery,
  MyNotificationsQueryVariables,
  TypedDocumentString,
} from './graphql/generated/graphql';
import {
  InfluentsNotificationReadState,
  MarkAsReadDocument,
  MarkAsUnreadDocument,
  MeDocument,
  MyNotificationsDocument,
} from './graphql/generated/graphql';

async function buildAuthHeaders(account: Account): Promise<HeadersInit> {
  const { token } = await decryptValue(account.token);
  const credentials = btoa(`${account.username}:${token}`);
  return {
    Accept: 'application/json',
    Authorization: `Basic ${credentials}`,
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };
}

async function performAtlassianRequest<TResult, TVariables>(
  account: Account,
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const headers = await buildAuthHeaders(account);

  const response = await fetch(ATLASSIAN_GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: query.toString(),
      variables: variables ?? {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Atlassian API ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { data: TResult; errors?: unknown[] };

  if (json.errors?.length) {
    throw new Error(`Atlassian GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

export async function fetchBitbucketAuthenticatedUser(account: Account): Promise<MeQuery> {
  return performAtlassianRequest<MeQuery, MeQueryVariables>(account, MeDocument);
}

export async function listRawBitbucketNotifications(
  account: Account,
  fetchOnlyUnread = true,
): Promise<AtlassianNotificationFragment[]> {
  const readState = fetchOnlyUnread ? InfluentsNotificationReadState.Unread : undefined;

  const data = await performAtlassianRequest<MyNotificationsQuery, MyNotificationsQueryVariables>(
    account,
    MyNotificationsDocument,
    {
      first: MAX_NOTIFICATIONS,
      flat: true,
      readState,
    },
  );

  const nodes = data.notifications?.notificationFeed?.nodes ?? [];

  return nodes.filter((node) => {
    const registrationProduct = node.headNotification.analyticsAttributes
      ?.find((attr) => attr.key === 'registrationProduct')
      ?.value?.toLowerCase();
    return registrationProduct === BITBUCKET_REGISTRATION_PRODUCT;
  });
}

export async function markBitbucketNotificationsAsRead(
  account: Account,
  notificationIds: string[],
): Promise<void> {
  await performAtlassianRequest<MarkAsReadMutation, MarkAsReadMutationVariables>(
    account,
    MarkAsReadDocument,
    { notificationIDs: notificationIds },
  );
}

export async function markBitbucketNotificationsAsUnread(
  account: Account,
  notificationIds: string[],
): Promise<void> {
  await performAtlassianRequest<MarkAsUnreadMutation, MarkAsUnreadMutationVariables>(
    account,
    MarkAsUnreadDocument,
    { notificationIDs: notificationIds },
  );
}
