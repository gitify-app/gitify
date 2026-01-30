import type { FC } from 'react';

import type { Icon, OcticonProps } from '@primer/octicons-react';

import type { AuthMethod, PlatformType } from './utils/auth/types';

import type {
  DiscussionStateReason,
  IssueState,
  IssueStateReason,
  LabelFieldsFragment,
  MilestoneFieldsFragment,
  PullRequestReviewState,
  PullRequestState,
  ReactionGroupFieldsFragment,
} from './utils/api/graphql/generated/graphql';

declare const __brand: unique symbol;

type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export type AuthCode = Branded<string, 'AuthCode'>;

export type Token = Branded<string, 'Token'>;

export type ClientID = Branded<string, 'ClientID'>;

export type ClientSecret = Branded<string, 'ClientSecret'>;

export type Hostname = Branded<string, 'Hostname'>;

export type Link = Branded<string, 'WebUrl'>;

export type SearchToken = Branded<string, 'SearchToken'>;

export type Status = 'loading' | 'success' | 'error';

export type Percentage = Branded<number, 'Percentage'>;

export type AccountUUID = Branded<string, 'AccountUUID'>;

export interface Account {
  method: AuthMethod;
  platform: PlatformType;
  version?: string;
  hostname: Hostname;
  token: Token;
  user: GitifyUser | null;
  hasRequiredScopes?: boolean;
}

/**
 * All allowed Config and Filter Settings values to be stored in the application.
 */
export type SettingsValue = ConfigSettingsValue | FilterSettingsValue[];

/**
 * All Config Settings values to be stored in the application.
 */
export type ConfigSettingsValue =
  | boolean
  | number
  | FetchType
  | GroupBy
  | OpenPreference
  | Percentage
  | Theme;

/**
 * All Filter Settings values to be stored in the application.
 */
export type FilterSettingsValue =
  | FilterStateType
  | Reason
  | SearchToken
  | SubjectType
  | UserType;

/**
 * All allowed Config and Filter Settings keys to be stored in the application.
 */
export type SettingsState = ConfigSettingsState & FilterSettingsState;

/**
 * All Config Settings keys to be stored in the application.
 */
export type ConfigSettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  TraySettingsState &
  SystemSettingsState;

/**
 * Settings related to the appearance of the application.
 */
export interface AppearanceSettingsState {
  theme: Theme;
  increaseContrast: boolean;
  zoomPercentage: Percentage;
  showAccountHeader: boolean;
  wrapNotificationTitle: boolean;
}

/**
 * Settings related to the notifications within the application.
 */
export interface NotificationSettingsState {
  groupBy: GroupBy;
  fetchType: FetchType;
  fetchInterval: number;
  fetchAllNotifications: boolean;
  detailedNotifications: boolean;
  showPills: boolean;
  showNumber: boolean;
  participating: boolean;
  fetchReadNotifications: boolean;
  markAsDoneOnOpen: boolean;
  markAsDoneOnUnsubscribe: boolean;
  delayNotificationState: boolean;
}

/**
 * Settings related to the tray / menu bar behavior.
 */
export interface TraySettingsState {
  showNotificationsCountInTray: boolean;
  useUnreadActiveIcon: boolean;
  useAlternateIdleIcon: boolean;
}

/**
 * Settings related to the system behavior of the application.
 */
export interface SystemSettingsState {
  openLinks: OpenPreference;
  keyboardShortcut: boolean;
  showNotifications: boolean;
  playSound: boolean;
  notificationVolume: Percentage;
  openAtStartup: boolean;
}

/**
 * Settings related to the filtering of notifications within the application.
 */
export interface FilterSettingsState {
  filterIncludeSearchTokens: SearchToken[];
  filterExcludeSearchTokens: SearchToken[];
  filterUserTypes: UserType[];
  filterSubjectTypes: SubjectType[];
  filterStates: FilterStateType[];
  filterReasons: Reason[];
}

export interface AuthState {
  accounts: Account[];
}

export interface GitifyState {
  auth?: AuthState;
  settings?: SettingsState;
}

