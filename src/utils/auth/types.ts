import type { ClientID, ClientSecret, HostName, Token } from '../branded-types';

export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType = 'GitHub Cloud' | 'GitHub Enterprise Server';

export interface LoginOAuthAppOptions {
  hostname: HostName;
  clientId: string;
  clientSecret: string;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: HostName;
  token: string;
}

export interface AuthResponse {
  authCode: string;
  authOptions: LoginOAuthAppOptions;
}

export interface AuthTokenResponse {
  hostname: HostName;
  token: string;
}

/**
 * @deprecated This type is deprecated and will be removed in a future release.
 */
export interface EnterpriseAccount {
  hostname: HostName;
  token: string;
}
