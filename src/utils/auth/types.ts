import type {
  AuthCode,
  ClientID,
  ClientSecret,
  Hostname,
  Token,
  Username,
  Workspace,
} from '../../types';

export type AuthMethod =
  | 'GitHub App'
  | 'Personal Access Token'
  | 'OAuth App'
  | 'App Password';

export type PlatformType =
  | 'GitHub Cloud'
  | 'GitHub Enterprise Server'
  | 'Bitbucket Cloud';

export interface LoginOAuthAppOptions {
  hostname: Hostname;
  clientId: ClientID;
  clientSecret: ClientSecret;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: Hostname;
  token: Token;
}

export interface LoginBitbucketCloudOptions {
  username: Username;
  token: Token;
  workspace: Workspace;
}

export interface AuthResponse {
  authCode: AuthCode;
  authOptions: LoginOAuthAppOptions;
}

export interface AuthTokenResponse {
  hostname: Hostname;
  token: Token;
}

/**
 * @deprecated This type is deprecated and will be removed in a future release.
 */
export interface EnterpriseAccount {
  hostname: Hostname;
  token: Token;
}
