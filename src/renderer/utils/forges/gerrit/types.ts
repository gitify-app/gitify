/**
 * Subset of the Gerrit Code Review REST API JSON entities used by this
 * adapter. Field names follow the JSON shape returned by the Gerrit REST API
 * (snake_case, as documented).
 *
 * @see https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html
 * @see https://gerrit-review.googlesource.com/Documentation/rest-api-accounts.html
 * @see https://gerrit-review.googlesource.com/Documentation/rest-api-config.html
 */

/** `ChangeInfo.status` — Gerrit has no "draft"/"WIP" status; that's the separate `work_in_progress` flag. */
export type GerritChangeStatus = 'NEW' | 'MERGED' | 'ABANDONED';

/**
 * Subset of `AccountInfo`.
 *
 * `name`/`email`/`username`/`display_name` are only populated when the
 * request includes `DETAILED_ACCOUNTS` (or for the calling user's own
 * `self` account, which Gerrit always returns in full).
 */
export interface GerritAccountInfo {
  _account_id: number;
  name?: string;
  display_name?: string;
  email?: string;
  username?: string;
  avatars?: GerritAvatarInfo[];
}

export interface GerritAvatarInfo {
  url: string;
  height: number;
}

/** Entry in `ChangeInfo.attention_set`, keyed by account id. */
export interface GerritAttentionSetInfo {
  account: GerritAccountInfo;
  last_update: string;
  reason: string;
}

/**
 * Subset of `ChangeInfo` — only the fields this adapter maps onto a
 * `RawGitifyNotification`.
 */
export interface GerritChangeInfo {
  /** `<project>~<_number>`, URL-encoded. Stable id, safe to use as the {change-id} path segment on subsequent requests. */
  id: string;
  project: string;
  branch: string;
  change_id: string;
  subject: string;
  status: GerritChangeStatus;
  /** Gerrit timestamp format: `"yyyy-MM-dd HH:mm:ss.fffffffff"`, always UTC. */
  created: string;
  updated: string;
  _number: number;
  owner: GerritAccountInfo;
  work_in_progress?: boolean;
  is_private?: boolean;
  /** Present when this change matched an `attention:self`-style query — maps account id (as string key) to attention-set metadata. */
  attention_set?: Record<string, GerritAttentionSetInfo>;
  /** Set on the last change of a page when more results are available. */
  _more_changes?: boolean;
}

/** Verbose response shape for `GET /config/server/version?verbose`. */
export interface GerritServerVersionInfo {
  gerrit_version: string;
}
