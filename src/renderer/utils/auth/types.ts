import type {
  AuthCode,
  ClientID,
  ClientSecret,
  Hostname,
  Token,
} from '../../types';

export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType = 'GitHub Cloud' | 'GitHub Enterprise Server';

export interface LoginOAuthDeviceOptions {
  hostname: Hostname;
  clientId: ClientID;
}

export interface LoginOAuthWebOptions {
  hostname: Hostname;
  clientId: ClientID;
  clientSecret: ClientSecret;
}

export interface LoginPersonalAccessTokenOptions {
  hostname: Hostname;
  token: Token;
}

export interface AuthResponse {
  authMethod: AuthMethod;
  authCode: AuthCode;
  authOptions: LoginOAuthWebOptions;
}
