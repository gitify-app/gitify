import type { ClientID, Forge, Hostname, Token } from '../../types';

export type AuthMethod =
  | 'Gitify OAuth App'
  | 'Custom OAuth App'
  | 'GitHub CLI'
  | 'Personal Access Token';

export type PlatformType =
  | 'Bitbucket Cloud'
  | 'GitHub Cloud'
  | 'GitHub Enterprise Server'
  | 'GitHub Enterprise Cloud with Data Residency'
  | 'GitLab Cloud'
  | 'GitLab Self-Managed'
  | 'Gitea';

export interface DeviceFlowSession {
  hostname: Hostname;
  clientId: ClientID;
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  intervalSeconds: number;
  expiresAt: number;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: Hostname;
  token: Token;
  /** Atlassian account email — required for Bitbucket Basic Auth. */
  username?: string;
  /** Defaults to GitHub when omitted. */
  forge?: Forge;
}
