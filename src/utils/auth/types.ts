export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType = 'GitHub Cloud' | 'GitHub Enterprise Server';

export interface AuthOptionsOAuthApp {
  hostname: string;
  clientId: string;
  clientSecret: string;
}

export interface AuthOptionsPersonalAccessToken {
  hostname: string;
  token: string;
}

export interface AuthResponse {
  authCode: string;
  authOptions: AuthOptionsOAuthApp;
}

export interface AuthTokenResponse {
  hostname: string;
  token: string;
}

/**
 * @deprecated This type is deprecated and will be removed in a future release.
 */
export interface EnterpriseAccount {
  hostname: string;
  token: string;
}
