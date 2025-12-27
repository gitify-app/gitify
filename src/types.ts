import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Notification,
  Reason,
  SubjectType,
  UserType,
} from './typesGitHub';
import type {
  AuthorFieldsFragment,
  DiscussionStateReason,
  IssueState,
  IssueStateReason,
  MilestoneFieldsFragment,
  PullRequestReviewState,
  PullRequestState,
} from './utils/api/graphql/generated/graphql';
import type { AuthMethod, PlatformType } from './utils/auth/types';

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
  notifications: Notification[];
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
 **/

export interface GitifyNotification {
  account: Account;
  order: number;
}

export interface GitifySubject {
  number?: number;
  state?: GitifyNotificationState;
  user?: GitifyNotificationUser;
  reviews?: GitifyPullRequestReview[];
  linkedIssues?: string[];
  comments?: number;
  labels?: string[];
  milestone?: MilestoneFieldsFragment;
  htmlUrl?: Link;
}

export type GitifyNotificationUser = AuthorFieldsFragment;

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