export enum Theme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  LIGHT_COLORBLIND = 'LIGHT_COLORBLIND',
  LIGHT_TRITANOPIA = 'LIGHT_TRITANOPIA',
  DARK = 'DARK',
  DARK_COLORBLIND = 'DARK_COLORBLIND',
  DARK_TRITANOPIA = 'DARK_TRITANOPIA',
  DARK_DIMMED = 'DARK_DIMMED',
}

export enum OpenPreference {
  FOREGROUND = 'FOREGROUND',
  BACKGROUND = 'BACKGROUND',
}

export enum GroupBy {
  REPOSITORY = 'REPOSITORY',
  DATE = 'DATE',
}

export enum FetchType {
  INTERVAL = 'INTERVAL',
  INACTIVITY = 'INACTIVITY',
}

export interface RadioGroupItem {
  label: string;
  value: string;
}

export interface AccountNotifications {
  account: Account;
  notifications: GitifyNotification[];
  error: GitifyError | null;
}

export interface GitifyUser {
  login: string;
  name: string | null;
  avatar: Link | null;
  id: string;
}

export interface GitifyError {
  title: string;
  descriptions: string[];
  emojis: string[];
}

export type ErrorType =
  | 'BAD_CREDENTIALS'
  | 'MISSING_SCOPES'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export interface TypeDetails {
  title: string;
  description?: string;
}

export enum IconColor {
  GRAY = 'text-gitify-icon-muted',
  GREEN = 'text-gitify-icon-open',
  PURPLE = 'text-gitify-icon-done',
  RED = 'text-gitify-icon-closed',
  YELLOW = 'text-gitify-icon-attention',
}

export enum Opacity {
  READ = 'opacity-50',
  LOW = 'opacity-70',
  MEDIUM = 'opacity-80',
  HIGH = 'opacity-90',
}

export interface PullRequestApprovalIcon {
  type: FC<OcticonProps>;
  color: IconColor;
  description: string;
}

export enum Size {
  XSMALL = 12,
  SMALL = 14,
  MEDIUM = 16,
  LARGE = 18,
  XLARGE = 20,
}

export interface Chevron {
  icon: FC<OcticonProps>;
  label: string;
}

export type FilterStateType = 'open' | 'closed' | 'merged' | 'draft' | 'other';

/**
 *
 * Gitify Notification Types
 *
 * These types represent the clean, UI-focused notification structure
 * used throughout the application.
 *
 * Raw GitHub API responses are transformed into these types at the API boundary.
 *
 **/

/**
 * Complete notification type for UI consumption.
 * Contains only fields actually used by components.
 */
export interface GitifyNotification {
  /** Unique notification ID from GitHub */
  id: string;
  /** Whether the notification is unread */
  unread: boolean;
  /** When the notification was last updated */
  updatedAt: string;
  /** Reason for receiving the notification */
  reason: GitifyReason;
  /** Subject details (what the notification is about) */
  subject: GitifySubject;
  /** Repository context */
  repository: GitifyRepository;
  /** Account context (for API operations) */
  account: Account;
  /** UI ordering index */
  order: number;
  /** Formatted information for display/presentation to user */
  display: GitifyNotificationDisplay;
}

/**
 * Notification reason details
 */
export interface GitifyReason {
  /** Reason code */
  code: Reason;
  /** Reason title */
  title: string;
  /** Reason description */
  description: string;
}

/**
 * Subject information combining REST and GraphQL enriched data.
 */
export interface GitifySubject {
  /** Subject title */
  title: string;
  /** Subject type (Issue, PullRequest, etc.) */
  type: SubjectType;
  /** API URL for the subject */
  url: Link | null;
  /** API URL for the latest comment */
  latestCommentUrl: Link | null;

