import type { AuthCode, ClientID, ClientSecret, Forge, Hostname, Token } from '../../types';

export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType =
  | 'Bitbucket Cloud'
  | 'GitHub Cloud'
  | 'GitHub Enterprise Server'
  | 'GitHub Enterprise Cloud with Data Residency'
  | 'Gitea';

export interface LoginOAuthWebOptions {
  hostname: Hostname;
  clientId: ClientID;
  clientSecret: ClientSecret;
}

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

export interface AuthResponse {
  authMethod: AuthMethod;
  authCode: AuthCode;
  authOptions: LoginOAuthWebOptions;
}
