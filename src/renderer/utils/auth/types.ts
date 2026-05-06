import type {
  AuthCode,
  ClientID,
  ClientSecret,
  Forge,
  Hostname,
  Token,
} from '../../types';

export type AuthMethod = 'GitHub App' | 'Personal Access Token' | 'OAuth App';

export type PlatformType =
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

export type DeviceFlowErrorResponse = {
  error: string;
  error_description: string;
  error_uri: string;
};

export interface LoginPersonalAccessTokenOptions {
  hostname: Hostname;
  token: Token;
  /** Defaults to GitHub when omitted. */
  forge?: Forge;
}

export interface AuthResponse {
  authMethod: AuthMethod;
  authCode: AuthCode;
  authOptions: LoginOAuthWebOptions;
}
