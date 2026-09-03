import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Account,
  AuthCode,
  Forge,
  Hostname,
  IconColor,
  GitifyNotificationUser,
  Link,
  RawGitifyNotification,
  Token,
  UserType,
} from '../../types';
import type {
  AuthMethod,
  AuthResponse,
  DeviceFlowSession,
  LoginOAuthWebOptions,
  PlatformType,
} from '../auth/types';

/**
 * Capability flags exposed by a forge adapter.
 *
 * Each capability is a function over the account because for some forges (e.g.
 * GitHub Enterprise Server) capabilities depend on the hostname and version.
 */
export type ForgeCapabilities = ForgeAccountOperations['capabilities'];

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
  /** Forge-specific route to navigate to (e.g. `/login/github/device-flow`). */
  route: string;
  /**
   * Auth method recorded on accounts created via this login method. Used to
   * route re-authentication back to the matching login route.
   */
  authMethod: AuthMethod;
}

/**
 * The contract every forge adapter must implement.
 *
 * Goal: shared code (notifications orchestrator, hooks, UI) routes through
 * `getAdapter(forge)` for forge-wide members and `forAccount(account)` for
 * account-scoped operations, and never imports forge-specific modules
 * directly.
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

  /**
   * Operations that act on behalf of one account. Shared code never calls
   * these directly: it obtains an account-bound view via `forAccount(account)`
   * from the registry, which supplies the account to every call.
   */
  readonly accountOps: ForgeAccountOperations;

  /**
   * Resolve the platform label (e.g. "GitHub Cloud") for a given hostname.
   * Forges like GitHub vary by hostname; others report a single platform.
   */
  getPlatform(hostname: Hostname): PlatformType;

  /**
   * Format an authenticated user login according to the forge's display convention.
   */
  formatUserLogin(login: string): string;

  /**
   * Enrich notifications with forge-specific subject details (state, user,
   * comment count, etc.). Optional — forges that do not support detailed
   * enrichment (e.g. Gitea) omit this and the orchestrator returns the input
   * unchanged.
   *
   * Implementations must return notifications in input order, and must return
   * a notification whose detail fetch failed with its original `subject`
   * reference unchanged, so callers can detect the failure (e.g. to avoid
   * caching base details as if they were enriched).
   *
   * @see ../notifications/notifications.ts `enrichNotifications` — orchestrator
   *      that delegates here when the user has detailed notifications enabled.
   */
  enrichNotifications?(notifications: RawGitifyNotification[]): Promise<RawGitifyNotification[]>;

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
  // PAT-only and omits both bundles. The orchestrator gates UI on the
  // presence of these bundles (and on `loginMethods` entries pointing at
  // the forge's device-flow or OAuth-app routes).

  /**
   * OAuth device-flow capability. Forges without device-flow support (e.g.
   * Gitea) omit this bundle entirely — callers gate the device-flow UI on
   * its presence.
   */
  deviceFlow?: DeviceFlowSupport;

  /**
   * Custom-OAuth-app web flow. Forges without OAuth-app support (e.g. Gitea)
   * omit this bundle entirely — callers gate the OAuth-app UI on its presence.
   */
  oauthWebApp?: OAuthWebAppSupport;
}

/**
 * The account-bound view of a forge adapter, obtained via `forAccount(account)`.
 *
 * Every member acts on the account the view was created for, so none of them
 * take an account parameter. A view holds the account it was bound to, and the
 * store replaces account objects when their token rotates, so create a view at
 * the call site rather than keeping one around.
 */
export interface ForgeAccountAdapter {
  /** Capability matrix for the account's forge and host. */
  readonly capabilities: {
    /** Whether the forge supports a "mark as done" action distinct from "mark as read". */
    markAsDone(): boolean;
    /** Whether the forge supports ignoring a thread's subscription (unsubscribe). */
    unsubscribeThread(): boolean;
  };

