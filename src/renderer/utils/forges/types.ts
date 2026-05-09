import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Account,
  Forge,
  Hostname,
  IconColor,
  Link,
  RawGitifyNotification,
  SettingsState,
  Token,
  UserType,
} from '../../types';

/**
 * Capability flags exposed by a forge adapter.
 *
 * Each capability is a function over the account because for some forges (e.g.
 * GitHub Enterprise Server) capabilities depend on the hostname and version.
 */
export interface ForgeCapabilities {
  /** Whether the forge supports a "mark as done" action distinct from "mark as read". */
  markAsDone(account: Account): boolean;
  /** Whether the forge supports ignoring a thread's subscription (unsubscribe). */
  unsubscribeThread(account: Account): boolean;
  /** Whether the forge surfaces an "answered" state for discussions. */
  answeredDiscussion(account: Account): boolean;
}

/**
 * Normalised account data returned by `fetchAuthenticatedUser`.
 *
 * Each adapter parses its native API response (REST headers, JSON body) and
 * returns this shared shape. Shared `refreshAccount` consumes this directly
 * without knowing about forge-specific transports.
 */
export interface RefreshAccountData {
  user: {
    id: string;
    login: string;
    name: string | null;
    avatar: string;
  };
  /** Forge instance version, if the forge advertises one (GHES). */
  version?: string;
  /** OAuth scope names attached to the token, if the forge has scopes. */
  scopes?: string[];
}

/**
 * Router state forwarded from a login method descriptor into the
 * destination route. Currently used to pre-select the forge when entering
 * the personal-access-token form.
 */
export interface LoginRouteState {
  forge?: Forge;
}

/**
 * Forge-agnostic display surface for a single notification. The adapter
 * computes these on demand for shared code (`formatters.ts`, `url.ts`) so
 * the format/UI layer never imports forge-specific dispatch.
 */
export interface NotificationDisplayHelpers {
  iconType: FC<OcticonProps>;
  iconColor: IconColor;
  defaultUrl: Link;
  defaultUserType: UserType;
}

/**
 * A login entry rendered in the Login route's forge section.
 */
export interface LoginMethodDescriptor {
  testId: string;
  icon: FC<OcticonProps>;
  label: string;
  variant?: 'primary' | 'default';
  /** Route to navigate to. */
  route: string;
  /** Optional router state to pass with navigation. */
  state?: LoginRouteState;
}

/**
 * The contract every forge adapter must implement.
 *
 * Goal: shared code (notifications orchestrator, hooks, UI) routes through
 * `getAdapter(account)` and never imports forge-specific modules directly.
 *
 * @see ./github/adapter.ts — full reference implementation (REST + GraphQL,
 *      enrichment, Octokit cache lifecycle).
 * @see ./gitea/adapter.ts — minimal implementation (no enrichment, no
 *      thread-subscription, fetch-only HTTP client).
 */
export interface ForgeAdapter {
  readonly id: Forge;
  /** User-facing forge name (e.g. "GitHub", "Gitea"). */
  readonly displayName: string;
  /** Short caption shown beside the forge name on the login screen. */
  readonly tagline?: string;
  /** Icon used for the platform in the UI. */
  readonly icon: FC<OcticonProps>;
  /** Static or computed capability matrix for this forge. */
  readonly capabilities: ForgeCapabilities;

  /** Fetch the authenticated user (used during login & on refresh). */
  fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData>;

  /**
   * Optional lifecycle hook called when an account's token rotates. Forges
   * with HTTP client caches (e.g. GitHub Octokit) drop their cache here.
   */
  onAccountTokenChange?(account: Account): void;

  /**
   * List notifications already transformed to the shared shape.
   * Returns `RawGitifyNotification[]` — `display` is populated later by the
   * orchestrator's `formatNotification` step.
   */
  listNotifications(account: Account, settings: SettingsState): Promise<RawGitifyNotification[]>;

  markThreadAsRead(account: Account, threadId: string): Promise<void>;
  markThreadAsDone(account: Account, threadId: string): Promise<void>;
  unsubscribeThread(account: Account, threadId: string): Promise<void>;

  /**
   * Enrich notifications with forge-specific subject details (state, user,
   * comment count, etc.). Optional — forges that do not support detailed
   * enrichment (e.g. Gitea) omit this and the orchestrator returns the input
   * unchanged.
   *
   * @see ../notifications/notifications.ts `enrichNotifications` — orchestrator
   *      that delegates here when the user has detailed notifications enabled.
   */
  enrichNotifications?(
    notifications: RawGitifyNotification[],
    settings: SettingsState,
  ): Promise<RawGitifyNotification[]>;

  /**
   * GET an arbitrary forge URL and return JSON. Used by notification
   * handlers to follow subject/comment URLs.
   */
  followUrl<T>(account: Account, url: Link): Promise<T>;

  /**
   * Return the display-surface values (icon, color, default url, default user
   * type) for a notification. Adapter-internal dispatch keeps shared
   * formatting code (`formatters.ts`, `url.ts`) forge-agnostic.
   */
  getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers;

  // --- Login & token UX ---

  /** Default hostname pre-filled in the PAT login form. */
  defaultHostname?: Hostname;
  /** Whether the supplied token matches the forge's PAT format. */
  validateToken(token: Token): boolean;
  /** URL to manage/create a personal access token on the forge. */
  getPersonalAccessTokenSettingsUrl(hostname: Hostname): Link;
  /** URL to the developer settings page for the account's auth method. */
  getDeveloperSettingsUrl(account: Account): Link;
  /** Login entries rendered in the Login route. */
  loginMethods: ReadonlyArray<LoginMethodDescriptor>;
  /** External documentation link shown in the PAT login route. */
  documentationUrl: Link;

  // --- OAuth scopes ---
  // Forges without an OAuth scope concept (e.g. Gitea) report `true` for
  // every check, signalling "nothing to verify".

  /**
   * Whether this forge has an OAuth scope concept at all. Drives whether the
   * UI surfaces a scopes affordance (account view scopes, scope health icon).
   * Forges that return `false` here should have callers skip rendering any
   * scopes UI rather than showing a meaningless "all granted" or empty state.
   */
  readonly supportsOAuthScopes: boolean;
  /** Whether the account holds the minimum scopes Gitify needs to function. */
  hasRequiredScopes(account: Account): boolean;
  /** Whether the account holds the full recommended scope set. */
  hasRecommendedScopes(account: Account): boolean;
  /** Whether the account holds the alternate (legacy) scope set. */
  hasAlternateScopes(account: Account): boolean;
}
