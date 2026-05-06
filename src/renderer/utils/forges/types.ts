import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Account,
  Forge,
  GitifyNotification,
  Hostname,
  Link,
  SettingsState,
  Token,
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
 * Refreshed account data returned by `fetchAuthenticatedUser`.
 *
 * Uses the snake_case shape produced by the GitHub REST API so the existing
 * GitHub-side `refreshAccount` logic continues to work unmodified. Other
 * adapters map their native response into this shape.
 */
export interface RefreshAccountData {
  data: {
    id: string | number;
    login: string;
    name?: string | null;
    avatar_url?: string;
  };
  headers: Record<string, string | undefined>;
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
  state?: Record<string, unknown>;
}

/**
 * The contract every forge adapter must implement.
 *
 * Goal: shared code (notifications orchestrator, hooks, UI) routes through
 * `getAdapter(account)` and never imports forge-specific modules directly.
 */
export interface ForgeAdapter {
  readonly id: Forge;
  /** User-facing forge name (e.g. "GitHub", "Gitea"). */
  readonly displayName: string;
  /** Icon used for the platform in the UI. */
  readonly icon: FC<OcticonProps>;
  /** Static or computed capability matrix for this forge. */
  readonly capabilities: ForgeCapabilities;

  /** Fetch the authenticated user (used during login & on refresh). */
  fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData>;

  /** List notifications (already transformed to GitifyNotification). */
  listNotifications(
    account: Account,
    settings: SettingsState,
  ): Promise<GitifyNotification[]>;

  markThreadAsRead(account: Account, threadId: string): Promise<void>;
  markThreadAsDone(account: Account, threadId: string): Promise<void>;
  unsubscribeThread(account: Account, threadId: string): Promise<void>;

  /**
   * Enrich notifications with forge-specific subject details (state, user,
   * comment count, etc.). Optional — forges that do not support detailed
   * enrichment (e.g. Gitea) omit this and the orchestrator returns the input
   * unchanged.
   */
  enrichNotifications?(
    notifications: GitifyNotification[],
    settings: SettingsState,
  ): Promise<GitifyNotification[]>;

  /**
   * GET an arbitrary forge URL and return JSON. Used by notification
   * handlers to follow subject/comment URLs.
   */
  followUrl<T>(account: Account, url: Link): Promise<T>;

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

  /** Whether the account holds the minimum scopes Gitify needs to function. */
  hasRequiredScopes(account: Account): boolean;
  /** Whether the account holds the full recommended scope set. */
  hasRecommendedScopes(account: Account): boolean;
  /** Whether the account holds the alternate (legacy) scope set. */
  hasAlternateScopes(account: Account): boolean;
}