  /** Format a notification actor for display (e.g. bots, managed users) according to forge identity conventions. */
  formatNotificationUser(user: GitifyNotificationUser): string;

  /** Fetch the authenticated user (used during login & on refresh). */
  fetchAuthenticatedUser(): Promise<RefreshAccountData>;

  /**
   * Optional lifecycle hook called when the account's token rotates. Forges
   * with HTTP client caches (e.g. GitHub Octokit) drop their cache here.
   */
  onAccountTokenChange?(): void;

  /**
   * List notifications already transformed to the shared shape. Returns
   * `RawGitifyNotification[]`; `display` is populated later by the
   * orchestrator's `formatNotification` step.
   */
  listNotifications(): Promise<RawGitifyNotification[]>;

  markThreadAsRead(threadId: string): Promise<void>;
  markThreadAsDone(threadId: string): Promise<void>;
  unsubscribeThread(threadId: string): Promise<void>;

  /**
   * GET an arbitrary forge URL and return JSON. Used by notification
   * handlers to follow subject/comment URLs.
   */
  followUrl<T>(url: Link): Promise<T>;

  /**
   * URL to the forge page where the user manages this account's auth method
   * (e.g. tokens, OAuth apps, GitHub Apps). Forges may key this off the
   * account's auth method.
   */
  getAccountSettingsUrl(): Link;
  /** URL to the forge's "my issues" list for the account's host. */
  getIssuesUrl(): Link;
  /** URL to the forge's "my pull requests" list for the account's host. */
  getPullRequestsUrl(): Link;
  /** URL to the forge's notification centre for the account's host. */
  getNotificationsUrl(): Link;

  /**
   * OAuth scope checks. Forges with no scope concept (e.g. Gitea) omit this
   * bundle entirely; callers should treat `oauthScopes === undefined` as
   * "nothing to verify" and skip any scopes UI rather than render a
   * meaningless "all granted" state.
   */
  readonly oauthScopes?: {
    /** Whether the account holds the minimum scopes Gitify needs to function. */
    hasRequired(): boolean;
    /** Whether the account holds the full recommended scope set. */
    hasRecommended(): boolean;
    /** Whether the account holds the alternate (legacy) scope set. */
    hasAlternate(): boolean;
  };
}

/**
 * Maps one member of {@link ForgeAccountAdapter} to its implementation shape:
 * functions gain `account` as their first parameter, nested bundles are mapped
 * recursively, and anything else is left as is.
 */
type WithAccountMember<M> = M extends (...args: infer A) => infer R
  ? (account: Account, ...args: A) => R
  : M extends object
    ? WithAccount<M>
    : M;

export type WithAccount<T> = { [K in keyof T]: WithAccountMember<T[K]> };

/**
 * Implementation-side shape of {@link ForgeAccountAdapter}: the same members
 * with the account passed explicitly. Adapters implement this under
 * `accountOps`; `forAccount(account)` binds it into a `ForgeAccountAdapter`.
 */
export type ForgeAccountOperations = WithAccount<ForgeAccountAdapter>;

/**
 * OAuth scope-checking capability bundle. Present only on forges with an
 * OAuth scope concept (GitHub today).
 */
export type OAuthScopesSupport = NonNullable<ForgeAccountOperations['oauthScopes']>;

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

/**
 * OAuth device-flow capability bundle. Present only on forges that support
 * browser-side device authorisation (GitHub today).
 */
export interface DeviceFlowSupport {
  /** `AuthMethod` recorded on the account when a successful login completes. */
  authMethod: AuthMethod;
  /** Start a device-flow authorization session. */
  start(hostname?: Hostname, scopes?: string[]): Promise<DeviceFlowSession>;
  /** Poll for completion; resolves to a token when granted. */
  poll(session: DeviceFlowSession): Promise<Token | null>;
  /** URL the user visits to revoke Gitify's access on this forge. */
  getRevokeAccessUrl(hostname: Hostname): Link;
}
