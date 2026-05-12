import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Account,
  AuthCode,
  Forge,
  Hostname,
  IconColor,
  Link,
  RawGitifyNotification,
  SettingsState,
  Token,
  UserType,
} from '../../types';
import type {
  AuthMethod,
  AuthResponse,
  DeviceFlowSession,
  LoginOAuthWebOptions,
} from '../auth/types';

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
  /**
   * URL to the forge page where the user manages this account's auth method
   * (e.g. tokens, OAuth apps, GitHub Apps). Forges may key this off the
   * account's auth method.
   */
  getAccountSettingsUrl(account: Account): Link;
  /** Login entries rendered in the Login route. */
  loginMethods: ReadonlyArray<LoginMethodDescriptor>;
  /** External documentation link shown in the PAT login route. */
  documentationUrl: Link;
  /**
   * Icon for the given auth method, used in the Accounts list. Adapters that
   * only support a subset of `AuthMethod` should return a sensible fallback
   * (e.g. KeyIcon) for unknown values rather than throwing.
   */
  getAuthMethodIcon(method: AuthMethod): FC<OcticonProps>;

  // --- Auth flows ---
  // Optional because not every forge supports every flow. Gitea today is
  // PAT-only and implements none of these. The orchestrator gates UI on the
  // presence of these methods (and on `loginMethods` entries pointing at
  // `/login-device-flow` or `/login-oauth-app`).

  /**
   * The `AuthMethod` string recorded on the account when a successful device
   * flow login completes. Required when `startDeviceFlow` is provided.
   */
  deviceFlowAuthMethod?: AuthMethod;
  /** Start an OAuth device-flow authorization session. */
  startDeviceFlow?(hostname?: Hostname, scopes?: string[]): Promise<DeviceFlowSession>;
  /** Poll for completion of a device-flow session; resolves to a token when granted. */
  pollDeviceFlow?(session: DeviceFlowSession): Promise<Token | null>;

  /**
   * Custom-OAuth-app web flow. Forges without OAuth-app support (e.g. Gitea)
   * omit this bundle entirely — callers gate the OAuth-app UI on its presence.
   */
  oauthWebApp?: OAuthWebAppSupport;

  /**
   * OAuth scope checks. Forges with no scope concept (e.g. Gitea) omit this
   * bundle entirely — callers should treat `oauthScopes === undefined` as
   * "nothing to verify" and skip any scopes UI rather than render a
   * meaningless "all granted" state.
   */
  oauthScopes?: OAuthScopesSupport;
}

/**
 * OAuth scope-checking capability bundle. Present only on forges with an
 * OAuth scope concept (GitHub today).
 */
export interface OAuthScopesSupport {
  /** Whether the account holds the minimum scopes Gitify needs to function. */
  hasRequired(account: Account): boolean;
  /** Whether the account holds the full recommended scope set. */
  hasRecommended(account: Account): boolean;
  /** Whether the account holds the alternate (legacy) scope set. */
  hasAlternate(account: Account): boolean;
}

/**
 * Custom-OAuth-app web flow capability bundle. Present only on forges that
 * support browser-redirect OAuth with user-supplied client credentials
 * (GitHub today).
 */
export interface OAuthWebAppSupport {
  /** Start the OAuth web flow and return the auth code once the user consents. */
  performWebOAuth(options: LoginOAuthWebOptions): Promise<AuthResponse>;
  /** Exchange an OAuth web-flow authorization code for an access token. */
  exchangeAuthCodeForToken(authCode: AuthCode, options: LoginOAuthWebOptions): Promise<Token>;
  /** Whether the supplied OAuth client ID matches the forge's expected format. */
  validateClientId(clientId: string): boolean;
  /** URL the user visits to create a new OAuth app on the forge. */
  getNewOAuthAppUrl(hostname: Hostname): Link;
}
