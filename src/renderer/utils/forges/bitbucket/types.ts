import type { AtlassianNotificationFragment } from './graphql/generated/graphql';

export type { AtlassianNotificationFragment };

/** The product string returned in analyticsAttributes for Bitbucket notifications. */
export const BITBUCKET_REGISTRATION_PRODUCT = 'bitbucket';

/** Atlassian GraphQL gateway endpoint. */
export const ATLASSIAN_GRAPHQL_URL = 'https://api.atlassian.com/graphql' as const;

/** Maximum number of notifications to request per poll. */
export const MAX_NOTIFICATIONS = 200 as const;
