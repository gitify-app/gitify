/**
 * Subset of Gitea `modules/structs` notification and repository types (JSON field names).
 *
 * @see https://github.com/go-gitea/gitea/blob/main/modules/structs/notifications.go
 */

export type GiteaNotifySubjectType = 'Issue' | 'Pull' | 'Commit' | 'Repository';

export interface GiteaNotificationSubject {
  title: string;
  url: string;
  latest_comment_url?: string;
  html_url: string;
  latest_comment_html_url?: string;
  type: GiteaNotifySubjectType;
  state?: string;
}

export interface GiteaUser {
  id: number;
  login: string;
  full_name?: string;
  avatar_url?: string;
}

export interface GiteaRepository {
  id: number;
  owner?: GiteaUser;
  name: string;
  full_name: string;
  html_url: string;
  url?: string;
}

/** Gitea `NotificationThread` API model */
export interface GiteaNotificationThread {
  id: number;
  repository?: GiteaRepository;
  subject?: GiteaNotificationSubject;
  unread: boolean;
  pinned?: boolean;
  updated_at: string;
  url: string;
}
