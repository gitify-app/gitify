/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export enum InfluentsNotificationCategory {
  Direct = 'direct',
  Watching = 'watching'
}

export enum InfluentsNotificationReadState {
  Read = 'read',
  Unread = 'unread'
}

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { user:
      | { accountId: string, name: string, picture: string }
      | { accountId: string, name: string, picture: string }
      | { accountId: string, name: string, picture: string }
     | null } };

export type MyNotificationsQueryVariables = Exact<{
  readState?: InfluentsNotificationReadState | null | undefined;
  flat?: boolean | null | undefined;
  first?: number | null | undefined;
}>;


export type MyNotificationsQuery = { notifications: { unseenNotificationCount: number, notificationFeed: { pageInfo: { hasNextPage: boolean }, nodes: Array<{ groupId: string, groupSize: number, additionalActors: Array<{ displayName: string | null, avatarURL: string | null }>, headNotification: { notificationId: string, timestamp: string, readState: InfluentsNotificationReadState, category: InfluentsNotificationCategory, content: { type: string, message: string, url: string | null, entity: { title: string | null, iconUrl: string | null, url: string | null } | null, path: Array<{ title: string | null, iconUrl: string | null, url: string | null }> | null, actor: { displayName: string | null, avatarURL: string | null } }, analyticsAttributes: Array<{ key: string | null, value: string | null }> | null } }> } } | null };

export type AtlassianNotificationFragment = { groupId: string, groupSize: number, additionalActors: Array<{ displayName: string | null, avatarURL: string | null }>, headNotification: { notificationId: string, timestamp: string, readState: InfluentsNotificationReadState, category: InfluentsNotificationCategory, content: { type: string, message: string, url: string | null, entity: { title: string | null, iconUrl: string | null, url: string | null } | null, path: Array<{ title: string | null, iconUrl: string | null, url: string | null }> | null, actor: { displayName: string | null, avatarURL: string | null } }, analyticsAttributes: Array<{ key: string | null, value: string | null }> | null } };

export type MarkAsReadMutationVariables = Exact<{
  notificationIDs: Array<string> | string;
}>;


export type MarkAsReadMutation = { notifications: { markNotificationsByIdsAsRead: string | null } | null };

export type MarkAsUnreadMutationVariables = Exact<{
  notificationIDs: Array<string> | string;
}>;


export type MarkAsUnreadMutation = { notifications: { markNotificationsByIdsAsUnread: string | null } | null };

export type AtlassianHeadNotificationFragment = { notificationId: string, timestamp: string, readState: InfluentsNotificationReadState, category: InfluentsNotificationCategory, content: { type: string, message: string, url: string | null, entity: { title: string | null, iconUrl: string | null, url: string | null } | null, path: Array<{ title: string | null, iconUrl: string | null, url: string | null }> | null, actor: { displayName: string | null, avatarURL: string | null } }, analyticsAttributes: Array<{ key: string | null, value: string | null }> | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, unknown> | undefined;

  constructor(value: string, __meta__?: Record<string, unknown> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const AtlassianHeadNotificationFragmentDoc = new TypedDocumentString(`
    fragment AtlassianHeadNotification on InfluentsNotificationItem {
  notificationId
  timestamp
  readState
  category
  content {
    type
    message
    url
    entity {
      title
      iconUrl
      url
    }
    path {
      title
      iconUrl
      url
    }
    actor {
      displayName
      avatarURL
    }
  }
  analyticsAttributes {
    key
    value
  }
}
    `, {"fragmentName":"AtlassianHeadNotification"}) as unknown as TypedDocumentString<AtlassianHeadNotificationFragment, unknown>;
export const AtlassianNotificationFragmentDoc = new TypedDocumentString(`
    fragment AtlassianNotification on InfluentsNotificationHeadItem {
  groupId
  groupSize
  additionalActors {
    displayName
    avatarURL
  }
  headNotification {
    ...AtlassianHeadNotification
  }
}
    fragment AtlassianHeadNotification on InfluentsNotificationItem {
  notificationId
  timestamp
  readState
  category
  content {
    type
    message
    url
    entity {
      title
      iconUrl
      url
    }
    path {
      title
      iconUrl
      url
    }
    actor {
      displayName
      avatarURL
    }
  }
  analyticsAttributes {
    key
    value
  }
}`, {"fragmentName":"AtlassianNotification"}) as unknown as TypedDocumentString<AtlassianNotificationFragment, unknown>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    user {
      accountId
      name
      picture
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const MyNotificationsDocument = new TypedDocumentString(`
    query MyNotifications($readState: InfluentsNotificationReadState, $flat: Boolean = true, $first: Int) {
  notifications {
    unseenNotificationCount
    notificationFeed(
      flat: $flat
      first: $first
      filter: {readStateFilter: $readState}
    ) {
      pageInfo {
        hasNextPage
      }
      nodes {
        ...AtlassianNotification
      }
    }
  }
}
    fragment AtlassianNotification on InfluentsNotificationHeadItem {
  groupId
  groupSize
  additionalActors {
    displayName
    avatarURL
  }
  headNotification {
    ...AtlassianHeadNotification
  }
}
fragment AtlassianHeadNotification on InfluentsNotificationItem {
  notificationId
  timestamp
  readState
  category
  content {
    type
    message
    url
    entity {
      title
      iconUrl
      url
    }
    path {
      title
      iconUrl
      url
    }
    actor {
      displayName
      avatarURL
    }
  }
  analyticsAttributes {
    key
    value
  }
}`) as unknown as TypedDocumentString<MyNotificationsQuery, MyNotificationsQueryVariables>;
export const MarkAsReadDocument = new TypedDocumentString(`
    mutation MarkAsRead($notificationIDs: [String!]!) {
  notifications {
    markNotificationsByIdsAsRead(ids: $notificationIDs)
  }
}
    `) as unknown as TypedDocumentString<MarkAsReadMutation, MarkAsReadMutationVariables>;
export const MarkAsUnreadDocument = new TypedDocumentString(`
    mutation MarkAsUnread($notificationIDs: [String!]!) {
  notifications {
    markNotificationsByIdsAsUnread(ids: $notificationIDs)
  }
}
    `) as unknown as TypedDocumentString<MarkAsUnreadMutation, MarkAsUnreadMutationVariables>;