  // Enriched fields (from additional GraphQL or REST API calls)
  /** Issue/PR/Discussion number */
  number?: number;
  /** Parsed state */
  state?: GitifyNotificationState;
  /** Latest comment/PR author */
  user?: GitifyNotificationUser;
  /** PR review states & reviewers */
  reviews?: GitifyPullRequestReview[];
  /** PRs closing issues */
  linkedIssues?: string[];
  /** Total comment count */
  commentCount?: number;
  /** Labels names and colors */
  labels?: GitifyLabels[];
  /** Milestone state/title */
  milestone?: GitifyMilestone;
  /** Deep link to notification thread */
  htmlUrl?: Link;
  /** Reaction counts */
  reactionsCount?: number;
  /** Reaction groups */
  reactionGroups?: GitifyReactionGroup[];
}

/**
 * Minimal repository information needed for UI.
 */
export interface GitifyRepository {
  /** Repository name */
  name: string;
  /** Full repository name (owner/repo) */
  fullName: string;
  /** Repository web URL */
  htmlUrl: Link;
  /** Repository owner */
  owner: GitifyOwner;
}

/**
 * Minimal owner information for avatar and navigation.
 */
export interface GitifyOwner {
  /** Owner login name */
  login: string;
  /** Owner avatar URL */
  avatarUrl: Link;
  /** Owner type (User, Organization, Bot, etc.) */
  type: UserType;
}

/**
 * Minimal notification user information.
 */
export interface GitifyNotificationUser {
  /** Notification user login name */
  login: string;
  /**  Notification user avatar URL */
  avatarUrl: Link;
  /**  Notification user html URL */
  htmlUrl: Link;
  /** Notification user type (User, Organization, Bot, etc.) */
  type: UserType;
}

/**
 * Formatted fields ready for display / presentation to the user.
 */
export interface GitifyNotificationDisplay {
  /** Formatted notification title */
  title: string;
  /** Formatted notification type */
  type: string;
  /** Formatted notification number */
  number: string;
  /** Notification icon and color to display */
  icon: {
    type: Icon;
    color: IconColor;
  };
  /** Notification default user type for fallback scenarios */
  defaultUserType: UserType;
}

export type GitifyMilestone = MilestoneFieldsFragment;

export type GitifyReactionGroup = ReactionGroupFieldsFragment;

export type GitifyLabels = LabelFieldsFragment;

export interface GitifyPullRequestReview {
  state: PullRequestReviewState;
  users: string[];
}

export type GitifyDiscussionState = DiscussionStateReason | 'OPEN' | 'ANSWERED';

export type GitifyPullRequestState = PullRequestState | 'DRAFT' | 'MERGE_QUEUE';

export type GitifyIssueState = IssueState | IssueStateReason;

export type GitifyNotificationState =
  | GitifyCheckSuiteStatus
  | GitifyDiscussionState
  | GitifyIssueState
  | GitifyPullRequestState;

export type GitifyCheckSuiteStatus =
  | 'ACTION_REQUIRED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'FAILURE'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'QUEUED'
  | 'REQUESTED'
  | 'SKIPPED'
  | 'STALE'
  | 'SUCCESS'
  | 'TIMED_OUT'
  | 'WAITING';

/**
 *
 * Gitify Type Enhancements
 *
 * These types represent the clean, UI-focused notification structure
 * used throughout the application. Raw GitHub API responses are
 * transformed into these types at the API boundary.
 *
 **/

// Stronger typings for string literal attributes
export type Reason =
  | 'approval_requested'
  | 'assign'
  | 'author'
  | 'ci_activity'
  | 'comment'
  | 'invitation'
  | 'manual'
  | 'member_feature_requested'
  | 'mention'
  | 'review_requested'
  | 'security_advisory_credit'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention';

export type SubjectType =
  | 'CheckSuite'
  | 'Commit'
  | 'Discussion'
  | 'Issue'
  | 'PullRequest'
  | 'Release'
  | 'RepositoryDependabotAlertsThread'
  | 'RepositoryInvitation'
  | 'RepositoryVulnerabilityAlert'
  | 'WorkflowRun';

export type UserType =
  | 'Bot'
  | 'EnterpriseUserAccount'
  | 'Mannequin'
  | 'Organization'
  | 'User';
