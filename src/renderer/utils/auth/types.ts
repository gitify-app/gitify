import type {
  AuthCode,
  ClientID,
  ClientSecret,
  Hostname,
  Token,
} from '../../types';

export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType = 'GitHub Cloud' | 'GitHub Enterprise Server';

export interface LoginOAuthAppOptions {
  hostname: Hostname;
  clientId: ClientID;
  clientSecret: ClientSecret;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: Hostname;
  token: Token;
}

export interface AuthResponse {
  authCode: AuthCode;
  authOptions: LoginOAuthAppOptions;
}

export interface AuthTokenResponse {
  hostname: Hostname;
  token: Token;
}
